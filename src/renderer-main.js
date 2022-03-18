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
sabre.import("util");
sabre.import("global-constants");
sabre.import("color");
sabre.import("style");
sabre.import("style-override");
sabre.import("subtitle-event");
sabre.import("subtitle-parser");
sabre.import("scheduler");
sabre.import("shader");
sabre.import("canvas-2d-text-renderer");
sabre.import("canvas-2d-shape-renderer");
/**
 * @fileoverview webgl subtitle compositing code.
 */
/**
 * @typedef {!{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number,alignmentOffsetX:number,alignmentOffsetY:number}}
 */
var CollisionInfo;
/**
 * Is ImageBitmap Supported.
 * @type {boolean}
 * @private
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
        /** @type{?(HTMLCanvasElement|OffscreenCanvas)} */
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

    _textureSubtitleBounds: {
        /** @type{?Array<number>} */
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
         * Timestamp of last frame rendered.
         * @type {number}
         */
        value: -1,
        writable: true
    },

    _lastAnimating: {
        /**
         * Was last frame an animation frame?
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _lastHash: {
        /**
         * Hash of last non-animating frame of subtitles.
         * @type {number}
         */
        value: NaN,
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

    _listOfEventsContainsAnimation: {
        /**
         * Determines if a list of SSASubtitleEvent objects contains use any animation features.
         * @param {Array<SSASubtitleEvent>} events list of SSASubtitleEvents
         * @returns {boolean} do they use animation?
         */
        value: function (events) {
            for (let i = 0; i < events.length; i++) {
                if (
                    events[i].getLineOverrides().getMovement() !== null ||
                    events[i].getLineOverrides().getFade() !== null ||
                    events[i].getLineTransitionTargetOverrides() !== null ||
                    events[i].getOverrides().getKaraokeMode() !==
                        sabre.KaraokeModes.OFF ||
                    events[i].getOverrides().getTransitions().length > 0
                )
                    return true;
            }
            return false;
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
            const blurConstant = 1; //1.17741002251547469;
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

    _calcShear: {
        /**
         * Calc shear, handling transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function (time, style, overrides) {
            let transitionOverrides = overrides.getTransitions();
            let shearX = overrides.getShearX() ?? 0;
            let shearY = overrides.getShearY() ?? 0;

            for (let i = 0; i < transitionOverrides.length; i++) {
                shearX = sabre.performTransition(
                    time,
                    shearX,
                    transitionOverrides[i].getShearX(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
                shearY = sabre.performTransition(
                    time,
                    shearY,
                    transitionOverrides[i].getShearY(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
            }
            return { x: shearX, y: shearY };
        },
        writable: true
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
                rotation[0] =
                    sabre.performTransition(
                        time,
                        rotation[0],
                        rotationTarget[0],
                        transitionOverrides[i].getTransitionStart(),
                        transitionOverrides[i].getTransitionEnd(),
                        transitionOverrides[i].getTransitionAcceleration()
                    ) % 360;
                rotation[1] =
                    sabre.performTransition(
                        time,
                        rotation[1],
                        rotationTarget[1],
                        transitionOverrides[i].getTransitionStart(),
                        transitionOverrides[i].getTransitionEnd(),
                        transitionOverrides[i].getTransitionAcceleration()
                    ) % 360;
                rotation[2] =
                    sabre.performTransition(
                        time,
                        rotation[2],
                        rotationTarget[2],
                        transitionOverrides[i].getTransitionStart(),
                        transitionOverrides[i].getTransitionEnd(),
                        transitionOverrides[i].getTransitionAcceleration()
                    ) % 360;
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
         * @returns {CollisionInfo} the positioning info of the event.
         */
        value: function (time, index, event) {
            let alignment =
                (event.getOverrides().getAlignment() ??
                    event.getStyle().getAlignment()) - 1;
            let verticalAlignment = Math.floor(alignment / 3);
            let horizontalAlignment = Math.floor(alignment % 3);
            let result = {
                x: 0,
                y: 0,
                originalX: 0,
                originalY: 0,
                alignmentOffsetX: 0,
                alignmentOffsetY: 0,
                width: 0,
                height: 0,
                index: index,
                marginLeft: 0,
                marginRight: 0,
                marginVertical: 0,
                alignment: alignment
            };
            if (event.getText() === "" && !event.isNewLine()) return result;
            {
                let style = event.getStyle();
                let overrides = event.getOverrides();
                let styleMargins = style.getMargins();
                let overrideMargins = overrides.getMargins();
                {
                    result.marginLeft = overrideMargins[0] || styleMargins[0];
                    result.marginRight = overrideMargins[1] || styleMargins[1];
                    result.marginVertical =
                        overrideMargins[2] || styleMargins[2];
                }
            }
            let lineOverrides = event.getLineOverrides();
            if (!event.getOverrides().getDrawingMode()) {
                this._textRenderer.renderEvent(
                    time,
                    event,
                    sabre.RenderPasses.FILL,
                    true
                );
                let dim = this._textRenderer.getBounds();
                if (
                    lineOverrides.getPosition() === null &&
                    lineOverrides.getMovement() === null
                ) {
                    let anchorPoint = [0, 0];
                    let alignmentOffsetX = 0;
                    let alignmentOffsetY = 0;
                    switch (verticalAlignment) {
                        case 2:
                            //TOP
                            anchorPoint[1] = 0;
                            alignmentOffsetY = 0;
                            break;
                        case 1:
                            //MIDDLE
                            anchorPoint[1] =
                                (this._config.renderer["resolution_y"] -
                                    dim[1]) /
                                2;
                            alignmentOffsetY = dim[1] / 2;
                            break;
                        case 0:
                            //BOTTOM
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"] - dim[1];
                            alignmentOffsetY = dim[1];
                            break;
                    }
                    switch (horizontalAlignment) {
                        case 2:
                            //RIGHT
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] - dim[0];
                            alignmentOffsetX = dim[0];
                            break;
                        case 1:
                            //CENTER
                            anchorPoint[0] =
                                (this._config.renderer["resolution_x"] -
                                    dim[0]) /
                                2;
                            alignmentOffsetX = dim[0] / 2;
                            break;
                        case 0:
                            //LEFT
                            anchorPoint[0] = 0;
                            alignmentOffsetX = 0;
                            break;
                    }
                    result.originalX = result.x = anchorPoint[0];
                    result.originalY = result.y = anchorPoint[1];
                    result.alignmentOffsetX = alignmentOffsetX;
                    result.alignmentOffsetY = alignmentOffsetY;
                } else {
                    let curPos = [0, 0];
                    let alignmentOffsetX = 0;
                    let alignmentOffsetY = 0;
                    if (lineOverrides.getMovement() === null) {
                        curPos = lineOverrides.getPosition();
                        switch (verticalAlignment) {
                            case 2:
                                //TOP
                                alignmentOffsetY = 0;
                                break;
                            case 1:
                                //MIDDLE
                                curPos[1] -= dim[1] / 2; // middle align the subtitle
                                alignmentOffsetY = dim[1] / 2;
                                break;
                            case 0:
                                //BOTTOM
                                curPos[1] -= dim[1]; // bottom align the subtitle
                                alignmentOffsetY = dim[1];
                                break;
                        }
                        switch (horizontalAlignment) {
                            case 2:
                                //RIGHT
                                curPos[0] -= dim[0]; // right align the subtitle
                                alignmentOffsetX = dim[0];
                                break;
                            case 1:
                                //CENTER
                                curPos[0] -= dim[0] / 2; // middle align the subtitle.
                                alignmentOffsetX = dim[0] / 2;
                                break;
                            case 0:
                                //LEFT
                                alignmentOffsetX = 0;
                                break;
                        }
                        result.originalX = result.x = curPos[0];
                        result.originalY = result.y = curPos[1];
                    } else {
                        let move = lineOverrides.getMovement();
                        switch (verticalAlignment) {
                            case 2:
                                //TOP
                                alignmentOffsetY = 0;
                                break;
                            case 1:
                                //MIDDLE
                                move[1] -= dim[1] / 2; // middle align the subtitle
                                move[3] -= dim[1] / 2; // middle align the subtitle
                                alignmentOffsetY = dim[1] / 2;
                                break;
                            case 0:
                                //BOTTOM
                                move[1] -= dim[1]; // bottom align the subtitle
                                move[3] -= dim[1]; // bottom align the subtitle
                                alignmentOffsetY = dim[1] / 2;
                                break;
                        }
                        switch (horizontalAlignment) {
                            case 2:
                                //RIGHT
                                move[0] -= dim[0]; // right align the subtitle
                                move[2] -= dim[0]; // right align the subtitle
                                alignmentOffsetX = dim[0];
                                break;
                            case 1:
                                //CENTER
                                move[0] -= dim[0] / 2; // center align the subtitle.
                                move[2] -= dim[0] / 2; // center align the subtitle.
                                alignmentOffsetX = dim[0] / 2;
                                break;
                            case 0:
                                //LEFT
                                alignmentOffsetX = 0;
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
                        result.originalY = move[1];
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
                    result.alignmentOffsetX = alignmentOffsetX;
                    result.alignmentOffsetY = alignmentOffsetY;
                }
                result.width = dim[0];
                result.height = dim[1];
            } else {
                this._shapeRenderer.renderEvent(
                    time,
                    event,
                    sabre.RenderPasses.FILL,
                    true
                );
                let dim = this._shapeRenderer.getBounds();
                if (
                    lineOverrides.getPosition() === null &&
                    lineOverrides.getMovement() === null
                ) {
                    let anchorPoint = [0, 0];
                    let alignmentOffsetX = 0;
                    let alignmentOffsetY = 0;
                    switch (verticalAlignment) {
                        case 2:
                            //TOP
                            anchorPoint[1] = 0;
                            alignmentOffsetY = 0;
                            break;
                        case 1:
                            //MIDDLE
                            anchorPoint[1] =
                                (this._config.renderer["resolution_y"] -
                                    dim[1]) /
                                2;
                            alignmentOffsetY = dim[1] / 2;
                            break;
                        case 0:
                            //BOTTOM
                            anchorPoint[1] =
                                this._config.renderer["resolution_y"] - dim[1];
                            alignmentOffsetY = dim[1];
                            break;
                    }
                    switch (horizontalAlignment) {
                        case 2:
                            //RIGHT
                            anchorPoint[0] =
                                this._config.renderer["resolution_x"] - dim[0];
                            alignmentOffsetX = dim[0];
                            break;
                        case 1:
                            //CENTER
                            anchorPoint[0] =
                                (this._config.renderer["resolution_x"] -
                                    dim[0]) /
                                2;
                            alignmentOffsetX = dim[0] / 2;
                            break;
                        case 0:
                            //LEFT
                            alignmentOffsetX = 0;
                            break;
                    }
                    result.originalX = result.x = anchorPoint[0];
                    result.originalY = result.y = anchorPoint[1];
                    result.alignmentOffsetX = alignmentOffsetX;
                    result.alignmentOffsetY = alignmentOffsetY;
                } else {
                    let curPos = [0, 0];
                    let alignmentOffsetX = 0;
                    let alignmentOffsetY = 0;
                    if (lineOverrides.getMovement() === null) {
                        curPos = lineOverrides.getPosition();
                        switch (verticalAlignment) {
                            case 2:
                                //TOP
                                alignmentOffsetY = 0;
                                break;
                            case 1:
                                //MIDDLE
                                curPos[1] -= dim[1] / 2;
                                alignmentOffsetY = dim[1] / 2;
                                break;
                            case 0:
                                //BOTTOM
                                curPos[1] -= dim[1];
                                alignmentOffsetY = dim[1];
                                break;
                        }
                        switch (horizontalAlignment) {
                            case 2:
                                //RIGHT
                                curPos[0] -= dim[0];
                                alignmentOffsetX = dim[0];
                                break;
                            case 1:
                                //CENTER
                                curPos[0] -= dim[0] / 2;
                                alignmentOffsetX = dim[0] / 2;
                                break;
                            case 0:
                                //LEFT
                                alignmentOffsetX = 0;
                                break;
                        }
                        result.originalX = curPos[0];
                        result.originalY = curPos[1];
                        result.alignmentOffsetX = alignmentOffsetX;
                        result.alignmentOffsetY = alignmentOffsetY;
                    } else {
                        let move = lineOverrides.getMovement();
                        switch (verticalAlignment) {
                            case 2:
                                //TOP
                                alignmentOffsetY = 0;
                                break;
                            case 1:
                                //MIDDLE
                                move[1] -= dim[1] / 2;
                                move[3] -= dim[1] / 2;
                                alignmentOffsetY = dim[1] / 2;
                                break;
                            case 0:
                                move[1] -= dim[1];
                                move[3] -= dim[1];
                                alignmentOffsetY = dim[1];
                                break;
                        }
                        switch (horizontalAlignment) {
                            case 2:
                                //RIGHT
                                move[0] -= dim[0];
                                move[2] -= dim[0];
                                alignmentOffsetX = dim[0];
                            case 1:
                                //CENTER
                                move[0] -= dim[0] / 2;
                                move[2] -= dim[0] / 2;
                                alignmentOffsetX = dim[0] / 2;
                                break;
                            case 0:
                                alignmentOffsetX = 0;
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
                        result.originalY = move[1];
                        curPos[1] = sabre.performTransition(
                            time,
                            move[1],
                            move[3],
                            move[4],
                            move[5],
                            1
                        );
                        result.alignmentOffsetX = alignmentOffsetX;
                        result.alignmentOffsetY = alignmentOffsetY;
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

    _collideInternally: {
        /**
         * Collides within a single subtitle.
         * @private
         * @param {boolean} newLine is this a new line?.
         * @param {Array<Array<CollisionInfo>>} lines prior lines.
         * @param {CollisionInfo} localPositionInfo the current position info.
         * @param {Array<CollisionInfo>} lineInfos the current line's infos.
         */
        value: function (newLine, lines, localPositionInfo, lineInfos) {
            let horizontalAlignment = Math.floor(
                localPositionInfo.alignment % 3
            );
            let verticalAlignment = Math.floor(localPositionInfo.alignment / 3);
            switch (verticalAlignment) {
                case 2:
                    //TOP
                    for (let i = 0; i < lines.length - 1; i++) {
                        let max = 0;
                        for (let j = 0; j < lines[i].length; j++) {
                            max = Math.max(lines[i][j].height, max);
                        }
                        localPositionInfo.y += max;
                        localPositionInfo.originalY += max;
                        localPositionInfo.alignmentOffsetY -= max;
                    }
                    break;
                case 1:
                    //CENTER
                    for (let i = 0; i < lines.length - 1; i++) {
                        let max = 0;
                        for (let j = 0; j < lines[i].length; j++) {
                            max = Math.max(lines[i][j].height, max);
                        }
                        localPositionInfo.y += max / 2;
                        localPositionInfo.originalY += max / 2;
                        localPositionInfo.alignmentOffsetY -= max / 2;
                    }
                    break;
                case 0:
                    //BOTTOM
                    //Do Nothing unless newline.
                    break;
            }
            if (newLine) {
                let max;
                switch (verticalAlignment) {
                    case 2:
                        //TOP
                        max = 0;
                        for (
                            let j = 0;
                            j < lines[lines.length - 1].length;
                            j++
                        ) {
                            max = Math.max(
                                lines[lines.length - 1][j].height,
                                max
                            );
                        }
                        localPositionInfo.y += max;
                        localPositionInfo.originalY += max;
                        localPositionInfo.alignmentOffsetY -= max;
                        break;
                    case 1:
                        //CENTER
                        max = 0;
                        for (
                            let j = 0;
                            j < lines[lines.length - 1].length;
                            j++
                        ) {
                            max = Math.max(
                                lines[lines.length - 1][j].height,
                                max
                            );
                        }
                        localPositionInfo.y += max / 2;
                        localPositionInfo.originalY += max / 2;
                        localPositionInfo.alignmentOffsetY -= max / 2;

                        for (let i = 0; i < lines.length; i++) {
                            for (let j = 0; j < lines[i].length; j++) {
                                lines[i][j].y -= localPositionInfo.height / 2;
                                lines[i][j].originalY -=
                                    localPositionInfo.height / 2;
                                lines[i][j].alignmentOffsetY +=
                                    localPositionInfo.height / 2;
                            }
                        }
                        break;
                    case 0:
                        //BOTTOM
                        for (let i = 0; i < lines.length; i++) {
                            for (let j = 0; j < lines[i].length; j++) {
                                lines[i][j].y -= localPositionInfo.height;
                                lines[i][j].originalY -=
                                    localPositionInfo.height;
                                lines[i][j].alignmentOffsetY +=
                                    localPositionInfo.height;
                            }
                        }
                        break;
                }
                return true;
            } else {
                switch (horizontalAlignment) {
                    case 2:
                        //RIGHT
                        for (let i = 0; i < lineInfos.length; i++) {
                            lineInfos[i].x -= localPositionInfo.width;
                            lineInfos[i].originalX -= localPositionInfo.width;
                            lineInfos[i].alignmentOffsetX +=
                                localPositionInfo.width;
                        }
                        break;
                    case 1:
                        //CENTER
                        for (let i = 0; i < lineInfos.length; i++) {
                            lineInfos[i].x -= localPositionInfo.width / 2;
                            lineInfos[i].originalX -=
                                localPositionInfo.width / 2;
                            lineInfos[i].alignmentOffsetX +=
                                localPositionInfo.width / 2;
                        }
                        for (let i = 0; i < lineInfos.length; i++) {
                            localPositionInfo.x += lineInfos[i].width / 2;
                            localPositionInfo.originalX +=
                                lineInfos[i].width / 2;
                            localPositionInfo.alignmentOffsetX -=
                                lineInfos[i].width / 2;
                        }
                        break;
                    case 0:
                        //LEFT
                        for (let i = 0; i < lineInfos.length; i++) {
                            localPositionInfo.x += lineInfos[i].width;
                            localPositionInfo.originalX += lineInfos[i].width;
                            localPositionInfo.alignmentOffsetX +=
                                lineInfos[i].width;
                        }
                        break;
                }
                return false;
            }
        },
        writable: false
    },

    _collideEvent: {
        /**
         * Collides two events. This function ensures that events that are not supposed to overlap, if they are overlapping, get moved out of the way in a manner consistant with the standard.
         * @private
         * @param {CollisionInfo} positionInfo1 current event's position info.
         * @param {Array<CollisionInfo>} posInfosForMatchingId1 position infos for events who's id matches the current event's id.
         * @param {CollisionInfo} positionInfo2 the position info of the event we're colliding with.
         * @param {Array<CollisionInfo>} posInfosForMatchingId2 position infos for events who's id matches the colliding event's id.
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
                                posInfosForMatchingId2[i].y +=
                                    posInfosForMatchingId1[i].height;
                                posInfosForMatchingId2[i].y += overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId1.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y -= overlap[1];
                            }
                        }
                    } else if (overlap[1] > 0) {
                        if (positionInfo1.index < positionInfo2.index) {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId2[i].y -= overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId1.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y +=
                                    positionInfo2.height;
                                posInfosForMatchingId1[i].y += overlap[1];
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
                                posInfosForMatchingId2[i].y +=
                                    posInfosForMatchingId1[i].height;
                                posInfosForMatchingId2[i].y += overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId1.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y -= overlap[1];
                            }
                        }
                    } else if (overlap[1] < 0) {
                        if (positionInfo1.index > positionInfo2.index) {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId2.length;
                                i++
                            ) {
                                posInfosForMatchingId2[i].y -= overlap[1];
                            }
                        } else {
                            for (
                                let i = 0;
                                i < posInfosForMatchingId1.length;
                                i++
                            ) {
                                posInfosForMatchingId1[i].y +=
                                    positionInfo2.height;
                                posInfosForMatchingId1[i].y += overlap[1];
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
         * Collides an event with the viewport. This ensures that the events are visible onscreen.
         * @private
         * @param {CollisionInfo} positionInfo current event's position info.
         * @param {Array<CollisionInfo>} posInfosForMatchingId position infos for events who's id matches the current event's id.
         * @returns {boolean} did we move something?
         */
        value: function (positionInfo, posInfosForMatchingId) {
            let horizontalAlignment = Math.floor(positionInfo.alignment % 3);
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
                    ydistance = -(positionInfo.y - positionInfo.marginVertical);
                    yshouldmove = ydistance > 0;
                    break;
                case 1:
                    //CENTER
                    //We aren't aligned to a side so do nothing. //TODO: is this really right?
                    break;
                case 0:
                    //BOTTOM
                    ydistance =
                        this._config.renderer["resolution_y"] -
                        (positionInfo.y +
                            positionInfo.height +
                            positionInfo.marginVertical);
                    yshouldmove = ydistance < 0;
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

    _subdivideEvents: {
        /**
         * Breakup the events on spaces.
         * @param {Array<SSASubtitleEvent>} events
         */
        value: function (events) {
            let cur_event, new_event, next_event, text;
            for (let i = 0; i < events.length; i++) {
                cur_event = events[i];
                if (cur_event.getOverrides().getDrawingMode()) continue;
                text = cur_event.getText();
                for (let j = 1; j < text.length; j++) {
                    if (text[j] === " ") {
                        //TODO: Fix the issue this causes with karaoke wipes.
                        new_event = sabre.cloneEventWithoutText(cur_event);
                        new_event.setNewLine(cur_event.isNewLine());
                        next_event = sabre.cloneEventWithoutText(cur_event);
                        new_event.setText(text.slice(0, j));
                        next_event.setText(text.slice(j));
                        events.splice(i, 1, new_event, next_event);
                        break;
                    }
                }
                if (cur_event === events[i]) {
                    events[i] = sabre.cloneEventWithoutText(cur_event);
                    events[i].setText(text);
                    events[i].setNewLine(cur_event.isNewLine());
                }
            }
        },
        writable: false
    },

    _wordWrap: {
        /**
         * Handle if a line gets too long.
         * @param {number} time The current time.
         * @param {Array<SSASubtitleEvent>} events the list of events
         */
        value: function (time, events) {
            let width = 0;
            let last_id = -1;
            let line_start = 0;
            let event_widths = [];
            for (let i = 0; i < events.length; i++) {
                let cur_event = events[i];
                if (!cur_event.getOverrides().getDrawingMode()) {
                    if (cur_event.getId() !== last_id) {
                        last_id = events[i].getId();
                        width = 0;
                        line_start = i;
                    }
                    let wrap_style =
                        cur_event.getOverrides().getWrapStyle() ??
                        this._config.renderer["default_wrap_style"];
                    if (
                        wrap_style < sabre.WrapStyleModes.SMART ||
                        wrap_style > sabre.WrapStyleModes.SMART_INVERSE
                    ) {
                        wrap_style =
                            this._config.renderer["default_wrap_style"];
                    }
                    if (wrap_style === sabre.WrapStyleModes.NONE) continue;
                    this._textRenderer.renderEvent(
                        time,
                        cur_event,
                        sabre.RenderPasses.FILL,
                        true
                    );

                    let marginLeft, marginRight;
                    {
                        let style = cur_event.getStyle();
                        let overrides = cur_event.getOverrides();
                        let styleMargins = style.getMargins();
                        let overrideMargins = overrides.getMargins();
                        {
                            marginLeft = overrideMargins[0] || styleMargins[0];
                            marginRight = overrideMargins[1] || styleMargins[1];
                        }
                    }

                    let available_width =
                        this._config.renderer["resolution_x"] -
                        marginLeft -
                        marginRight;
                    let event_width = this._textRenderer.getBounds()[0];
                    event_widths[i] = event_width;
                    if (cur_event.isNewLine()) {
                        width = 0;
                        line_start = i;
                    }
                    if (width + event_width > available_width) {
                        if (
                            wrap_style === sabre.WrapStyleModes.SMART ||
                            wrap_style === sabre.WrapStyleModes.SMART_INVERSE
                        ) {
                            let internal_width = 0;
                            for (let j = line_start; j <= i; j++) {
                                if (
                                    internal_width + event_widths[j] >
                                    available_width / 2
                                ) {
                                    let offset =
                                        wrap_style ===
                                        sabre.WrapStyleModes.SMART
                                            ? 1
                                            : 0;
                                    if (j + offset < events.length) {
                                        let internal_text =
                                            events[j + offset].getText();
                                        if (internal_text[0] === " ") {
                                            if (internal_text !== " ")
                                                events[j + offset].setText(
                                                    internal_text.slice(1)
                                                );
                                            else events[j + offset].setText("");
                                            this._textRenderer.renderEvent(
                                                time,
                                                events[j + offset],
                                                sabre.RenderPasses.FILL,
                                                true
                                            );
                                            event_widths[j + offset] =
                                                this._textRenderer.getBounds()[0];
                                        }
                                        events[j + offset].setNewLine(true);
                                        i = j + offset - 1;
                                    }
                                    break;
                                } else internal_width += event_widths[j];
                            }
                        } else if (wrap_style === sabre.WrapStyleModes.EOL) {
                            cur_event.setNewLine(true);
                            let internal_text = cur_event.getText();
                            if (internal_text[0] === " ") {
                                if (internal_text !== " ")
                                    cur_event.setText(internal_text.slice(1));
                                else cur_event.setText("");
                                this._textRenderer.renderEvent(
                                    time,
                                    cur_event,
                                    sabre.RenderPasses.FILL,
                                    true
                                );
                                event_widths[i] =
                                    this._textRenderer.getBounds()[0];
                            }
                            width = event_widths[i];
                            line_start = i;
                        }
                    } else width += event_width;
                }
            }
        },
        writable: false
    },

    _organizeEvents: {
        /**
         * Positions events onscreen and handles collisions.
         * @private
         * @param {number} time time of current frame.
         * @param {Array<SSASubtitleEvent>} events list of onscreen subtitle events for this frame in order of layer.
         * @returns {Array<CollisionInfo>} each event's position onscreen.
         */
        value: function (time, events) {
            let result = new Array(events.length);
            let resultsForId = {};
            this._subdivideEvents(events);
            this._wordWrap(time, events);
            {
                let lineInfos = [];
                let lines = [lineInfos];
                let lastId = -1;
                for (let i = 0; i < events.length; i++) {
                    let id = events[i].getId();
                    let newLineForced = events[i].isNewLine();
                    if (lastId !== id) {
                        resultsForId[id] = [];
                        lineInfos = [];
                        lines = [lineInfos];
                        lastId = id;
                    }

                    result[i] = this._positionEvent(time, i, events[i]);
                    if (lineInfos.length >= 1) {
                        if (
                            this._collideInternally(
                                newLineForced,
                                lines,
                                result[i],
                                lineInfos
                            )
                        ) {
                            lineInfos = [result[i]];
                            lines.push(lineInfos);
                        } else {
                            lineInfos.push(result[i]);
                        }
                    } else {
                        lineInfos.push(result[i]);
                    }
                    resultsForId[id].push(result[i]);
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
            const default_tex_coords = new Float32Array([
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
                default_tex_coords,
                this._gl.DYNAMIC_DRAW
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
            this._textureSubtitleBounds = [1, 1];

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
                "u_aspectscale",
                new Float32Array([1, 1]),
                "2f"
            );
            this._positioningShader.addOption(
                "u_pre_rotation_matrix",
                new Float32Array([
                    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
                ]),
                "Matrix4fv"
            );
            this._positioningShader.addOption(
                "u_rotation_matrix_x",
                new Float32Array([
                    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
                ]),
                "Matrix4fv"
            );
            this._positioningShader.addOption(
                "u_rotation_matrix_y",
                new Float32Array([
                    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
                ]),
                "Matrix4fv"
            );
            this._positioningShader.addOption(
                "u_rotation_matrix_z",
                new Float32Array([
                    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
                ]),
                "Matrix4fv"
            );
            this._positioningShader.addOption(
                "u_post_rotation_matrix",
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

    _getBlurInfoForCompositing: {
        /**
         * Gets the blur information required for compositing.
         * @param {number} time the current time we're rendering at.
         * @param {SSASubtitleEvent} currentEvent the current subtitle event.
         * @param {number} pass the render pass we're on.
         * @returns {?{blur:number,gaussBlur:number}}
         */
        value: function (time, currentEvent, pass) {
            let borderStyle = currentEvent.getStyle().getBorderStyle();
            let outline = this._calcOutline(
                time,
                currentEvent.getStyle(),
                currentEvent.getOverrides()
            );
            if (
                borderStyle === sabre.BorderStyleModes.NORMAL ||
                borderStyle === sabre.BorderStyleModes.UNKNOWN
            ) {
                if (
                    pass === sabre.RenderPasses.OUTLINE &&
                    outline.x === 0 &&
                    outline.y === 0
                )
                    return null;
                if (
                    pass === sabre.RenderPasses.FILL &&
                    (outline.x > 0 || outline.y > 0)
                )
                    return null;
            }
            let info = {};
            info.blur = this._calcEdgeBlur(
                time,
                currentEvent.getStyle(),
                currentEvent.getOverrides()
            );
            info.gaussBlur = this._calcGaussianBlur(
                time,
                currentEvent.getStyle(),
                currentEvent.getOverrides()
            );
            if (info.blur == 0 && info.gaussBlur == 0) return null;
            return info;
        },
        writable: false
    },

    _shouldDisableBlendForCompositePass: {
        /**
         * Test if we should disable the blend for compositing.
         * @param {SSASubtitleEvent} currentEvent
         * @param {number} pass
         * @returns {boolean} should we disable blend?
         */
        value: function (currentEvent, pass) {
            return (
                pass === sabre.RenderPasses.BACKGROUND &&
                currentEvent.getStyle().getBorderStyle() ===
                    sabre.BorderStyleModes.SRT_NO_OVERLAP
            );
        },
        writable: false
    },

    _calcPositioningMatrices: {
        /**
         * Calculates the matrix used to position the subtitle
         * @param {number} time the current frame's time.
         * @param {Canvas2DTextRenderer|Canvas2DShapeRenderer} source the source.
         * @param {CollisionInfo} position the collision and positiong info of the event.
         * @param {SSASubtitleEvent} event the event we're working on.
         * @returns {Object} the resulting matrix.
         */
        value: function (time, source, position, event) {
            const toRad = Math.PI / 180;

            let rotation = this._calcRotation(
                time,
                event.getStyle(),
                event.getOverrides()
            );
            rotation[0] *= toRad;
            rotation[1] *= toRad;
            rotation[2] *= toRad;

            let sinx = Math.sin(rotation[0]);
            let siny = Math.sin(rotation[1]);
            let sinz = Math.sin(rotation[2]);

            let cosx = Math.cos(rotation[0]);
            let cosy = Math.cos(rotation[1]);
            let cosz = Math.cos(rotation[2]);

            let preRotationMatrix;
            {
                let offset = source.getOffset();
                // prettier-ignore
                preRotationMatrix = {
                    m00: 1, m01: 0, m02: 0, m03: -offset[0],
                    m10: 0, m11: 1, m12: 0, m13: offset[1],
                    m20: 0, m21: 0, m22: 1, m23: 0,
                    m30: 0, m31: 0, m32: 0, m33: 1
                };
            }
            //NOTE: Shear the subtitle.
            {
                let shear = this._calcShear(
                    time,
                    event.getStyle(),
                    event.getOverrides()
                );

                let shearMatrix = {
                    m00: 1 + shear.x * shear.y,
                    m01: shear.x,
                    m02: 0,
                    m03: 0,
                    m10: shear.y,
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

                preRotationMatrix = this._matrixMultiply4x4(
                    preRotationMatrix,
                    shearMatrix
                );
            }

            let rotationOrigin = event.getLineOverrides().getRotationOrigin();

            let rotationOffset;
            if (rotationOrigin == null)
                rotationOffset = [
                    -position.alignmentOffsetX,
                    -position.alignmentOffsetY
                ];
            else
                rotationOffset = [
                    position.x - rotationOrigin[0],
                    position.y - rotationOrigin[1]
                ];

            //NOTE: Position the subtitle for rotation.
            let postRotationMatrix;
            {
                /*console.log("----------------");
                console.log("Event: ",event.getText())
                console.log("Position: ",position.x,position.y);
                console.log("AlignmentOffset: ",position.alignmentOffsetX,position.alignmentOffsetY);
                console.log("RotationOrigin: ",rotationOrigin);
                console.log("RotationOffset: ",rotationOffset);*/

                // prettier-ignore
                let preRotationTranslationMatrix = {
                    m00: 1, m01: 0, m02: 0, m03: rotationOffset[0],
                    m10: 0, m11: 1, m12: 0, m13: -rotationOffset[1],
                    m20: 0, m21: 0, m22: 1, m23: 0,
                    m30: 0, m31: 0, m32: 0, m33: 1,
                };

                // prettier-ignore
                postRotationMatrix = {
                    m00: 1, m01: 0, m02: 0, m03: -rotationOffset[0],
                    m10: 0, m11: 1, m12: 0, m13: rotationOffset[1],
                    m20: 0, m21: 0, m22: 1, m23: 0,
                    m30: 0, m31: 0, m32: 0, m33: 1
                };

                preRotationMatrix = this._matrixMultiply4x4(
                    preRotationMatrix,
                    preRotationTranslationMatrix
                );
            }

            let rotationMatrixX;
            let rotationMatrixY;
            let rotationMatrixZ;
            //NOTE: Rotate the subtitle.
            {
                // prettier-ignore
                rotationMatrixX = {
                    m00: 1, m01: 0,     m02: 0,     m03: 0,
                    m10: 0, m11: cosx,  m12: -sinx, m13: 0,
                    m20: 0, m21: sinx,  m22: cosx,  m23: 0,
                    m30: 0, m31: 0,     m32: 0,     m33: 1
                };
            }

            {
                // prettier-ignore
                rotationMatrixY = {
                    m00: cosy,  m01: 0, m02: siny,  m03: 0,
                    m10: 0,     m11: 1, m12: 0,     m13: 0,
                    m20: -siny, m21: 0, m22: cosy,  m23: 0,
                    m30: 0,     m31: 0, m32: 0,     m33: 1
                };
            }

            {
                // prettier-ignore
                rotationMatrixZ = {
                    m00: cosz,  m01: -sinz, m02: 0, m03: 0,
                    m10: sinz,  m11: cosz,  m12: 0, m13: 0,
                    m20: 0,     m21: 0,     m22: 1, m23: 0,
                    m30: 0,     m31: 0,     m32: 0, m33: 1,
                };
            }

            //NOTE: Position for display.
            {
                let translatedPositionY =
                    this._config.renderer["resolution_y"] - position.y;

                // prettier-ignore
                let finalOffsetMatrix = {
                    m00: 1, m01: 0, m02: 0, m03: position.x,
                    m10: 0, m11: 1, m12: 0, m13: translatedPositionY,
                    m20: 0, m21: 0, m22: 1, m23: 0,
                    m30: 0, m31: 0, m32: 0, m33: 1
                };

                postRotationMatrix = this._matrixMultiply4x4(
                    postRotationMatrix,
                    finalOffsetMatrix
                );
            }

            return [
                preRotationMatrix,
                rotationMatrixX,
                rotationMatrixY,
                rotationMatrixZ,
                postRotationMatrix
            ];
        },
        writable: false
    },

    _loadSubtitleToVram: {
        /**
         * Loads a subtitle into graphics card's VRAM.
         * @param {Canvas2DTextRenderer|Canvas2DShapeRenderer} source the source.
         */
        value: function (source) {
            let extents = source.getExtents();
            if (
                extents[0] <= this._textureSubtitleBounds[0] &&
                extents[1] <= this._textureSubtitleBounds[1]
            ) {
                this._gl.texSubImage2D(
                    this._gl.TEXTURE_2D,
                    0,
                    0,
                    this._textureSubtitleBounds[1] - extents[1],
                    this._gl.RGBA,
                    this._gl.UNSIGNED_BYTE,
                    source.getImage()
                );
            } else {
                this._gl.texImage2D(
                    this._gl.TEXTURE_2D,
                    0,
                    this._gl.RGBA,
                    this._gl.RGBA,
                    this._gl.UNSIGNED_BYTE,
                    source.getImage()
                );
                this._textureSubtitleBounds[0] = extents[0];
                this._textureSubtitleBounds[1] = extents[1];
            }
        },
        writable: false
    },

    _compositeSubtitle: {
        /**
         * Performs the actual compositing of the subtitles onscreen.
         * @param {number} time The time the subtitle must be rendered at.
         * @param {SSASubtitleEvent} currentEvent The properties of the subtitle.
         * @param {number} pass the current render pass we are on.
         * @param {CollisionInfo} position the positioning info of the subtitle.
         * @param {boolean} isShape is the subtitle we are compositing a shape?
         */
        value: function (time, currentEvent, pass, position, isShape) {
            let blurInfo = this._getBlurInfoForCompositing(
                time,
                currentEvent,
                pass
            );

            //This is to disable blending of SRT_NO_OVERLAP backgrounds so there's no overlap showing.
            let blendDisabled = this._shouldDisableBlendForCompositePass(
                currentEvent,
                pass
            );
            if (blendDisabled) this._gl.disable(this._gl.BLEND);

            let source = !isShape ? this._textRenderer : this._shapeRenderer;

            if (blurInfo === null) {
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            } else {
                this._gl.bindFramebuffer(
                    this._gl.FRAMEBUFFER,
                    this._frameBufferA
                );
                this._gl.clear(
                    this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
                );
            }

            this._gl.bindTexture(this._gl.TEXTURE_2D, this._textureSubtitle);

            this._loadSubtitleToVram(source);

            let xScale = 2 / this._config.renderer["resolution_x"];
            let yScale = 2 / this._config.renderer["resolution_y"];

            let positioningMatrices = this._calcPositioningMatrices(
                time,
                source,
                position,
                currentEvent
            );

            let dimensions = source.getDimensions();

            let upperLeft = {
                m00: 0,
                m01: 0,
                m02: 0
            };

            let lowerLeft = {
                m00: 0,
                m01: -dimensions[1],
                m02: 0
            };

            let upperRight = {
                m00: dimensions[0],
                m01: 0,
                m02: 0
            };

            let lowerRight = {
                m00: dimensions[0],
                m01: -dimensions[1],
                m02: 0
            };

            // prettier-ignore
            let coordinates = new Float32Array([
                upperLeft.m00,  upperLeft.m01,  upperLeft.m02,
                upperRight.m00, upperRight.m01, upperRight.m02,
                lowerLeft.m00,  lowerLeft.m01,  lowerLeft.m02,
                lowerLeft.m00,  lowerLeft.m01,  lowerLeft.m02,
                upperRight.m00, upperRight.m01, upperRight.m02,
                lowerRight.m00, lowerRight.m01, lowerRight.m02
            ]);

            let tex_coords;
            {
                let extents = this._textureSubtitleBounds;
                let width = dimensions[0] / extents[0];
                let height = dimensions[1] / extents[1];
                // prettier-ignore
                tex_coords = new Float32Array([
                    0,      1,
                    width,  1,
                    0,      1 - height,
                    0,      1 - height,
                    width,  1,
                    width,  1 - height
                ]);
            }
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
                    {
                        let alpha = 1;
                        let fade = currentEvent.getLineOverrides().getFade();
                        if (fade !== null) {
                            if (time < fade[3]) {
                                //Before Fade in.
                                alpha = fade[0];
                            } else if (time < fade[4]) {
                                //Fade In.
                                alpha = sabre.performTransition(
                                    time,
                                    fade[0],
                                    fade[1],
                                    fade[3],
                                    fade[4],
                                    1
                                );
                            } else if (time < fade[5]) {
                                //After fade in, before fade out.
                                alpha = fade[1];
                            } else if (time < fade[6]) {
                                //Fade out.
                                alpha = sabre.performTransition(
                                    time,
                                    fade[1],
                                    fade[2],
                                    fade[5],
                                    fade[6],
                                    1
                                );
                            } else {
                                //After Fade out.
                                alpha = fade[2];
                            }
                            primaryColorArray[3] *= alpha;
                            secondaryColorArray[3] *= alpha;
                            tertiaryColorArray[3] *= alpha;
                            quaternaryColorArray[3] *= alpha;
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
                    "u_pre_rotation_matrix",
                    new Float32Array(
                        this._matrixToArrayRepresentation4x4(
                            positioningMatrices[0]
                        )
                    )
                );
                this._positioningShader.updateOption(
                    "u_rotation_matrix_x",
                    new Float32Array(
                        this._matrixToArrayRepresentation4x4(
                            positioningMatrices[1]
                        )
                    )
                );
                this._positioningShader.updateOption(
                    "u_rotation_matrix_y",
                    new Float32Array(
                        this._matrixToArrayRepresentation4x4(
                            positioningMatrices[2]
                        )
                    )
                );
                this._positioningShader.updateOption(
                    "u_rotation_matrix_z",
                    new Float32Array(
                        this._matrixToArrayRepresentation4x4(
                            positioningMatrices[3]
                        )
                    )
                );
                this._positioningShader.updateOption(
                    "u_post_rotation_matrix",
                    new Float32Array(
                        this._matrixToArrayRepresentation4x4(
                            positioningMatrices[4]
                        )
                    )
                );
                this._positioningShader.updateOption(
                    "u_aspectscale",
                    new Float32Array([xScale, yScale])
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

                this._gl.bufferData(
                    this._gl.ARRAY_BUFFER,
                    tex_coords,
                    this._gl.DYNAMIC_DRAW
                );
                this._gl.bindBuffer(
                    this._gl.ARRAY_BUFFER,
                    this._subtitlePositioningBuffer
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
                this._gl.bufferData(
                    this._gl.ARRAY_BUFFER,
                    coordinates,
                    this._gl.DYNAMIC_DRAW
                );
                this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
            }

            if (blurInfo !== null) {
                let backFramebuffer = this._frameBufferB;
                let sourceFramebuffer = this._frameBufferA;
                let backTexture = this._fbTextureB;
                let sourceTexture = this._fbTextureA;
                if (blurInfo.blur > 0) {
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
                    for (let i = 0; i < blurInfo.blur - 1; i++) {
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
                    if (blurInfo.gaussBlur > 0) {
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

                if (blurInfo.gaussBlur > 0) {
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
                        blurInfo.gaussBlur
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
                        blurInfo.gaussBlur
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
            this._gl.viewport(0, 0, width, height);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferB);
            this._gl.viewport(0, 0, width, height);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            this._gl.viewport(0, 0, width, height);
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
                if (ldiff === 0) {
                    let idiff = a.getId() - b.getId();
                    if (idiff === 0) return a.getOrder() - b.getOrder();
                    return idiff;
                } else return ldiff;
            });

            if (!this._listOfEventsContainsAnimation(events)) {
                let currentHash = this._hashEvents(events);
                if (currentHash === this._lastHash && !this._lastAnimating)
                    return;
                this._lastAnimating = false;
                this._lastHash = currentHash;
            } else {
                this._lastAnimating = true;
            }

            this._gl.clear(
                this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT
            );
            let positions = this._organizeEvents(time, events);
            for (let i = 0; i < events.length; ) {
                for (let pass = 0; pass < 3; pass++) {
                    //One pass for background, one for outline and one for text.
                    let j = 0;
                    for (
                        ;
                        i + j < events.length &&
                        events[i + j].getLayer() === events[i].getLayer();
                        j++
                    ) {
                        let currentEvent = events[i + j];
                        if (
                            currentEvent.getText() === "" ||
                            currentEvent.getText().match(/^\s+$/) !== null
                        )
                            continue;
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
                                positions[i + j],
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
                                positions[i + j],
                                true
                            );
                        }
                    }
                    if (pass == 2) i += j;
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
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(
                    this._compositingCanvas,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
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
