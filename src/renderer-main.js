/*
 |   renderer-main.js
 |----------------
 |  renderer-main.js is copyright Patrick Rhodes Martin 2014-2021.
 |
 |-
 */
//@include [util.js]
//@include [global-constants.js]
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
//@include [subtitle-parser.js]
//@include [scheduler.js]
//@include [canvas-2d-text-renderer.js]
//@include [canvas-2d-shape-renderer.js]
//@include [shader.js]
sabre.import("util.min.js");
sabre.import("global-constants.min.js");
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre.import("subtitle-event.min.js");
sabre.import("subtitle-parser.min.js");
sabre.import("scheduler.min.js");
sabre.import("shader.min.js");
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

    //BEGIN WEBGL VARIABLES

    _gl: {
        /** @type{?WebGL2RenderingContext} */
        value: null,
        writable: true
    },

    _textureCoordinatesBuffer: {
        /** @type{?WebGLBuffer} */
        value: null,
        writable: true
    },

    _subtitlePositioningBuffer: {
        /** @type{?WebGLBuffer} */
        value: null,
        writable: true
    },

    _fullscreenPositioningBuffer: {
        /** @type{?WebGLBuffer} */
        value: null,
        writable: true
    },

    _textureSubtitle: {
        /** @type{?WebGLTexture} */
        value: null,
        writable: true
    },

    _fbTextureA: {
        /** @type{?WebGLTexture} */
        value: null,
        writable: true
    },

    _fbTextureB: {
        /** @type{?WebGLTexture} */
        value: null,
        writable: true
    },

    _frameBufferA: {
        /** @type{?WebGLFramebuffer} */
        value: null,
        writable: true
    },

    _frameBufferB: {
        /** @type{?WebGLFramebuffer} */
        value: null,
        writable: true
    },

    _positioningShader: {
        /** @type{?Shader} */
        value: null,
        writable: true
    },

    _convEdgeBlurShader: {
        /** @type{?Shader} */
        value: null,
        writable: true
    },

    _gaussEdgeBlurPass1Shader: {
        /** @type{?Shader} */
        value: null,
        writable: true
    },

    _gaussEdgeBlurPass2Shader: {
        /** @type{?Shader} */
        value: null,
        writable: true
    },

    //END WEBGL VARIABLES

    _contextLost: {
        /**
         * @type {boolean}
         */
        value: false,
        writable: true
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

    _matrixToArrayRepresentation3x3: {
        /**
         * Represent the matrix as an array.
         * @returns {Array<number>} the array representation.
         */
        value: function (a) {
            return [
                a.m00,
                a.m01,
                a.m02,
                a.m10,
                a.m11,
                a.m12,
                a.m20,
                a.m21,
                a.m22
            ];
        },
        writable: false
    },

    _matrixMultiply3x3: {
        /**
         * Matrix multiplication for 3x3 matrix.
         */
        value: function (a, b) {
            let result = {};
            result.m00 = a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20;
            result.m01 = a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21;
            result.m02 = a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22;

            result.m10 = a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20;
            result.m11 = a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21;
            result.m12 = a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22;

            result.m20 = a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20;
            result.m21 = a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21;
            result.m22 = a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22;
            return result;
        },
        writable: false
    },

    _matrixMultiply1x3and3x3: {
        /**
         * Matrix multiplication for 3x3 matrix.
         */
        value: function (a, b) {
            let result = {};
            result.m00 = a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20;
            result.m01 = a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21;
            result.m02 = a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22;
            return result;
        },
        writable: false
    },

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

    _calcGaussianBlur: {
        value: function (time, style, overrides) {
            const blurConstant = 1.17741002251547469;
            let transitionOverrides = overrides.getTransition();
            let factor = overrides.getGaussianEdgeBlur() ?? 0;
            if (transitionOverrides !== null)
                factor = sabre.performTransition(
                    time,
                    factor,
                    transitionOverrides.getGaussianEdgeBlur(),
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
            return factor / blurConstant;
        },
        writable: false
    },

    _calcOutline: {
        /**
         * Calc outline width, handing transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function (time, style, overrides) {
            let transitionOverrides = overrides.getTransition();
            let outlineX = overrides.getOutlineX() ?? style.getOutlineX();
            let outlineY = overrides.getOutlineY() ?? style.getOutlineY();
            if (transitionOverrides !== null) {
                outlineX = sabre.performTransition(
                    time,
                    outlineX,
                    transitionOverrides.getOutlineX(),
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
                outlineY = sabre.performTransition(
                    time,
                    outlineY,
                    transitionOverrides.getOutlineY(),
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
            }
            return { x: outlineX, y: outlineY };
        },
        writable: false
    },

    _calcRotation: {
        /**
         * Calc rotation, handing transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function (time, style, overrides) {
            let transitionOverrides = overrides.getTransition();
            let rotation = overrides.getRotation();
            if (transitionOverrides !== null) {
                let rotationTarget = transitionOverrides.getRotation();
                rotation[0] = sabre.performTransition(
                    time,
                    rotation[0],
                    rotationTarget[0],
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
                rotation[1] = sabre.performTransition(
                    time,
                    rotation[1],
                    rotationTarget[1],
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
                rotation[2] = sabre.performTransition(
                    time,
                    rotation[2],
                    rotationTarget[2],
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
            }
            return rotation;
        },
        writable: false
    },

    _positionEvent: {
        /**
         * Positions the event.
         * @private
         * @param {number} time time of the current frame.
         * @param {number} index the index of the event we're positioning.
         * @param {SSASubtitleEvent} event the current event we're positioning.
         * @param {{hoffset:number,voffset:number}} textAnchorOffset the offset from the anchor point of the text.
         * @returns {{x:number,y:number,width:number,height:number}} the positioning info of the event.
         */
        value: function (time, index, event, textAnchorOffset) {
            let result = {
                x: 0,
                y: 0,
                originalX: 0,
                originalY: 0,
                width: 0,
                height: 0,
                index: index
            };
            let lineOverrides = event.getLineOverrides();
            if (!event.getOverrides().getDrawingMode()) {
                this._textRenderer.renderEvent(
                    time,
                    event,
                    sabre.RenderPasses.FILL,
                    textAnchorOffset,
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
                    result.originalX = result.x = anchorPoint[0];
                    result.originalY = result.y = anchorPoint[1];
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
                    textAnchorOffset,
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
                    result.originalX = result.x = anchorPoint[0];
                    result.originalY = result.y = anchorPoint[1];
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
            return result;
        },
        writable: false
    },

    _collideEvent: {
        /**
         * Collides two events.
         * @private
         * @param {{x:number,y:number,width:number,height:number,index:number}} positionInfo1 current event's position info.
         * @param {Array<{x:number,y:number,width:number,height:number,index:number}>} posInfosForMatchingId1 position infos for events who's id matches the current event's id.
         * @param {{x:number,y:number,width:number,height:number,index:number}} positionInfo2 the position info of the event we're colliding with.
         * @param {Array<{x:number,y:number,width:number,height:number,index:number}>} posInfosForMatchingId2 position infos for events who's id matches the colliding event's id.
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
                        if (positionInfo1.index < positionInfo2.index) {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId2[i].y -=
                                    posInfosForMatchingId1[i].height;
                                posInfosForMatchingId2[i].y -= overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId1.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y += overlap[1];
                            }
                        }
                    } else if (overlap[1] > 0) {
                        if (positionInfo1.index < positionInfo2.index) {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId2[i].y += overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y -=
                                    positionInfo2.height;
                                posInfosForMatchingId1[i].y -= overlap[1];
                            }
                        }
                    }
                } else {
                    if (overlap[1] > 0) {
                        if (positionInfo1.index > positionInfo2.index) {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId2[i].y -=
                                    posInfosForMatchingId1[i].height;
                                posInfosForMatchingId2[i].y -= overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId1.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y += overlap[1];
                            }
                        }
                    } else if (overlap[1] < 0) {
                        if (positionInfo1.index > positionInfo2.index) {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId2[i].y += overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y -=
                                    positionInfo2.height;
                                posInfosForMatchingId1[i].y -= overlap[1];
                            }
                        }
                    }
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
                        i,
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

    _glSetup: {
        value: function () {
            const tex_coords = new Float32Array([
                0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1
            ]);
            const fullscreen_coordinates = new Float32Array([
                -1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0
            ]);
            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
            );

            this._textureCoordinatesBuffer = this._gl.createBuffer();
            this._subtitlePositioningBuffer = this._gl.createBuffer();
            this._fullscreenPositioningBuffer = this._gl.createBuffer();

            this._gl.bindBuffer(
                this._gl.ARRAY_BUFFER,
                this._textureCoordinatesBuffer
            );
            this._gl.bufferData(
                this._gl.ARRAY_BUFFER,
                tex_coords,
                this._gl.STATIC_DRAW
            );

            this._gl.bindBuffer(
                this._gl.ARRAY_BUFFER,
                this._fullscreenPositioningBuffer
            );
            this._gl.bufferData(
                this._gl.ARRAY_BUFFER,
                fullscreen_coordinates,
                this._gl.STATIC_DRAW
            );

            this._textureSubtitle = this._gl.createTexture();
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._textureSubtitle);
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_WRAP_S,
                this._gl.CLAMP_TO_EDGE
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_WRAP_T,
                this._gl.CLAMP_TO_EDGE
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_MIN_FILTER,
                this._gl.LINEAR
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_MAG_FILTER,
                this._gl.LINEAR
            );
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                1,
                1,
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );

            this._fbTextureA = this._gl.createTexture();
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureA);
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_WRAP_S,
                this._gl.CLAMP_TO_EDGE
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_WRAP_T,
                this._gl.CLAMP_TO_EDGE
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_MIN_FILTER,
                this._gl.LINEAR
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_MAG_FILTER,
                this._gl.LINEAR
            );
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"],
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );

            this._fbTextureB = this._gl.createTexture();
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureB);
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_WRAP_S,
                this._gl.CLAMP_TO_EDGE
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_WRAP_T,
                this._gl.CLAMP_TO_EDGE
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_MIN_FILTER,
                this._gl.LINEAR
            );
            this._gl.texParameteri(
                this._gl.TEXTURE_2D,
                this._gl.TEXTURE_MAG_FILTER,
                this._gl.LINEAR
            );
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"],
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );

            this._frameBufferA = this._gl.createFramebuffer();
            this._gl.bindFramebuffer(
                this._gl.DRAW_FRAMEBUFFER,
                this._frameBufferA
            );
            this._gl.framebufferTexture2D(
                this._gl.FRAMEBUFFER,
                this._gl.COLOR_ATTACHMENT0,
                this._gl.TEXTURE_2D,
                this._fbTextureA,
                0
            );

            this._frameBufferB = this._gl.createFramebuffer();
            this._gl.bindFramebuffer(
                this._gl.DRAW_FRAMEBUFFER,
                this._frameBufferB
            );
            this._gl.framebufferTexture2D(
                this._gl.FRAMEBUFFER,
                this._gl.COLOR_ATTACHMENT0,
                this._gl.TEXTURE_2D,
                this._fbTextureB,
                0
            );

            this._positioningShader = new sabre.Shader();
            this._positioningShader.load(
                sabre.getScriptPath() + "/shaders/positioning.vertex.glsl",
                sabre.getScriptPath() + "/shaders/positioning.fragment.glsl",
                1
            );
            this._positioningShader.compile(this._gl);
            this._positioningShader.addOption(
                "u_matrix",
                new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]),
                "Matrix3fv"
            );
            this._positioningShader.addOption("u_texture", 0, "1i");

            this._convEdgeBlurShader = new sabre.Shader();
            this._convEdgeBlurShader.load(
                sabre.getScriptPath() + "/shaders/effect.vertex.glsl",
                sabre.getScriptPath() + "/shaders/edge_blur.fragment.glsl",
                1
            );
            this._convEdgeBlurShader.compile(this._gl);
            this._convEdgeBlurShader.addOption("u_texture", 0, "1i");
            this._convEdgeBlurShader.addOption(
                "u_resolution_x",
                this._config.renderer["resolution_x"],
                "1f"
            );
            this._convEdgeBlurShader.addOption(
                "u_resolution_y",
                this._config.renderer["resolution_y"],
                "1f"
            );

            this._gaussEdgeBlurPass1Shader = new sabre.Shader();
            this._gaussEdgeBlurPass1Shader.load(
                sabre.getScriptPath() + "/shaders/effect.vertex.glsl",
                sabre.getScriptPath() + "/shaders/gauss_blur.1.fragment.glsl",
                1
            );
            this._gaussEdgeBlurPass1Shader.compile(this._gl);
            this._gaussEdgeBlurPass1Shader.addOption(
                "u_resolution_x",
                this._config.renderer["resolution_x"],
                "1f"
            );
            this._gaussEdgeBlurPass1Shader.addOption("u_texture", 0, "1i");
            this._gaussEdgeBlurPass1Shader.addOption("u_sigma", 0, "1f");

            this._gaussEdgeBlurPass2Shader = new sabre.Shader();
            this._gaussEdgeBlurPass2Shader.load(
                sabre.getScriptPath() + "/shaders/effect.vertex.glsl",
                sabre.getScriptPath() + "/shaders/gauss_blur.2.fragment.glsl",
                1
            );
            this._gaussEdgeBlurPass2Shader.compile(this._gl);
            this._gaussEdgeBlurPass2Shader.addOption(
                "u_resolution_y",
                this._config.renderer["resolution_y"],
                "1f"
            );
            this._gaussEdgeBlurPass2Shader.addOption("u_texture", 0, "1i");
            this._gaussEdgeBlurPass2Shader.addOption("u_sigma", 0, "1f");
        },
        writable: false
    },

    _compositeSubtitle: {
        /**
         * Performs the actual compositing of the subtitles onscreen.
         * @param {number} time The time the subtitle must be rendered at.
         * @param {SSASubtitleEvent} currentEvent The properties of the subtitle.
         * @param {number} pass the current render pass we are on.
         * @param {boolean} isShape is the subtitle we are compositing a shape?
         */
        value: function (time, currentEvent, pass, position, isShape) {
            let bluring;
            let edgeBlurActive;
            let gaussianBlurActive;
            let edgeBlurIterations = 0;
            let gaussianBlurFactor = 0;
            {
                let outline = this._calcOutline(
                    time,
                    currentEvent.getStyle(),
                    currentEvent.getOverrides()
                );
                bluring =
                    (pass === sabre.RenderPasses.OUTLINE &&
                        (outline.x > 0 || outline.y > 0)) ||
                    (pass === sabre.RenderPasses.FILL &&
                        outline.x === 0 &&
                        outline.y === 0);
                edgeBlurIterations = this._calcEdgeBlur(
                    time,
                    currentEvent.getStyle(),
                    currentEvent.getOverrides()
                );
                gaussianBlurFactor = this._calcGaussianBlur(
                    time,
                    currentEvent.getStyle(),
                    currentEvent.getOverrides()
                );
                edgeBlurActive = edgeBlurIterations > 0;
                gaussianBlurActive = gaussianBlurFactor > 0;
                bluring = bluring && (edgeBlurActive || gaussianBlurActive);
            }

            let source = !isShape ? this._textRenderer : this._shapeRenderer;

            this._gl.bindFramebuffer(
                this._gl.FRAMEBUFFER,
                bluring ? this._frameBufferA : null
            );
            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
            );
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._textureSubtitle);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                source.getImage()
            );

            let xScale = 2 / this._config.renderer["resolution_x"];
            let yScale = 2 / this._config.renderer["resolution_Y"];
            let positioningMatrix;
            {
                let offsetMatrix;
                {
                    let offset = source.getOffset();
                    offsetMatrix = {
                        m00: 1,
                        m01: 0,
                        m02: offset[0] * xScale,
                        m10: 0,
                        m11: 1,
                        m12: offset[1] * yScale,
                        m20: 0,
                        m21: 0,
                        m22: 1
                    };
                }

                let negativeRotationTranslationMatrix;
                let positiveRotationTranslationMatrix;
                {
                    let lineOverrides = currentEvent.getLineOverrides();
                    if (lineOverrides.getRotationOrigin() !== null) {
                        let curPos = [0, 0];
                        if (
                            lineOverrides.getMovement() === null &&
                            lineOverrides.getPosition() === null
                        ) {
                            curPos[0] = position.originalY;
                            curPos[1] = position.originalX;
                        } else if (lineOverrides.getMovement() === null) {
                            curPos = lineOverrides.getPosition();
                        } else {
                            let move = lineOverrides.getMovement();
                            curPos[0] = move[0];
                            curPos[1] = move[1];
                        }

                        let rotationOrigin = lineOverrides.getRotationOrigin();
                        let diff = [0, 0];
                        diff[0] = rotationOrigin[0] - curPos[0];
                        diff[1] = rotationOrigin[1] - curPos[1];
                        negativeRotationTranslationMatrix = {
                            m00: 1,
                            m01: 0,
                            m02: diff[0] * xScale - 1,
                            m10: 0,
                            m11: 1,
                            m12: diff[1] * yScale - 1,
                            m20: 0,
                            m21: 0,
                            m22: 1
                        };
                        positiveRotationTranslationMatrix = {
                            m00: 1,
                            m01: 0,
                            m02: -diff[0] * xScale - 1,
                            m10: 0,
                            m11: 1,
                            m12: -diff[1] * yScale - 1,
                            m20: 0,
                            m21: 0,
                            m22: 1
                        };
                    } else {
                        positiveRotationTranslationMatrix =
                            negativeRotationTranslationMatrix = {
                                m00: 1,
                                m01: 0,
                                m02: 0,
                                m10: 0,
                                m11: 1,
                                m12: 0,
                                m20: 0,
                                m21: 0,
                                m22: 1
                            };
                    }
                }

                let rotationMatrixX;
                let rotationMatrixY;
                let rotationMatrixZ;
                {
                    const toRad = Math.PI / 180;
                    let rotation = this._calcRotation(
                        time,
                        currentEvent.getStyle(),
                        currentEvent.getOverrides()
                    );
                    rotationMatrixX = {
                        m00: 1,
                        m01: 0,
                        m02: 0,
                        m10: 0,
                        m11: Math.cos(rotation.x * toRad),
                        m12: -Math.sin(rotation.x * toRad),
                        m20: 0,
                        m21: Math.sin(rotation.x * toRad),
                        m22: Math.cos(rotation.x * toRad)
                    };
                    rotationMatrixY = {
                        m00: Math.cos(rotation.x * toRad),
                        m01: 0,
                        m02: Math.sin(rotation.x * toRad),
                        m10: 0,
                        m11: 1,
                        m12: 0,
                        m20: -Math.sin(rotation.x * toRad),
                        m21: 0,
                        m22: Math.cos(rotation.x * toRad)
                    };
                    rotationMatrixZ = {
                        m00: Math.cos(rotation.x * toRad),
                        m01: -Math.sin(rotation.x * toRad),
                        m02: 0,
                        m10: Math.sin(rotation.x * toRad),
                        m11: Math.cos(rotation.x * toRad),
                        m12: 0,
                        m20: 0,
                        m21: 0,
                        m22: 1
                    };
                }

                let finalPositionOffsetMatrix = {
                    m00: 1,
                    m01: 0,
                    m02: position.x * xScale - 1,
                    m10: 0,
                    m11: 1,
                    m12: position.y * yScale - 1,
                    m20: 0,
                    m21: 0,
                    m22: 1
                };

                positioningMatrix = this._matrixMultiply3x3(
                    offsetMatrix,
                    negativeRotationTranslationMatrix
                );
                positioningMatrix = this._matrixMultiply3x3(
                    positioningMatrix,
                    rotationMatrixX
                );
                positioningMatrix = this._matrixMultiply3x3(
                    positioningMatrix,
                    rotationMatrixY
                );
                positioningMatrix = this._matrixMultiply3x3(
                    positioningMatrix,
                    rotationMatrixZ
                );
                positioningMatrix = this._matrixMultiply3x3(
                    positioningMatrix,
                    positiveRotationTranslationMatrix
                );
                positioningMatrix = this._matrixMultiply3x3(
                    positioningMatrix,
                    finalPositionOffsetMatrix
                );
            }

            let upperLeft = {
                m00: -1,
                m01: -1,
                m02: 0
            };

            let lowerLeft = {
                m00: -1,
                m01: position.height * yScale - 1,
                m02: 0
            };

            let upperRight = {
                m00: position.width * xScale - 1,
                m01: -1,
                m02: 0
            };

            let lowerRight = {
                m00: position.width * xScale - 1,
                m01: position.height * yScale - 1,
                m02: 0
            };

            let coordinates = new Float32Array([
                upperLeft.m00,
                upperLeft.m01,
                upperLeft.m02,
                upperRight.m00,
                upperRight.m01,
                upperRight.m02,
                lowerLeft.m00,
                lowerLeft.m01,
                lowerLeft.m02,
                lowerLeft.m00,
                lowerLeft.m01,
                lowerLeft.m02,
                upperRight.m00,
                upperRight.m01,
                upperRight.m02,
                lowerRight.m00,
                lowerRight.m01,
                lowerRight.m02
            ]);

            //Draw background or outline or text depending on pass to destination
            {
                let positionAttrib = this._positioningShader.getAttribute(
                    this._gl,
                    "a_position"
                );
                let textureAttrib = this._positioningShader.getAttribute(
                    this._gl,
                    "a_texcoord"
                );
                this._positioningShader.updateOption(
                    "u_matrix",
                    new Float32Array(
                        this._matrixToArrayRepresentation3x3(positioningMatrix)
                    )
                );
                this._positioningShader.updateOption("u_texture", 0);
                this._positioningShader.bindShader(this._gl);
                this._gl.bindBuffer(
                    this._gl.ARRAY_BUFFER,
                    this._textureCoordinatesBuffer
                );
                this._gl.enableVertexAttribArray(textureAttrib);
                this._gl.vertexAttribPointer(
                    textureAttrib,
                    2,
                    this._gl.FLOAT,
                    false,
                    0,
                    0
                );
                this._gl.bindBuffer(
                    this._gl.ARRAY_BUFFER,
                    this._subtitlePositioningBuffer
                );
                this._gl.bufferData(
                    this._gl.ARRAY_BUFFER,
                    coordinates,
                    this._gl.DYNAMIC_DRAW
                );
                this._gl.enableVertexAttribArray(positionAttrib);
                this._gl.vertexAttribPointer(
                    positionAttrib,
                    3,
                    this._gl.FLOAT,
                    false,
                    0,
                    0
                );
                this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
            }

            if (bluring) {
                let backFramebuffer = this._frameBufferB;
                let sourceFramebuffer = this._frameBufferA;
                let backTexture = this._fbTextureB;
                let sourceTexture = this._fbTextureA;
                if (edgeBlurActive) {
                    this._convEdgeBlurShader.updateOption(
                        "u_resolution_x",
                        this._config.renderer["resolution_x"]
                    );
                    this._convEdgeBlurShader.updateOption(
                        "u_resolution_y",
                        this._config.renderer["resolution_y"]
                    );
                    this._convEdgeBlurShader.updateOption("u_texture", 0);
                    this._convEdgeBlurShader.bindShader(this._gl);
                    //Draw framebuffer to destination
                    let swap;
                    for (let i = 0; i < edgeBlurIterations - 1; i++) {
                        this._gl.bindFramebuffer(
                            this._gl.FRAMEBUFFER,
                            backFramebuffer
                        );
                        this._gl.activeTexture(this._gl.TEXTURE0);
                        this._gl.bindTexture(
                            this._gl.TEXTURE_2D,
                            sourceTexture
                        );
                        this._gl.bindBuffer(
                            this._gl.ARRAY_BUFFER,
                            this._fullscreenPositioningBuffer
                        );
                        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
                        swap = backTexture;
                        backTexture = sourceTexture;
                        sourceTexture = swap;
                        swap = backFramebuffer;
                        backFramebuffer = sourceFramebuffer;
                        sourceFramebuffer = swap;
                    }
                    if (gaussianBlurActive) {
                        this._gl.bindFramebuffer(
                            this._gl.FRAMEBUFFER,
                            backFramebuffer
                        );
                    } else {
                        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
                    }

                    this._gl.activeTexture(this._gl.TEXTURE0);
                    this._gl.bindTexture(this._gl.TEXTURE_2D, sourceTexture);

                    {
                        let positionAttrib =
                            this._convEdgeBlurShader.getAttribute(
                                this._gl,
                                "a_position"
                            );
                        this._gl.bindBuffer(
                            this._gl.ARRAY_BUFFER,
                            this._fullscreenPositioningBuffer
                        );
                        this._gl.enableVertexAttribArray(positionAttrib);
                        this._gl.vertexAttribPointer(
                            positionAttrib,
                            3,
                            this._gl.FLOAT,
                            false,
                            0,
                            0
                        );
                        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
                    }

                    swap = backTexture;
                    backTexture = sourceTexture;
                    sourceTexture = swap;
                    swap = backFramebuffer;
                    backFramebuffer = sourceFramebuffer;
                    sourceFramebuffer = swap;
                }

                if (gaussianBlurActive) {
                    this._gl.bindFramebuffer(
                        this._gl.FRAMEBUFFER,
                        backFramebuffer
                    );
                    this._gl.activeTexture(this._gl.TEXTURE0);
                    this._gl.bindTexture(this._gl.TEXTURE_2D, sourceTexture);
                    //Apply gaussian filter 1
                    this._gaussEdgeBlurPass1Shader.updateOption(
                        "u_resolution_x",
                        this._config.renderer["resolution_x"]
                    );
                    this._gaussEdgeBlurPass1Shader.updateOption(
                        "u_sigma",
                        gaussianBlurFactor
                    );
                    this._gaussEdgeBlurPass1Shader.updateOption("u_texture", 0);
                    this._gaussEdgeBlurPass1Shader.bindShader(this._gl);
                    //Draw framebuffer X to framebuffer Y
                    {
                        let positionAttrib =
                            this._gaussEdgeBlurPass1Shader.getAttribute(
                                this._gl,
                                "a_position"
                            );
                        this._gl.bindBuffer(
                            this._gl.ARRAY_BUFFER,
                            this._fullscreenPositioningBuffer
                        );
                        this._gl.enableVertexAttribArray(positionAttrib);
                        this._gl.vertexAttribPointer(
                            positionAttrib,
                            3,
                            this._gl.FLOAT,
                            false,
                            0,
                            0
                        );
                        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
                    }

                    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
                    this._gl.activeTexture(this._gl.TEXTURE0);
                    this._gl.bindTexture(this._gl.TEXTURE_2D, backTexture);
                    //Apply gaussian filter 2
                    this._gaussEdgeBlurPass2Shader.updateOption(
                        "u_resolution_y",
                        this._config.renderer["resolution_y"]
                    );
                    this._gaussEdgeBlurPass2Shader.updateOption(
                        "u_sigma",
                        gaussianBlurFactor
                    );
                    this._gaussEdgeBlurPass2Shader.updateOption("u_texture", 0);
                    this._gaussEdgeBlurPass2Shader.bindShader(this._gl);
                    //Draw framebuffer Y to screen
                    {
                        let positionAttrib =
                            this._gaussEdgeBlurPass1Shader.getAttribute(
                                this._gl,
                                "a_position"
                            );
                        this._gl.bindBuffer(
                            this._gl.ARRAY_BUFFER,
                            this._fullscreenPositioningBuffer
                        );
                        this._gl.enableVertexAttribArray(positionAttrib);
                        this._gl.vertexAttribPointer(
                            positionAttrib,
                            3,
                            this._gl.FLOAT,
                            false,
                            0,
                            0
                        );
                        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
                    }
                }
            }
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
         * @param {RendererData} config configuration for the renderer.
         * @returns {void}
         */
        value: function (config) {
            this._config = config;
            this._scheduler.setEvents(
                /** @type {Array<SSASubtitleEvent>} */ (
                    config.renderer["events"]
                )
            );
            const options = Object.freeze({
                "alpha": true,
                "desynchronized": true,
                "antialias": true,
                "powerPreference": "high-performance",
                "premultipliedAlpha": false
            });
            if (typeof global.OffscreenCanvas === "undefined") {
                this._compositingCanvas =
                    global.document.createElement("canvas");
                this._compositingCanvas.width = config.renderer["resolution_x"];
                this._compositingCanvas.height =
                    config.renderer["resolution_y"];
            } else {
                this._compositingCanvas = new global.OffscreenCanvas(
                    config.renderer["resolution_x"],
                    config.renderer["resolution_y"]
                );
            }

            this._compositingCanvas.addEventListener(
                "webglcontextlost",
                function (event) {
                    console.log("[SABRE.js] WebGL Context Lost...");
                    this._contextLost = true;
                    event.preventDefault();
                },
                false
            );
            this._compositingCanvas.addEventListener(
                "webglcontextrestored",
                function (event) {
                    console.log(
                        "[SABRE.js] WebGL Context Restored. Recovering..."
                    );
                    sabre.Shader.resetStateEngine();
                    this._glSetup();
                    this._contextLost = false;
                },
                false
            );

            this._gl = this._compositingCanvas.getContext("webgl2", options);
            this._glSetup();
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
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureA);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"],
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureB);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"],
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );
        },
        writable: false
    },

    "canRender": {
        /**
         * Returns false if context is lost and not recovered yet.
         * @returns {boolean}
         */
        value: function () {
            return this._contextLost;
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
            if (this._contextLost) return;
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
                        this._compositeSubtitle(
                            time,
                            currentEvent,
                            pass,
                            positions[i],
                            false
                        );
                    } else {
                        this._shapeRenderer.renderEvent(
                            time,
                            currentEvent,
                            pass,
                            false
                        );
                        this._compositeSubtitle(
                            time,
                            currentEvent,
                            pass,
                            positions[i],
                            true
                        );
                    }
                }
            }
        },
        writable: false
    },

    "getDisplayUri": {
        /**
         * Get the frame output.
         * @param {function(string):void} callback the callback to call with the URI.
         */
        value: function (callback) {
            this._compositingCanvas.toBlobHD((a) => {
                let output = global.URL.createObjectURL(a);
                if (this._lastOutput !== null)
                    global.URL.revokeObjectURL(this._lastOutput);
                this._lastOutput = output;
                callback(output);
            });
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
