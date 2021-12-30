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
 * Is ImageBitmap Supported.
 * @type {boolean}
 */
const isImageBitmapSupported = typeof global.ImageBitmap !== "undefined";
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
        /** @type{?WebGLRenderingContext} */
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

    _matrixToArrayRepresentation4x4: {
        /**
         * Represent the matrix as an array, in openGL format.
         * @private
         * @returns {Array<number>} the array representation.
         */
        value: function (a) {
            return [
                a.m00,
                a.m10,
                a.m20,
                a.m30,
                a.m01,
                a.m11,
                a.m21,
                a.m31,
                a.m02,
                a.m12,
                a.m22,
                a.m32,
                a.m03,
                a.m13,
                a.m23,
                a.m33
            ];
        },
        writable: false
    },

    _matrixMultiply4x4: {
        /**
         * Matrix multiplication for 4x4 matrix.
         * @private
         * @param {Object} a first matrix
         * @param {Object} b second matrix
         * @returns {Object} the result matrix
         */
        value: function (a, b) {
            let result = {};
            result.m00 =
                a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20 + a.m03 * b.m30;
            result.m01 =
                a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21 + a.m03 * b.m31;
            result.m02 =
                a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22 + a.m03 * b.m32;
            result.m03 =
                a.m00 * b.m03 + a.m01 * b.m13 + a.m02 * b.m23 + a.m03 * b.m33;

            result.m10 =
                a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20 + a.m13 * b.m30;
            result.m11 =
                a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31;
            result.m12 =
                a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32;
            result.m13 =
                a.m10 * b.m03 + a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33;

            result.m20 =
                a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20 + a.m23 * b.m30;
            result.m21 =
                a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31;
            result.m22 =
                a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32;
            result.m23 =
                a.m20 * b.m03 + a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33;

            result.m30 =
                a.m30 * b.m00 + a.m31 * b.m10 + a.m32 * b.m20 + a.m33 * b.m30;
            result.m31 =
                a.m30 * b.m01 + a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31;
            result.m32 =
                a.m30 * b.m02 + a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32;
            result.m33 =
                a.m30 * b.m03 + a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33;
            return result;
        },
        writable: false
    },

    _matrixMultiply1x4and4x4: {
        /**
         * Matrix multiplication for 1x4 vector and 4x4 matrix.
         */
        value: function (a, b) {
            let result = {};
            result.m00 =
                a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20 + a.m03 * b.m30;
            result.m01 =
                a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21 + a.m03 * b.m31;
            result.m02 =
                a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22 + a.m03 * b.m32;
            result.m03 =
                a.m00 * b.m03 + a.m01 * b.m13 + a.m02 * b.m23 + a.m03 * b.m33;
            return result;
        },
        writable: false
    },

    _listOfEventsContainsAnimation: {
        /**
         * Determines if a list of SSASubtitleEvent objects contains use any animation features.
         * @param {Array<SSASubtitleEvent>} events list of SSASubtitleEvents
         * @returns {boolean} do they use animation?
         */
        value: function (events) {
            let result = false;
            for (let i = 0; i < events.length && !result; i++) {
                result =
                    result ||
                    events[i].getLineOverrides().getMovement() !== null ||
                    events[i].getLineTransitionTargetOverrides() !== null ||
                    events[i].getOverrides().getKaraokeMode() ===
                        sabre.KaraokeModes.OFF ||
                    events[i].getOverrides().getTransitions().length === 0;
            }
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
            let transitionOverrides = overrides.getTransitions();
            let iterations = overrides.getEdgeBlur() ?? 0;
            for (let i = 0; i < transitionOverrides.length; i++)
                iterations = sabre.performTransition(
                    time,
                    iterations,
                    transitionOverrides[i].getEdgeBlur(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
            return iterations;
        },
        writable: false
    },

    _calcGaussianBlur: {
        value: function (time, style, overrides) {
            const blurConstant = 1.17741002251547469;
            let transitionOverrides = overrides.getTransitions();
            let factor = overrides.getGaussianEdgeBlur() ?? 0;
            for (let i = 0; i < transitionOverrides.length; i++)
                factor = sabre.performTransition(
                    time,
                    factor,
                    transitionOverrides[i].getGaussianEdgeBlur(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
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
            let transitionOverrides = overrides.getTransitions();
            let outlineX = overrides.getOutlineX() ?? style.getOutlineX();
            let outlineY = overrides.getOutlineY() ?? style.getOutlineY();
            for (let i = 0; i < transitionOverrides.length; i++) {
                outlineX = sabre.performTransition(
                    time,
                    outlineX,
                    transitionOverrides[i].getOutlineX(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
                outlineY = sabre.performTransition(
                    time,
                    outlineY,
                    transitionOverrides[i].getOutlineY(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
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
            let transitionOverrides = overrides.getTransitions();
            let rotation = overrides.getRotation();
            for (let i = 0; i < transitionOverrides.length; i++) {
                let rotationTarget = transitionOverrides[i].getRotation();
                rotation[0] = sabre.performTransition(
                    time,
                    rotation[0],
                    rotationTarget[0],
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
                rotation[1] = sabre.performTransition(
                    time,
                    rotation[1],
                    rotationTarget[1],
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
                rotation[2] = sabre.performTransition(
                    time,
                    rotation[2],
                    rotationTarget[2],
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
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
         * @returns {{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}} the positioning info of the event.
         */
        value: function (time, index, event, textAnchorOffset) {
            let alignment =
                (event.getOverrides().getAlignment() ??
                    event.getStyle().getAlignment()) - 1;
            let result = {
                x: 0,
                y: 0,
                originalX: 0,
                originalY: 0,
                width: 0,
                height: 0,
                index: index,
                marginLeft: 0,
                marginRight: 0,
                marginVertical: 0,
                alignment: alignment
            };
            {
                let style = event.getStyle();
                let overrides = event.getOverrides();
                let styleMargins = style.getMargins();
                let overrideMargins = overrides.getMargins();
                if (
                    (overrideMargins[0] === 0 &&
                        overrideMargins[1] === 0 &&
                        overrideMargins[2] == 0) ||
                    (overrideMargins[0] === null &&
                        overrideMargins[1] === null &&
                        overrideMargins[2] == null)
                ) {
                    result.marginLeft = styleMargins[0];
                    result.marginRight = styleMargins[1];
                    result.marginVertical = styleMargins[2];
                } else {
                    result.marginLeft = overrideMargins[0] ?? styleMargins[0];
                    result.marginRight = overrideMargins[1] ?? styleMargins[1];
                    result.marginVertical =
                        overrideMargins[2] ?? styleMargins[2];
                }
            }
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
                    switch (Math.floor(alignment / 3)) {
                        case 2:
                            //TOP
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"];
                            break;
                        case 1:
                            //MIDDLE
                            anchorPoint[1] =
                                (this._config.renderer["resolution_y"] +
                                    dim[1]) /
                                2;
                            break;
                        case 0:
                            //BOTTOM
                            anchorPoint[1] = dim[1];
                            break;
                    }
                    switch (Math.floor(alignment % 3)) {
                        case 2:
                            //RIGHT
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] - dim[0];
                            break;
                        case 1:
                            //CENTER
                            anchorPoint[0] =
                                (this._config.renderer["resolution_x"] -
                                    dim[0]) /
                                2;
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
                        switch (Math.floor(alignment / 3)) {
                            case 2:
                                //TOP
                                // Do nothing. The subtitle is already top aligned.
                                break;
                            case 1:
                                //MIDDLE
                                curPos[1] -= dim[1] / 2; // middle align the subtitle
                                break;
                            case 0:
                                //BOTTOM
                                curPos[1] -= dim[1]; // bottom align the subtitle
                                break;
                        }
                        switch (Math.floor(alignment % 3)) {
                            case 2:
                                //RIGHT
                                curPos[0] -= dim[0]; // right align the subtitle
                                break;
                            case 1:
                                //CENTER
                                curPos[0] -= dim[0] / 2; // middle align the subtitle.
                                break;
                            case 0:
                                //LEFT
                                // Do nothing. The subtitle is already left aligned.
                                break;
                        }
                        result.originalX = curPos[0];
                        result.originalY =
                            this._config.renderer["resolution_y"] - curPos[1];
                    } else {
                        let move = lineOverrides.getMovement();
                        switch (Math.floor(alignment / 3)) {
                            case 2:
                                //TOP
                                // Do nothing. The subtitle is already top aligned.
                                break;
                            case 1:
                                //MIDDLE
                                move[1] -= dim[1] / 2; // middle align the subtitle
                                move[3] -= dim[1] / 2; // middle align the subtitle
                                break;
                            case 0:
                                //BOTTOM
                                move[1] -= dim[1]; // bottom align the subtitle
                                move[3] -= dim[1]; // bottom align the subtitle
                                break;
                        }
                        switch (Math.floor(alignment % 3)) {
                            case 2:
                                //RIGHT
                                move[0] -= dim[0]; // right align the subtitle
                                move[2] -= dim[0]; // right align the subtitle
                                break;
                            case 1:
                                //CENTER
                                move[0] -= dim[0] / 2; // center align the subtitle.
                                move[2] -= dim[0] / 2; // center align the subtitle.
                                break;
                            case 0:
                                //LEFT
                                // Do nothing. The subtitle is already left aligned.
                                break;
                        }
                        result.originalX = move[0];
                        curPos[0] = sabre.performTransition(
                            time,
                            move[0],
                            move[2],
                            move[4],
                            move[5],
                            1
                        );
                        result.originalY =
                            this._config.renderer["resolution_y"] - move[1];
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
                    result.y =
                        this._config.renderer["resolution_y"] - curPos[1];
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
                    switch (Math.floor(alignment / 3)) {
                        case 2:
                            //TOP
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"];
                            break;
                        case 1:
                            //MIDDLE
                            anchorPoint[1] =
                                (this._config.renderer["resolution_y"] +
                                    dim[1]) /
                                2;
                            break;
                        case 0:
                            //BOTTOM
                            anchorPoint[1] = dim[1];
                            break;
                    }
                    switch (Math.floor(alignment % 3)) {
                        case 2:
                            //RIGHT
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] - dim[0];
                            break;
                        case 1:
                            //CENTER
                            anchorPoint[0] =
                                (this._config.renderer["resolution_x"] -
                                    dim[0]) /
                                2;
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
                        result.originalX = curPos[0];
                        result.originalY =
                            this._config.renderer["resolution_y"] - curPos[1];
                    } else {
                        let move = lineOverrides.getMovement();
                        result.originalX = move[0];
                        curPos[0] = sabre.performTransition(
                            time,
                            move[0],
                            move[2],
                            move[4],
                            move[5],
                            1
                        );
                        result.originalY =
                            this._config.renderer["resolution_y"] - move[1];
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
                    result.y =
                        this._config.renderer["resolution_y"] - curPos[1];
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
         * @param {{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}} positionInfo1 current event's position info.
         * @param {Array<{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}>} posInfosForMatchingId1 position infos for events who's id matches the current event's id.
         * @param {{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}} positionInfo2 the position info of the event we're colliding with.
         * @param {Array<{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}>} posInfosForMatchingId2 position infos for events who's id matches the colliding event's id.
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
                                i < posInfosForMatchingId1.length;
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
                                i < posInfosForMatchingId1.length;
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
         * @param {{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}} positionInfo current event's position info.
         * @param {Array<{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}>} posInfosForMatchingId position infos for events who's id matches the current event's id.
         * @returns {boolean} did we move something?
         */
        value: function (positionInfo, posInfosForMatchingId) {
            let horizontalAlignment = positionInfo.alignment % 3;
            let verticalAlignment = Math.floor(positionInfo.alignment / 3);
            let xshouldmove = false;
            let xdistance = 0;
            let yshouldmove = false;
            let ydistance = 0;
            switch (horizontalAlignment) {
                case 2:
                    //RIGHT
                    xdistance =
                        this._config.renderer["resolution_x"] -
                        (positionInfo.x +
                            positionInfo.width +
                            positionInfo.marginRight);
                    xshouldmove = xdistance < 0;
                    break;
                case 1:
                    //CENTER
                    //We aren't aligned to a a side so do nothing. //TODO: is this really right?
                    break;
                case 0:
                    //LEFT
                    xdistance = -(positionInfo.x - positionInfo.marginLeft);
                    xshouldmove = xdistance > 0;
                    break;
            }
            switch (verticalAlignment) {
                case 2:
                    //TOP
                    ydistance =
                        this._config.renderer["resolution_y"] -
                        (positionInfo.y + positionInfo.marginVertical);
                    yshouldmove = ydistance < 0;
                    break;
                case 1:
                    //CENTER
                    //We aren't aligned to a side so do nothing. //TODO: is this really right?
                    break;
                case 0:
                    //BOTTOM
                    ydistance = -(
                        positionInfo.y -
                        (positionInfo.height + positionInfo.marginVertical)
                    );
                    yshouldmove = ydistance > 0;
                    break;
            }
            if (xshouldmove) {
                for (let i = 0; i < posInfosForMatchingId.length; i++) {
                    posInfosForMatchingId[i].x += xdistance;
                }
            }
            if (yshouldmove) {
                for (let i = 0; i < posInfosForMatchingId.length; i++) {
                    posInfosForMatchingId[i].y += ydistance;
                }
            }
            return xshouldmove || yshouldmove;
        },
        writable: false
    },

    _organizeEvents: {
        /**
         * Positions events onscreen and handles collisions.
         * @private
         * @param {number} time time of current frame.
         * @param {Array<SSASubtitleEvent>} events list of onscreen subtitle events for this frame in order of layer.
         * @returns {Array<{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number}>} each event's position onscreen.
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

            this._gl.clearColor(0, 0, 0, 0);
            this._gl.disable(this._gl.DEPTH_TEST);
            this._gl.enable(this._gl.BLEND);
            this._gl.blendFunc(
                this._gl.SRC_ALPHA,
                this._gl.ONE_MINUS_SRC_ALPHA
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
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferA);
            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
            );
            this._gl.framebufferTexture2D(
                this._gl.FRAMEBUFFER,
                this._gl.COLOR_ATTACHMENT0,
                this._gl.TEXTURE_2D,
                this._fbTextureA,
                0
            );

            this._frameBufferB = this._gl.createFramebuffer();
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferB);
            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
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
                sabre.getScriptPath() + "shaders/positioning.vertex.glsl",
                sabre.getScriptPath() + "shaders/positioning.fragment.glsl",
                1
            );
            this._positioningShader.compile(this._gl);
            this._positioningShader.addOption(
                "u_matrix",
                new Float32Array([
                    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
                ]),
                "Matrix4fv"
            );
            this._positioningShader.addOption("u_texture", 0, "1i");
            this._positioningShader.addOption(
                "u_primary_color",
                [0, 0, 0, 0],
                "4f"
            );
            this._positioningShader.addOption(
                "u_secondary_color",
                [0, 0, 0, 0],
                "4f"
            );
            this._positioningShader.addOption(
                "u_tertiary_color",
                [0, 0, 0, 0],
                "4f"
            );
            this._positioningShader.addOption(
                "u_quaternary_color",
                [0, 0, 0, 0],
                "4f"
            );

            this._convEdgeBlurShader = new sabre.Shader();
            this._convEdgeBlurShader.load(
                sabre.getScriptPath() + "shaders/effect.vertex.glsl",
                sabre.getScriptPath() + "shaders/edge_blur.fragment.glsl",
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
                sabre.getScriptPath() + "shaders/effect.vertex.glsl",
                sabre.getScriptPath() + "shaders/gauss_blur.1.fragment.glsl",
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
                sabre.getScriptPath() + "shaders/effect.vertex.glsl",
                sabre.getScriptPath() + "shaders/gauss_blur.2.fragment.glsl",
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
                let borderStyle = currentEvent.getStyle().getBorderStyle();
                bluring =
                    (pass === sabre.RenderPasses.OUTLINE &&
                        (outline.x > 0 || outline.y > 0)) ||
                    (pass === sabre.RenderPasses.FILL &&
                        ((outline.x === 0 && outline.y === 0) ||
                            (borderStyle !== sabre.BorderStyleModes.NORMAL &&
                                borderStyle !==
                                    sabre.BorderStyleModes.UNKNOWN)));
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

            let blendDisabled =
                pass == sabre.RenderPasses.BACKGROUND &&
                currentEvent.getStyle().getBorderStyle() ===
                    sabre.BorderStyleModes.SRT_NO_OVERLAP;
            if (blendDisabled) this._gl.disable(this._gl.BLEND);

            let source = !isShape ? this._textRenderer : this._shapeRenderer;

            this._gl.bindFramebuffer(
                this._gl.FRAMEBUFFER,
                bluring ? this._frameBufferA : null
            );

            if (bluring)
                this._gl.clear(
                    this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
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
            let yScale = 2 / this._config.renderer["resolution_y"];
            let positioningMatrix;
            {
                let offsetMatrix;
                {
                    let offset = source.getOffset();
                    offsetMatrix = {
                        m00: 1,
                        m01: 0,
                        m02: 0,
                        m03: offset[0] * xScale,
                        m10: 0,
                        m11: 1,
                        m12: 0,
                        m13: offset[1] * yScale,
                        m20: 0,
                        m21: 0,
                        m22: 1,
                        m23: 0,
                        m30: 0,
                        m31: 0,
                        m32: 0,
                        m33: 1
                    };
                }

                let negativeRotationTranslationMatrix;
                let positiveRotationTranslationMatrix;
                {
                    let lineOverrides = currentEvent.getLineOverrides();
                    if (lineOverrides.getRotationOrigin() !== null) {
                        let rotationOrigin = lineOverrides.getRotationOrigin();
                        let diff = [0, 0];
                        diff[0] = rotationOrigin[0] - position.x;
                        diff[1] =
                            this._config.renderer["resolution_y"] -
                            rotationOrigin[1] -
                            position.y;
                        negativeRotationTranslationMatrix = {
                            m00: 1,
                            m01: 0,
                            m02: 0,
                            m03: diff[0] * xScale,
                            m10: 0,
                            m11: 1,
                            m12: 0,
                            m13: diff[1] * yScale,
                            m20: 0,
                            m21: 0,
                            m22: 1,
                            m23: 0,
                            m30: 0,
                            m31: 0,
                            m32: 0,
                            m33: 1
                        };
                        positiveRotationTranslationMatrix = {
                            m00: 1,
                            m01: 0,
                            m02: 0,
                            m03: -diff[0] * xScale,
                            m10: 0,
                            m11: 1,
                            m12: 0,
                            m13: -diff[1] * yScale,
                            m20: 0,
                            m21: 0,
                            m22: 1,
                            m23: 0,
                            m30: 0,
                            m31: 0,
                            m32: 0,
                            m33: 1
                        };
                    } else {
                        positiveRotationTranslationMatrix =
                            negativeRotationTranslationMatrix = {
                                m00: 1,
                                m01: 0,
                                m02: 0,
                                m03: 0,
                                m10: 0,
                                m11: 1,
                                m12: 0,
                                m13: 0,
                                m20: 0,
                                m21: 0,
                                m22: 1,
                                m23: 0,
                                m30: 0,
                                m31: 0,
                                m32: 0,
                                m33: 1
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
                        m03: 0,
                        m10: 0,
                        m11: Math.cos(rotation[0] * toRad),
                        m12: -Math.sin(rotation[0] * toRad),
                        m13: 0,
                        m20: 0,
                        m21: Math.sin(rotation[0] * toRad),
                        m22: Math.cos(rotation[0] * toRad),
                        m23: 0,
                        m30: 0,
                        m31: 0,
                        m32: 0,
                        m33: 1
                    };
                    rotationMatrixY = {
                        m00: Math.cos(rotation[1] * toRad),
                        m01: 0,
                        m02: Math.sin(rotation[1] * toRad),
                        m03: 0,
                        m10: 0,
                        m11: 1,
                        m12: 0,
                        m13: 0,
                        m20: -Math.sin(rotation[1] * toRad),
                        m21: 0,
                        m22: Math.cos(rotation[1] * toRad),
                        m23: 0,
                        m30: 0,
                        m31: 0,
                        m32: 0,
                        m33: 1
                    };
                    rotationMatrixZ = {
                        m00: Math.cos(rotation[2] * toRad),
                        m01: -Math.sin(rotation[2] * toRad),
                        m02: 0,
                        m03: 0,
                        m10: Math.sin(rotation[2] * toRad),
                        m11: Math.cos(rotation[2] * toRad),
                        m12: 0,
                        m13: 0,
                        m20: 0,
                        m21: 0,
                        m22: 1,
                        m23: 0,
                        m30: 0,
                        m31: 0,
                        m32: 0,
                        m33: 1
                    };
                }

                let finalPositionOffsetMatrix = {
                    m00: 1,
                    m01: 0,
                    m02: 0,
                    m03: position.x * xScale,
                    m10: 0,
                    m11: 1,
                    m12: 0,
                    m13: (position.y - position.height) * yScale,
                    m20: 0,
                    m21: 0,
                    m22: 1,
                    m23: 0,
                    m30: 0,
                    m31: 0,
                    m32: 0,
                    m33: 1
                };

                positioningMatrix = this._matrixMultiply4x4(
                    offsetMatrix,
                    negativeRotationTranslationMatrix
                );
                positioningMatrix = this._matrixMultiply4x4(
                    positioningMatrix,
                    rotationMatrixX
                );
                positioningMatrix = this._matrixMultiply4x4(
                    positioningMatrix,
                    rotationMatrixY
                );
                positioningMatrix = this._matrixMultiply4x4(
                    positioningMatrix,
                    rotationMatrixZ
                );
                positioningMatrix = this._matrixMultiply4x4(
                    positioningMatrix,
                    positiveRotationTranslationMatrix
                );
                positioningMatrix = this._matrixMultiply4x4(
                    positioningMatrix,
                    finalPositionOffsetMatrix
                );
            }

            let dimensions = source.getDimensions();
            let upperLeft = {
                m00: -1,
                m01: -1,
                m02: 0
            };

            let lowerLeft = {
                m00: -1,
                m01: dimensions[1] * yScale - 1,
                m02: 0
            };

            let upperRight = {
                m00: dimensions[0] * xScale - 1,
                m01: -1,
                m02: 0
            };

            let lowerRight = {
                m00: dimensions[0] * xScale - 1,
                m01: dimensions[1] * yScale - 1,
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
                {
                    let style = currentEvent.getStyle();
                    let overrides = currentEvent.getOverrides();
                    let transitionOverrides = overrides.getTransitions();
                    let primaryColor = style.getPrimaryColor();
                    let primaryOverride = overrides.getPrimaryColor();
                    let secondaryColor = style.getSecondaryColor();
                    let secondaryOverride = overrides.getSecondaryColor();
                    let tertiaryColor = style.getTertiaryColor();
                    let tertiaryOverride = overrides.getTertiaryColor();
                    let quaternaryColor = style.getQuaternaryColor();
                    let quaternaryOverride = overrides.getQuaternaryColor();

                    if (primaryOverride !== null)
                        primaryColor =
                            primaryOverride.applyOverride(primaryColor);
                    if (secondaryOverride !== null)
                        secondaryColor =
                            secondaryOverride.applyOverride(secondaryColor);
                    if (tertiaryOverride !== null)
                        tertiaryColor =
                            tertiaryOverride.applyOverride(tertiaryColor);
                    if (quaternaryOverride !== null)
                        quaternaryColor =
                            quaternaryOverride.applyOverride(quaternaryColor);

                    //TODO: Color Transition
                    let primaryColorArray = primaryColor.getRGBA();
                    let secondaryColorArray = secondaryColor.getRGBA();
                    let tertiaryColorArray = tertiaryColor.getRGBA();
                    let quaternaryColorArray = quaternaryColor.getRGBA();
                    for (let i = 0; i < transitionOverrides.length; i++) {
                        let transitionStart =
                            transitionOverrides[i].getTransitionStart();
                        let transitionEnd =
                            transitionOverrides[i].getTransitionEnd();
                        let transitionAcceleration =
                            transitionOverrides[i].getTransitionAcceleration();
                        let primaryTransitionOverride =
                            transitionOverrides[i].getPrimaryColor();
                        let secondaryTransitionOverride =
                            transitionOverrides[i].getSecondaryColor();
                        let tertiaryTransitionOverride =
                            transitionOverrides[i].getTertiaryColor();
                        let quaternaryTransitionOverride =
                            transitionOverrides[i].getQuaternaryColor();

                        if (primaryTransitionOverride !== null) {
                            let transitionColor =
                                primaryTransitionOverride.applyOverride(
                                    primaryColor
                                );
                            primaryColorArray[0] = sabre.performTransition(
                                time,
                                primaryColorArray[0],
                                transitionColor.getR(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            primaryColorArray[1] = sabre.performTransition(
                                time,
                                primaryColorArray[1],
                                transitionColor.getG(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            primaryColorArray[2] = sabre.performTransition(
                                time,
                                primaryColorArray[2],
                                transitionColor.getB(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            primaryColorArray[3] = sabre.performTransition(
                                time,
                                primaryColorArray[3],
                                transitionColor.getA(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                        }

                        if (secondaryTransitionOverride !== null) {
                            let transitionColor =
                                secondaryTransitionOverride.applyOverride(
                                    secondaryColor
                                );
                            secondaryColorArray[0] = sabre.performTransition(
                                time,
                                secondaryColorArray[0],
                                transitionColor.getR(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            secondaryColorArray[1] = sabre.performTransition(
                                time,
                                secondaryColorArray[1],
                                transitionColor.getG(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            secondaryColorArray[2] = sabre.performTransition(
                                time,
                                secondaryColorArray[2],
                                transitionColor.getB(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            secondaryColorArray[3] = sabre.performTransition(
                                time,
                                secondaryColorArray[3],
                                transitionColor.getA(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                        }

                        if (tertiaryTransitionOverride !== null) {
                            let transitionColor =
                                tertiaryTransitionOverride.applyOverride(
                                    tertiaryColor
                                );
                            tertiaryColorArray[0] = sabre.performTransition(
                                time,
                                tertiaryColorArray[0],
                                transitionColor.getR(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            tertiaryColorArray[1] = sabre.performTransition(
                                time,
                                tertiaryColorArray[1],
                                transitionColor.getG(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            tertiaryColorArray[2] = sabre.performTransition(
                                time,
                                tertiaryColorArray[2],
                                transitionColor.getB(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            tertiaryColorArray[3] = sabre.performTransition(
                                time,
                                tertiaryColorArray[3],
                                transitionColor.getA(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                        }

                        if (quaternaryTransitionOverride !== null) {
                            let transitionColor =
                                quaternaryTransitionOverride.applyOverride(
                                    quaternaryColor
                                );
                            quaternaryColorArray[0] = sabre.performTransition(
                                time,
                                quaternaryColorArray[0],
                                transitionColor.getR(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            quaternaryColorArray[1] = sabre.performTransition(
                                time,
                                quaternaryColorArray[1],
                                transitionColor.getG(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            quaternaryColorArray[2] = sabre.performTransition(
                                time,
                                quaternaryColorArray[2],
                                transitionColor.getB(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                            quaternaryColorArray[3] = sabre.performTransition(
                                time,
                                quaternaryColorArray[3],
                                transitionColor.getA(),
                                transitionStart,
                                transitionEnd,
                                transitionAcceleration
                            );
                        }
                    }
                    this._positioningShader.updateOption(
                        "u_primary_color",
                        primaryColorArray
                    );
                    this._positioningShader.updateOption(
                        "u_secondary_color",
                        secondaryColorArray
                    );
                    this._positioningShader.updateOption(
                        "u_tertiary_color",
                        tertiaryColorArray
                    );
                    this._positioningShader.updateOption(
                        "u_quaternary_color",
                        quaternaryColorArray
                    );
                }
                this._positioningShader.updateOption(
                    "u_matrix",
                    new Float32Array(
                        this._matrixToArrayRepresentation4x4(positioningMatrix)
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
                        this._gl.clear(
                            this._gl.DEPTH_BUFFER_BIT |
                                this._gl.COLOR_BUFFER_BIT
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
                        this._gl.clear(
                            this._gl.DEPTH_BUFFER_BIT |
                                this._gl.COLOR_BUFFER_BIT
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
                    this._gl.clear(
                        this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
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
            if (blendDisabled) {
                this._gl.enable(this._gl.BLEND);
                this._gl.blendFunc(
                    this._gl.SRC_ALPHA,
                    this._gl.ONE_MINUS_SRC_ALPHA
                );
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

            this._gl = this._compositingCanvas.getContext("webgl", options);
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
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferA);
            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
            );
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferB);
            this._gl.viewport(
                0,
                0,
                this._config.renderer["resolution_x"],
                this._config.renderer["resolution_y"]
            );
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
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
            if (
                currentHash === this._lastHash &&
                !this._listOfEventsContainsAnimation(events)
            )
                return;
            this._lastHash = currentHash;
            this._gl.clear(
                this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
            );
            let positions = this._organizeEvents(time, events);
            for (let pass = 0; pass < 3; pass++) {
                //One pass for background, one for outline and one for text.
                for (let i = 0; i < events.length; i++) {
                    let currentEvent = events[i];
                    if (currentEvent.getText() === "") continue;
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
         * @returns {void}
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
    },

    "getDisplayBitmap": {
        /**
         * Get an ImageBitmap containing the frame or null if ImageBitmap is unsupported.
         * @returns {ImageBitmap} the bitmap.
         */
        value: function () {
            if (!isImageBitmapSupported) return null;
            if (this._compositingCanvas instanceof global.OffscreenCanvas) {
                return this._compositingCanvas.transferToImageBitmap();
            } else return null;
        },
        writable: false
    },

    "copyToCanvas": {
        /**
         * Copy the frame output to a canvas.
         * @param {HTMLCanvasElement|OffscreenCanvas} canvas the canvas to draw to.
         * @param {boolean} bitmap should we use bitmap context?
         * @returns {void}
         */
        value: function (canvas, bitmap) {
            let context;
            if (bitmap) {
                context = canvas.getContext("bitmaprenderer");
                let bitmap = this["getDisplayBitmap"]();
                context.transferFromImageBitmap(bitmap);
            } else {
                context = canvas.getContext("2d");
                context.clearRect(
                    0,
                    0,
                    this._compositingCanvas.width,
                    this._compositingCanvas.height
                );
                context.drawImage(this._compositingCanvas, 0, 0);
            }
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
