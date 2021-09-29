/*
 |   renderer-main.js
 |----------------
 |  renderer-main.js is copyright Patrick Rhodes Martin 2014-2021.
 |
 |-
 */
//@include [util.js]
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
//@include [subtitle-parser.js]
//@include [scheduler.js]
//@include [canvas-2d-text-renderer.js]
//@include [canvas-2d-shape-renderer.js]
sabre.import("util.min.js");
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre.import("subtitle-event.min.js");
sabre.import("subtitle-parser.min.js");
sabre.import("scheduler.min.js");
sabre.import("canvas-2d-text-renderer.min.js");
sabre.import("canvas-2d-shape-renderer.min.js");
/**
 * @fileoverview webgl subtitle compositing code.
 */
/**
 * Fixes JSON
 * @private
 * @param {string} key the key of the field of the object.
 * @param {*} value the value of the field of the object.
 * @returns {*}
 */
const jsonFix = function (key, value) {
    if (value === null) return "null";
    else if (typeof value === "number" && global.isNaN(value)) return "NaN";
    return value;
};
const renderer_prototype = global.Object.create(Object, {
    //BEGIN MODULE VARIABLES

    _scheduler: {
        /** @type {?SubtitleScheduler} */
        value: null,
        writable: true
    },

    _textRenderer: {
        /** @type {?Canvas2DTextRenderer} */
        value: null,
        writable: true
    },

    _shapeRenderer: {
        /** @type {?Canvas2DShapeRenderer} */
        value: null,
        writable: true
    },

    //END MODULE VARIABLES
    //BEGIN LOCAL VARIABLES

    _compositingCanvas: {
        /** @type{?HTMLCanvasElement|?OffscreenCanvas} */
        value: null,
        writable: true
    },

    _gl: {
        /** @type{?WebGL2RenderingContext} */
        value: null,
        writable: false
    },

    _lastTime: {
        /**
         * @type {number}
         */
        value: -1,
        writable: true
    },

    _lastHash: {
        /**
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _lastOutput: {
        /**
         * @type {?string}
         */
        value: null,
        writable: true
    },

    //END LOCAL VARIABLES
    //BEGIN LOCAL FUNCTIONS

    _hashEvents: {
        /**
         * Hashes a list of subtitle events.
         * @private
         * @param {Array<SSASubtitleEvent>} events list of subtitle events to hash.
         * @returns {number} The Hash of the events.
         */
        value: function (events) {
            let str_rep = JSON.stringify(events, jsonFix);
            let hash = 0,
                i,
                chr;
            if (str_rep.length === 0) return hash;
            for (i = 0; i < str_rep.length; i++) {
                chr = str_rep.charCodeAt(i);
                hash = (hash << 5) - hash + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        writable: false
    },

    _rectangleOffset: {
        value: function (x1, y1, w1, h1, x2, y2, w2, h2) {
            var m = [0, 0];
            if (x1 >= x2 && x1 < x2 + w2 && y1 >= y2 && y1 < y2 + h2) {
                if (
                    Math.pow(x1 + w1 - x2, 2) + Math.pow(y1 + h1 - y2, 2) <
                    Math.pow(x2 + w2 - x1, 2) + Math.pow(y2 + h2 - y1, 2)
                ) {
                    m = [-(x1 + w1 - x2), -(y1 + h1 - y2)];
                } else {
                    m = [-(x2 + w2 - x1), -(y2 + h2 - y1)];
                }
            } else if (x2 >= x1 && x2 < x1 + w1 && y2 >= y1 && y2 < y1 + h1) {
                if (
                    Math.pow(x2 + w2 - x1, 2) + Math.pow(y2 + h2 - y1, 2) <
                    Math.pow(x1 + w1 - x2, 2) + Math.pow(y1 + h1 - y2, 2)
                ) {
                    m = [-(x2 + w2 - x1), -(y2 + h2 - y1)];
                } else {
                    m = [-(x1 + w1 - x2), -(y1 + h1 - y2)];
                }
            } else {
                return null;
            }
            return m;
        },
        writable: false
    },

    _getBlurKernelValueForPosition: {
        value: function (center_value, x, y, dim, intgr) {
            let value = Math.max(
                center_value -
                    Math.sqrt(
                        Math.pow(x - (dim - 1) / 2, 2) +
                            Math.pow(y - (dim - 1) / 2, 2)
                    ),
                0
            );
            if (intgr) value = Math.floor(value);
            return value;
        },
        writable: false
    },

    _calcEdgeBlur: {
        /**
         * Calc blur iterations, handing transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function (time, style, overrides) {
            let transitionOverrides = overrides.getTransition();
            let iterations = overrides.getEdgeBlur() ?? 0;
            if (transitionOverrides !== null)
                iterations = sabre.performTransition(
                    time,
                    iterations,
                    transitionOverrides.getEdgeBlur(),
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
            return iterations;
        },
        writable: false
    },

    _positionEvent: {
        /**
         * Positions the event.
         * @private
         * @param {number} time time of the current frame.
         * @param {SSASubtitleEvent} event the current event we're positioning.
         * @param {{hoffset:number,voffset:number}} textAnchorOffset the offset from the anchor point of the text.
         * @returns {{x:number,y:number,width:number,height:number}} the positioning info of the event.
         */
        value: function (time, event, textAnchor) {
            let result = { x: 0, y: 0, width: 0, height: 0 };
            let lineOverrides = event.getLineOverrides();
            if (!event.getOverrides().getDrawingMode()) {
                this._textRenderer.renderEvent(
                    time,
                    event,
                    sabre.RenderPasses.FILL,
                    textAnchor,
                    this._config.renderer["resolution_x"],
                    true
                );
                let dim = this._textRenderer.getDimensions();
                if (
                    lineOverrides.getPosition() === null &&
                    lineOverrides.getMovement() === null
                ) {
                    let anchorPoint = [0, 0];
                    let alignment = event.getOverrides().getAlignment() - 1;
                    switch (Math.floor(alignment / 3)) {
                        case 2:
                            //TOP
                            anchorPoint[1] = 0;
                            break;
                        case 1:
                            //MIDDLE
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"] -
                                dim[1] / 2;
                            break;
                        case 0:
                            //BOTTOM
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"] - dim[1];
                            break;
                    }
                    switch (Math.floor(alignment % 3)) {
                        case 2:
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] - dim[0];
                        case 1:
                            //CENTER
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] / 2 -
                                dim[0] / 2;
                            break;
                        case 0:
                            //LEFT
                            //Nothing needs to be done, the x coordinate is already zero.
                            break;
                    }
                    result.x = anchorPoint[0];
                    result.y = anchorPoint[1];
                } else {
                    let curPos = [0, 0];
                    if (lineOverrides.getMovement() === null) {
                        curPos = lineOverrides.getPosition();
                    } else {
                        let move = lineOverrides.getMovement();
                        curPos[0] = sabre.performTransition(
                            time,
                            move[0],
                            move[2],
                            move[4],
                            move[5],
                            1
                        );
                        curPos[1] = sabre.performTransition(
                            time,
                            move[1],
                            move[3],
                            move[4],
                            move[5],
                            1
                        );
                    }
                    result.x = curPos[0];
                    result.y = curPos[1];
                }
                result.width = dim[0];
                result.height = dim[1];
            } else {
                this._shapeRenderer.renderEvent(
                    time,
                    event,
                    sabre.RenderPasses.FILL,
                    textAnchor,
                    this._config.renderer["resolution_x"],
                    true
                );
                let dim = this._shapeRenderer.getDimensions();
                if (
                    lineOverrides.getPosition() === null &&
                    lineOverrides.getMovement() === null
                ) {
                    let anchorPoint = [0, 0];
                    let alignment = event.getOverrides().getAlignment() - 1;
                    switch (Math.floor(alignment / 3)) {
                        case 2:
                            //TOP
                            anchorPoint[1] = 0;
                            break;
                        case 1:
                            //MIDDLE
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"] -
                                dim[1] / 2;
                            break;
                        case 0:
                            //BOTTOM
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"] - dim[1];
                            break;
                    }
                    switch (Math.floor(alignment % 3)) {
                        case 2:
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] - dim[0];
                        case 1:
                            //CENTER
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] / 2 -
                                dim[0] / 2;
                            break;
                        case 0:
                            //LEFT
                            //Nothing needs to be done, the x coordinate is already zero.
                            break;
                    }
                    result.x = anchorPoint[0];
                    result.y = anchorPoint[1];
                } else {
                    let curPos = [0, 0];
                    if (lineOverrides.getMovement() === null) {
                        curPos = lineOverrides.getPosition();
                    } else {
                        let move = lineOverrides.getMovement();
                        curPos[0] = sabre.performTransition(
                            time,
                            move[0],
                            move[2],
                            move[4],
                            move[5],
                            1
                        );
                        curPos[1] = sabre.performTransition(
                            time,
                            move[1],
                            move[3],
                            move[4],
                            move[5],
                            1
                        );
                    }
                    result.x = curPos[0];
                    result.y = curPos[1];
                }
                result.width = dim[0];
                result.height = dim[1];
            }
        },
        writable: false
    },

    _collideEvent: {
        /**
         * Collides two events.
         * @private
         * @param {{x:number,y:number,width:number,height:number}} positionInfo1 current event's position info.
         * @param {Array<{x:number,y:number,width:number,height:number}>} posInfosForMatchingId1 position infos for events who's id matches the current event's id.
         * @param {{x:number,y:number,width:number,height:number}} positionInfo2 the position info of the event we're colliding with.
         * @param {Array<{x:number,y:number,width:number,height:number}>} posInfosForMatchingId2 position infos for events who's id matches the colliding event's id.
         * @returns {boolean} did we move something?
         */
        value: function (
            positionInfo1,
            posInfosForMatchingId1,
            positionInfo2,
            posInfosForMatchingId2
        ) {
            let overlap = this._rectangleOffset(
                positionInfo1.x,
                positionInfo1.y,
                positionInfo1.width,
                positionInfo1.height,
                positionInfo2.x,
                positionInfo2.y,
                positionInfo2.width,
                positionInfo2.height
            );
            if (overlap !== null) {
                if (
                    this._config.renderer["default_collision_mode"] ===
                    sabre.CollisionModes.NORMAL
                ) {
                    if (overlap[1] < 0) {
                        for (
                            let i = 0;
                            i < posInfosForMatchingId2.length;
                            i++
                        ) {
                            posInfosForMatchingId2[i].y -= positionInfo1.height;
                            posInfosForMatchingId;
                        }
                    } else {
                    }
                } else {
                }
                return true;
            }
            return false;
        }
    },

    _collideEventWithViewport: {
        /**
         * Collides an event with the viewport.
         * @private
         * @param {{x:number,y:number,width:number,height:number}} positionInfo current event's position info.
         * @param {Array<{x:number,y:number,width:number,height:number}>} posInfosForMatchingId position infos for events who's id matches the current event's id.
         * @returns {boolean} did we move something?
         */
        value: function (positionInfo, posInfosForMatchingId) {},
        writable: false
    },

    _organizeEvents: {
        /**
         * Positions events onscreen and handles collisions.
         * @private
         * @param {number} time time of current frame.
         * @param {Array<SSASubtitleEvent>} events list of onscreen subtitle events for this frame in order of layer.
         * @returns {Array<{x:number,y:number,width:number,height:number,moveup:boolean}>} each event's position onscreen.
         */
        value: function (time, events) {
            let result = new Array(events.length);
            let resultsForId = {};
            {
                let lastId = -1;
                let textAnchor = { hoffset: 0, voffset: 0 };
                for (let i = 0; i < events.length; i++) {
                    let id = events[i].getId();
                    resultsForId[id] = resultsForId[id] ?? [];
                    if (id !== lastId) {
                        textAnchor.voffset = 0;
                        textAnchor.hoffset = 0;
                    }
                    result[i] = this._positionEvent(
                        time,
                        events[i],
                        textAnchor
                    );
                    resultsForId[id].push(result[i]);
                    lastId = id;
                }
            }
            let moved = false;
            let count = 0;
            do {
                for (let i = 0; i < events.length; i++) {
                    if (result[i].width === 0 || result[i].height === 0)
                        continue;
                    if (
                        events[i].getLineOverrides().getPosition() !== null ||
                        events[i].getLineOverrides().getMovement() !== null
                    )
                        continue;
                    let id = events[i].getId();
                    moved |= this._collideEventWithViewport(
                        result[i],
                        resultsForId[id]
                    );
                    for (let j = 0; j < events.length; j++) {
                        if (events[j].getLayer() !== events[i].getLayer())
                            continue;
                        let id2 = events[j].getId();
                        if (id2 === id) continue;
                        if (result[j].width === 0 || result[j].height === 0)
                            continue;
                        if (
                            events[j].getLineOverrides().getPosition() !==
                                null ||
                            events[j].getLineOverrides().getMovement() !== null
                        )
                            continue;
                        moved |= this._collideEvent(
                            result[i],
                            resultsForId[id],
                            result[j],
                            resultsForId[id2]
                        );
                    }
                }
                count++;
            } while (moved && count < 200);
            return result;
        },
        writable: false
    },

    //END LOCAL FUNCTIONS
    //BEGIN PUBLIC FUNCTIONS

    init: {
        /**
         * Initializes the renderer.
         * @returns {void}
         */
        value: function () {
            this._scheduler = new sabre.SubtitleScheduler();
            this._textRenderer = new sabre.Canvas2DTextRenderer();
            this._shapeRenderer = new sabre.Canvas2DShapeRenderer();
        },
        writable: false
    },

    "load": {
        /**
         * Load the configuration for the renderer and do any follow-up steps.
         * @param {{info:Object,parser:Object,renderer:Object,events:Array<SSASubtitleEvent>}} config configuration for the renderer.
         * @returns {void}
         */
        value: function (config) {
            this._config = config;
            this._scheduler.setEvents(
                /** @type {Array<SSASubtitleEvent>} */ (config.events)
            );
            const options = Object.freeze({
                "alpha": true,
                "desynchronized": true,
                "antialias": true,
                "powerPreference": "high-performance",
                "premultipliedAlpha": true
            });
            if (typeof global.OffscreenCanvas === "undefined") {
                this._compositingCanvas = global.document.createElement(
                    "canvas"
                );
                this._compositingCanvas.width = config.renderer["resolution_x"];
                this._compositingCanvas.height =
                    config.renderer["resolution_y"];
            } else {
                this._compositingCanvas = new global.OffscreenCanvas(
                    config.renderer["resolution_x"],
                    config.renderer["resolution_y"]
                );
            }
            this._gl = this._compositingCanvas.getContext("webgl2", options);
            this._gl.viewport(
                0,
                0,
                config.renderer["resolution_x"],
                config.renderer["resolution_y"]
            );
        },
        writable: false
    },

    "updateViewport": {
        /**
         * Update the size of the compositing canvas and base rendering scale.
         * @param {number} width the new width of the output.
         * @param {number} height the new height of the output.
         * @returns {void}
         */
        value: function (width, height) {
            this._compositingCanvas.width = width;
            this._compositingCanvas.height = height;

            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
            );
        },
        writable: false
    },

    "frame": {
        /**
         * Render one frame.
         * @param {number} time the current frame time.
         * @returns {void}
         */
        value: function (time) {
            if (time === this._lastTime) return;
            this._lastTime = time;
            let events = this._scheduler.getVisibleAtTime(time);
            events = events.sort(function (
                /** SSASubtitleEvent */ a,
                /** SSASubtitleEvent */ b
            ) {
                let ldiff = a.getLayer() - b.getLayer();
                if (ldiff === 0) return a.getId() - b.getId();
                else return ldiff;
            });
            let currentHash = this._hashEvents(events);
            if (currentHash === this._lastHash) return;
            this._lastHash = currentHash;
            this._gl.clear(
                this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
            );
            let positions = this._organizeEvents(time, events);
            for (let pass = 0; pass < 3; pass++) {
                //One pass for background, one for outline and one for text.
                for (let i = 0; i < events.length; i++) {
                    let currentEvent = events[i];
                    if (!currentEvent.getOverrides().getDrawingMode()) {
                        this._textRenderer.renderEvent(
                            time,
                            currentEvent,
                            pass,
                            false
                        );
                        //TODO: Composite Text into image. Applying rotation and then edge blur and gaussian blur as needed.
                    } else {
                        this._shapeRenderer.renderEvent(
                            time,
                            currentEvent,
                            pass,
                            false
                        );
                        //TODO: Composite Graphics into image. Applying rotation and then edge blur and gaussian blur as needed.
                    }
                }
            }
        },
        writable: false
    },

    "getDisplayUri": {
        /**
         * Get the frame output.
         * @returns {string} The ObjectURL of the display output.
         */
        value: function () {
            let output = global.URL.createObjectURL(
                this._compositingCanvas.toBlobHD()
            );
            if (this._lastOutput !== null)
                global.URL.revokeObjectURL(this._lastOutput);
            this._lastOutput = output;
            return output;
        },
        writable: false
    }

    //END PUBLIC FUNCTIONS
});

sabre["Renderer"] = function () {
    let renderer = global.Object.create(renderer_prototype);
    renderer.init();
    return renderer;
};
