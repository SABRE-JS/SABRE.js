/*
 |   renderer-main.js
 |----------------
 |  renderer-main.js is copyright Patrick Rhodes Martin 2014-2020.
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
sabre.import("util.min.js");
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre.import("subtitle-event.min.js");
sabre.import("subtitle-parser.min.js");
sabre.import("scheduler.min.js");
sabre.import("canvas-2d-text-renderer.min.js");

/**
 * @fileoverview webgl subtitle compositing code.
 */
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
            let str_rep = JSON.stringify(events);
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
            if (typeof global.OffscreenCanvas == "undefined") {
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
            /*
            if (width-this._config.renderer["resolution_x"]>height-this._config.renderer["resolution_y"]){
                //TODO: Text Scaling based on height
            }else{
                //TODO: Text Scaling based on width
            }
            */
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
            let events = /** @type {Array<SSASubtitleEvent>} */ (this._scheduler.getVisibleAtTime(
                time
            ));
            events = events.sort(function (
                /** SSASubtitleEvent */ a,
                /** SSASubtitleEvent */ b
            ) {
                return a.getLayer() - b.getLayer();
            });
            let currentHash = this._hashEvents(events);
            if (currentHash === this._lastHash) return;
            this._lastHash = currentHash;
            this._gl.clear(
                this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
            );
            for (let pass = 0; pass < 3; pass++) {
                //One pass for background, one for outline and one for text.
                for (let i = 0; i < events.length; i++) {
                    let currentLayer = events[i].getLayer();
                    let layerStart = i;
                    let layerEnd = i;
                    {
                        //Find beginning and end of layer.
                        while (
                            layerStart >= 0 &&
                            events[layerStart].getLayer() == currentLayer
                        )
                            layerStart--;
                        while (
                            layerEnd < events.length &&
                            events[layerEnd].getLayer() == currentLayer
                        )
                            layerEnd++;
                        layerStart++;
                        layerEnd--;
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
            if (this._lastOutput != null)
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
