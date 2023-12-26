/*
 |   renderer-main.js
 |----------------
 |  renderer-main.js is copyright Patrick Rhodes Martin 2014-2021.
 |
 |-
 */
//@include [util]
//@include [global-constants]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]
//@include [subtitle-parser]
//@include [scheduler]
//@include [shader]
//@include [font-server]
//@include [canvas-2d-text-renderer]
//@include [canvas-2d-shape-renderer]
//@include [lib/BSpline]
//@include [lib/earcut]

/**
 * @fileoverview webgl subtitle compositing code.
 */

/**
 * @private
 * @typedef {!{m00:number,m01:number,m02:number,m03:number,m10:number,m11:number,m12:number,m13:number,m20:number,m21:number,m22:number,m23:number,m30:number,m31:number,m32:number,m33:number}}
 */
let Matrix4x4;

/**
 * @private
 * @typedef {!{x:number,y:number,width:number,height:number,index:number,marginLeft:number,marginRight:number,marginVertical:number,alignment:number,alignmentOffsetX:number,alignmentOffsetY:number}}
 */
let CollisionInfo;

/**
 * @private 
 * @typedef {!{x:number,y:number,x2:number,y2:number}}
 */
let AvailableSpace;

/**
 * @private
 * @typedef {{x:number,y:number,width:number,height:number,extents:Array<number>,offset:Array<number>,offsetExternal:Array<number>,dimensions:Array<number>,textureDimensions:Array<number>}}
 */
let GlyphCacheInfo;

/**
 * Is ImageBitmap Supported.
 * @type {boolean}
 * @private
 */
const isImageBitmapSupported =
    typeof global.ImageBitmapRenderingContext !== "undefined" &&
    typeof global.ImageBitmap !== "undefined" &&
    typeof global.OffscreenCanvas !== "undefined";

const renderer_prototype = global.Object.create(Object, {
    //BEGIN MODULE VARIABLES

    _scheduler: {
        /** @type {?SubtitleScheduler} */
        value: null,
        writable: true
    },

    _fontServer: {
        /** @type {?FontServer} */
        value: null,
        writable: true
    },

    _textRenderer: {
        /** @type {?Canvas2DTextRenderer} */
        value: null,
        writable: true
    },

    _textMaskRenderer: {
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

    _lastPixelRatio: {
        /** @type {number} */
        value: NaN,
        writable: true
    },

    _lastDim: {
        /** @type {?Array<number>} */
        value: null,
        writable: true
    },

    _glyphCache: {
        /** @type {?Object<number,Object<number,GlyphCacheInfo>>} */
        value: null,
        writable: true
    },

    _cacheAvailability: {
        /** @type {?Array<AvailableSpace>} */
        value: null,
        writable: true
    },

    _compositingCanvas: {
        /** @type {?(HTMLCanvasElement|OffscreenCanvas)} */
        value: null,
        writable: true
    },

    //BEGIN WEBGL VARIABLES

    _renderData: {
        /** @type {Object<string,Float32Array>} */
        value: null,
        writable: true
    },

    _gl: {
        /** @type {?WebGLRenderingContext} */
        value: null,
        writable: true
    },

    _textureCoordinatesBuffer: {
        /** @type {?WebGLBuffer} */
        value: null,
        writable: true
    },

    _maskCoordinatesBuffer: {
        /** @type {?WebGLBuffer} */
        value: null,
        writable: true
    },

    _subtitlePositioningBuffer: {
        /** @type {?WebGLBuffer} */
        value: null,
        writable: true
    },

    _fullscreenPositioningBuffer: {
        /** @type {?WebGLBuffer} */
        value: null,
        writable: true
    },

    _clipBuffer: {
        /** @type {?WebGLBuffer} */
        value: null,
        writable: true
    },

    _textureSubtitle: {
        /** @type {?WebGLTexture} */
        value: null,
        writable: true
    },

    _textureSubtitleBounds: {
        /** @type {?Array<number>} */
        value: null,
        writable: true
    },

    _textureSubtitleMaskBounds: {
        /** @type {?Array<number>} */
        value: null,
        writable: true
    },

    _fbTextureA: {
        /** @type {?WebGLTexture} */
        value: null,
        writable: true
    },

    _fbTextureB: {
        /** @type {?WebGLTexture} */
        value: null,
        writable: true
    },

    _fbTextureCache: {
        /** @type {?WebGLTexture} */
        value: null,
        writable: true
    },

    _frameBufferA: {
        /** @type {?WebGLFramebuffer} */
        value: null,
        writable: true
    },

    _frameBufferB: {
        /** @type {?WebGLFramebuffer} */
        value: null,
        writable: true
    },

    _frameBufferCache: {
        /** @type {?WebGLFramebuffer} */
        value: null,
        writable: true
    },

    _positioningShader: {
        /** @type {?Shader} */
        value: null,
        writable: true
    },

    _convEdgeBlurShader: {
        /** @type {?Shader} */
        value: null,
        writable: true
    },

    _gaussEdgeBlurPass1Shader: {
        /** @type {?Shader} */
        value: null,
        writable: true
    },

    _gaussEdgeBlurPass2Shader: {
        /** @type {?Shader} */
        value: null,
        writable: true
    },

    _clipShader: {
        /** @type {?Shader} */
        value: null,
        writable: true
    },

    _cacheShader: {
        /** @type {?Shader} */
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

    _getCacheWidth: {
        /**
         * Get the target width for the cache texture.
         * @private
         * @returns {number} the width of of the cache texture to generate.
         */
        value: function _getCacheWidth () {
            const pixelRatio = sabre.getPixelRatio();
            return Math.max(this._compositingCanvas.width*2,global.screen.width*pixelRatio);
        },
        writable: false
    },

    _getCacheHeight: {
        /**
         * Get the target height for the cache texture.
         * @private
         * @returns {number} the height of of the cache texture to generate.
         */
        value: function _getCacheHeight () {
            const pixelRatio = sabre.getPixelRatio();
            return Math.max(this._compositingCanvas.height*2,global.screen.height*pixelRatio);
        },
        writable: false
    },

    _findFont: {
        /**
         * Find a font for use in the canvas 2d renderer.
         * @private
         * @param {string} name name to search for.
         * @param {number} weight weight to search for.
         * @param {boolean} italic weither or not to search for an italic font.
         * @returns {{font:Font,foundItalic:boolean,foundWeight:number}} Result of the search.
         */
        value: function _findFont (name, weight, italic) {
            const fonts = this._fontServer.getFontsAndInfo(name);
            let result = null;
            let bestScore = 0;
            for (let i = 0; i < fonts.length; i++) {
                let foundItalic = (fonts[i].selection & 1) > 0;
                let foundWeight = fonts[i].weight;
                let score = 0;
                if (foundItalic === italic) {
                    score += 10;
                }
                score += 8 - Math.abs(weight - foundWeight) / 100;
                if (score > bestScore) {
                    bestScore = score;
                    result = {
                        "font": fonts[i].font,
                        "foundItalic": foundItalic,
                        "foundWeight": foundWeight,
                        "strikethroughSize": fonts[i].strikethroughSize,
                        "strikethroughPosition": fonts[i].strikethroughPosition,
                        "underlineThickness": fonts[i].underlineThickness,
                        "underlinePosition": fonts[i].underlinePosition
                    };
                    result["font"].ascender = fonts[i].ascent;
                    result["font"].descender = -fonts[i].descent;
                    result["font"].unitsPerEm =
                        fonts[i].ascent + fonts[i].descent;
                }
            }
            if (result === null) {
                const arial_fonts = this._fontServer.getFontsAndInfo("Arial");
                for (let i = 0; i < arial_fonts.length; i++) {
                    let foundItalic = (arial_fonts[i].selection & 1) > 0;
                    let foundWeight = arial_fonts[i].weight;
                    let score = 0;
                    if (foundItalic === italic) {
                        score += 10;
                    }
                    score += 8 - Math.abs(weight - foundWeight) / 100;
                    if (score > bestScore) {
                        bestScore = score;
                        result = {
                            "font": arial_fonts[i].font,
                            "foundItalic": foundItalic,
                            "foundWeight": foundWeight,
                            "strikethroughSize":
                                arial_fonts[i].strikethroughSize,
                            "strikethroughPosition":
                                arial_fonts[i].strikethroughPosition,
                            "underlineThickness":
                                arial_fonts[i].underlineThickness,
                            "underlinePosition":
                                arial_fonts[i].underlinePosition
                        };
                        result["font"].ascender = arial_fonts[i].ascent;
                        result["font"].descender = -arial_fonts[i].descent;
                        result["font"].unitsPerEm =
                            arial_fonts[i].ascent + arial_fonts[i].descent;
                    }
                }
            }
            if (result === null) throw "You forgot to include the font Arial.";
            return result;
        },
        writable: false
    },

    _bezierCurve: {
        /**
         * Interpolate a bezier curve.
         * @private
         * @param {number} t time
         * @param {number} p0x point 0 x
         * @param {number} p0y point 0 y
         * @param {number} p1x point 1 x
         * @param {number} p1y point 1 y
         * @param {number} p2x point 2 x
         * @param {number} p2y point 2 y
         * @param {number} p3x point 3 x
         * @param {number} p3y point 3 y
         * @returns {Array<number>} interpolated position
         */
        value: function _bezierCurve (t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
            let cX = 3 * (p1x - p0x),
                bX = 3 * (p2x - p1x) - cX,
                aX = p3x - p0x - cX - bX;

            let cY = 3 * (p1y - p0y),
                bY = 3 * (p2y - p1y) - cY,
                aY = p3y - p0y - cY - bY;

            let x = aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0x;
            let y = aY * Math.pow(t, 3) + bY * Math.pow(t, 2) + cY * t + p0y;

            return [x, y];
        },
        writable: false
    },

    _getFloat32Array: {
        /**
         * @private
         * @param {string} name name of the float32array.
         * @param {number} size size of the float32array.
         * @return {Float32Array} the array.
         */
        value: function _getFloat32Array (name, size) {
            if (!this._renderData[name]) {
                return (this._renderData[name] = new Float32Array(size));
            }
            return this._renderData[name];
        },
        writable: false
    },

    _matrixToArrayRepresentation4x4: {
        /**
         * Represent the matrix as an array, in openGL format.
         * @private
         * @return {Array<number>} the array representation.
         */
        value: function _matrixToArrayRepresentation4x4 (a) {
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
         * @param {Matrix4x4} a first matrix
         * @param {Matrix4x4} b second matrix
         * @return {Matrix4x4} the resulting matrix
         */
        value: function _matrixMultiply4x4 (a, b) {
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
         * @private
         * @param {Array<SSASubtitleEvent>} events list of SSASubtitleEvents
         * @return {boolean} do they use animation?
         */
        value: function _listOfEventsContainsAnimation (events) {
            for (let i = 0; i < events.length; i++) {
                if (
                    events[i].getLineOverrides().hasMovement() ||
                    events[i].getLineOverrides().getFade() !== null ||
                    (events[i].getLineTransitionTargetOverrides() !== null &&
                    events[i].getLineTransitionTargetOverrides().length > 0) ||
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

    _rectangleOffset: {
        value: function _rectangleOffset (x1, y1, w1, h1, x2, y2, w2, h2) {
            let m = [0, 0];
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
         * @private
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function _calcEdgeBlur (time, style, overrides) {
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
        /**
         * Calculates the gaussian blur factor.
         * @private
         * @param {number} time the current time
         * @param {SSAStyleDefinition} style the style of the subtitle
         * @param {SSAStyleOverride} overrides the overrides for the subtitle
         * @returns {number} the factor
         */
        value: function _calcGaussianBlur (time, style, overrides) {
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
         * @private
         * @param {number} time the current time
         * @param {SSAStyleDefinition} style the style of the subtitle
         * @param {SSAStyleOverride} overrides the overrides for the subtitle
         * @return {!{x:number,y:number}} the resulting outline values.
         */
        value: function _calcOutline (time, style, overrides) {
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
         * @private
         * @param {number} time the current time
         * @param {SSAStyleDefinition} style the style of the subtitle
         * @param {SSAStyleOverride} overrides the overrides for the subtitle
         * @return {!{x:number,y:number}} the resulting shear values.
         */
        value: function _calcShear (time, style, overrides) {
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
         * @private
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @returns {Array<number>} the rotation axes
         */
        value: function _calcRotation(time, style, overrides) {
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
         * @return {CollisionInfo} the positioning info of the event.
         */
        value: function _positionEvent (time, index, event) {
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
            let overridePos = lineOverrides.getPosition();
            let overrideMove = lineOverrides.getMovement();
            if (!event.getOverrides().getDrawingMode()) {
                this._textRenderer.calcBounds(time, event);
                let dim = this._textRenderer.getBounds();
                if (
                    overridePos === null &&
                    overrideMove === null
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
                    if (overrideMove === null) {
                        curPos = overridePos;
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
                        let move = overrideMove;
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
                    overridePos === null &&
                    overrideMove === null
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
                    if (overrideMove === null) {
                        curPos = overridePos;
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
                        let move = overrideMove;
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
        value: function _collideInternally (newLine, lines, localPositionInfo, lineInfos) {
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
         * @return {boolean} did we move something?
         */
        value: function _collideEvent (
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
         * @return {boolean} did we move something?
         */
        value: function _collideEventWithViewport (positionInfo, posInfosForMatchingId) {
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
        value: function _subdivideEvents (events) {
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
         * @private
         * @param {number} time The current time.
         * @param {Array<SSASubtitleEvent>} events the list of events
         */
        value: function _wordWrap (time, events) {
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
                    this._textRenderer.calcBounds(time, cur_event);

                    let marginLeft, marginRight;
                    {
                        let style = cur_event.getStyle();
                        let overrides = cur_event.getOverrides();
                        let styleMargins = style.getMargins();
                        let overrideMargins = overrides.getMargins();
                        {
                            marginLeft = overrideMargins[0] ?? styleMargins[0];
                            marginRight = overrideMargins[1] ?? styleMargins[1];
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
                                            this._textRenderer.calcBounds(
                                                time,
                                                events[j + offset]
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
                                this._textRenderer.calcBounds(time, cur_event);
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

    _mergeEvents: {
        /** 
         * Merge the events back togeather after word wrapping.
         * @private
         * @param {Array<SSASubtitleEvent>} events the list of events
         */
        value: function _mergeEvents (events) {
            for(let i = 0; i < events.length-1; i++){
                const firstEvent = events[i];
                const secondEvent = events[i+1];
                if(!secondEvent.isNewLine() && firstEvent.getId() === secondEvent.getId()){
                    if(firstEvent.getOverrides() === secondEvent.getOverrides() &&
                       firstEvent.getStyle() === secondEvent.getStyle()){
                        firstEvent.setText(firstEvent.getText()+secondEvent.getText())
                        events.splice(i+1,1);
                        i--;
                    }
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
         * @return {Array<CollisionInfo>} each event's position onscreen.
         */
        value: function _organizeEvents (time, events) {
            let result = new Array(events.length);
            let resultsForId = {};
            this._subdivideEvents(events);
            this._wordWrap(time, events);
            this._mergeEvents(events);
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
            let moved;
            let count = 0;
            do {
                moved = false;
                for (let i = 0; i < events.length; i++) {
                    if (result[i].width === 0 || result[i].height === 0)
                        continue;
                    if (
                        events[i].getLineOverrides().hasPosition() ||
                        events[i].getLineOverrides().hasMovement()
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
                            events[j].getLineOverrides().hasPosition() ||
                            events[j].getLineOverrides().hasMovement()
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
        /**
         * Setup the WebGL context.
         * @private
         */
        value: function _glSetup () {
            this._clearCache();
            const default_tex_coords = this._getFloat32Array("tex_coords", 12);
            default_tex_coords.set([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1], 0);
            const fullscreen_coordinates = this._getFloat32Array(
                "coordinates",
                18
            );
            fullscreen_coordinates.set([
                -1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0
            ]);
            this._gl.viewport(
                0,
                0,
                this._compositingCanvas.width,
                this._compositingCanvas.height
            );

            this._gl.clearColor(0, 0, 0, 0);
            this._gl.disable(this._gl.DEPTH_TEST);
            this._gl.enable(this._gl.BLEND);
            this._gl.blendFunc(
                this._gl.SRC_ALPHA,
                this._gl.ONE_MINUS_SRC_ALPHA
            );

            this._textureCoordinatesBuffer = this._gl.createBuffer();
            this._maskCoordinatesBuffer = this._gl.createBuffer();
            this._subtitlePositioningBuffer = this._gl.createBuffer();
            this._fullscreenPositioningBuffer = this._gl.createBuffer();
            this._clipBuffer = this._gl.createBuffer();

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
                this._maskCoordinatesBuffer
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

            this._textureSubtitleMask = this._gl.createTexture();
            this._gl.bindTexture(
                this._gl.TEXTURE_2D,
                this._textureSubtitleMask
            );
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
            this._textureSubtitleMaskBounds = [1, 1];

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
                this._compositingCanvas.width,
                this._compositingCanvas.height,
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
                this._compositingCanvas.width,
                this._compositingCanvas.height,
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );

            this._fbTextureCache = this._gl.createTexture();
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureCache);
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
                this._getCacheWidth(),
                this._getCacheHeight(),
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
                this._compositingCanvas.width,
                this._compositingCanvas.height
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
                this._compositingCanvas.width,
                this._compositingCanvas.height
            );
            this._gl.framebufferTexture2D(
                this._gl.FRAMEBUFFER,
                this._gl.COLOR_ATTACHMENT0,
                this._gl.TEXTURE_2D,
                this._fbTextureB,
                0
            );

            this._frameBufferCache = this._gl.createFramebuffer();
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferCache);
            this._gl.viewport(
                0,
                0,
                this._compositingCanvas.width,
                this._compositingCanvas.height
            );
            this._gl.framebufferTexture2D(
                this._gl.FRAMEBUFFER,
                this._gl.COLOR_ATTACHMENT0,
                this._gl.TEXTURE_2D,
                this._fbTextureCache,
                0
            );

            this._positioningShader = new sabre.Shader();
            this._positioningShader.load(
                sabre.getScriptPath() + "shaders/positioning.vertex.glsl",
                sabre.getScriptPath() + "shaders/positioning.fragment.glsl",
                1
            );
            this._positioningShader.compile(this._gl);
            this._positioningShader.addOption("u_aspectscale", [1, 1], "2f");
            const pre_rotation_matrix = this._getFloat32Array(
                "pre_rotation_matrix",
                16
            );
            pre_rotation_matrix.set(
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                0
            );
            this._positioningShader.addOption(
                "u_pre_rotation_matrix",
                pre_rotation_matrix,
                "Matrix4fv"
            );
            const rotation_matrix_x = this._getFloat32Array(
                "rotation_matrix_x",
                16
            );
            rotation_matrix_x.set(
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                0
            );
            this._positioningShader.addOption(
                "u_rotation_matrix_x",
                rotation_matrix_x,
                "Matrix4fv"
            );
            const rotation_matrix_y = this._getFloat32Array(
                "rotation_matrix_y",
                16
            );
            rotation_matrix_y.set(
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                0
            );
            this._positioningShader.addOption(
                "u_rotation_matrix_y",
                rotation_matrix_y,
                "Matrix4fv"
            );
            const rotation_matrix_z = this._getFloat32Array(
                "rotation_matrix_z",
                16
            );
            rotation_matrix_z.set(
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                0
            );
            this._positioningShader.addOption(
                "u_rotation_matrix_z",
                rotation_matrix_z,
                "Matrix4fv"
            );
            const post_rotation_matrix = this._getFloat32Array(
                "post_rotation_matrix",
                16
            );
            post_rotation_matrix.set(
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                0
            );
            this._positioningShader.addOption(
                "u_post_rotation_matrix",
                post_rotation_matrix,
                "Matrix4fv"
            );
            this._positioningShader.addOption("u_texture", 0, "1i");
            this._positioningShader.addOption("u_mask", 1, "1i");
            this._positioningShader.addOption("u_hasmask", 0, "1i");
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
                this._compositingCanvas.width,
                "1f"
            );
            this._convEdgeBlurShader.addOption(
                "u_resolution_y",
                this._compositingCanvas.height,
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
                this._compositingCanvas.width,
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
                this._compositingCanvas.height,
                "1f"
            );
            this._gaussEdgeBlurPass2Shader.addOption("u_texture", 0, "1i");
            this._gaussEdgeBlurPass2Shader.addOption("u_sigma", 0, "1f");

            this._clipShader = new sabre.Shader();
            this._clipShader.load(
                sabre.getScriptPath() + "shaders/clip.vertex.glsl",
                sabre.getScriptPath() + "shaders/clip.fragment.glsl",
                1
            );
            this._clipShader.compile(this._gl);
            this._clipShader.addOption("u_aspectscale", [1, 1], "2f");
            this._clipShader.addOption("u_texture", 0, "1i");
            
            this._cacheShader = new sabre.Shader();
            this._cacheShader.load(
                sabre.getScriptPath() + "shaders/cache.vertex.glsl",
                sabre.getScriptPath() + "shaders/cache.fragment.glsl",
                1
            );
            this._cacheShader.compile(this._gl);
            this._cacheShader.addOption("u_texture", 0, "1i");
        },
        writable: false
    },

    _getBlurInfoForCompositing: {
        /**
         * Gets the blur information required for compositing.
         * @private
         * @param {number} time the current time we're rendering at.
         * @param {SSASubtitleEvent} currentEvent the current subtitle event.
         * @param {number} pass the render pass we're on.
         * @return {?{blur:number,gaussBlur:number}} the blur info
         */
        value: function _getBlurInfoForCompositing (time, currentEvent, pass) {
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
            if (info.blur === 0 && info.gaussBlur === 0) return null;
            return info;
        },
        writable: false
    },

    _shouldDisableBlendForCompositePass: {
        /**
         * Test if we should disable the blend for compositing.
         * @private
         * @param {SSASubtitleEvent} currentEvent
         * @param {number} pass
         * @return {boolean} should we disable blend?
         */
        value: function _shouldDisableBlendForCompositePass (currentEvent, pass) {
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
         * @private
         * @param {number} time the current frame's time.
         * @param {Canvas2DTextRenderer|Canvas2DShapeRenderer} source the source.
         * @param {CollisionInfo} position the collision and positiong info of the event.
         * @param {SSASubtitleEvent} event the event we're working on.
         * @param {?GlyphCacheInfo} cachedGlyphInfo the info for the cached glyph.
         * @return {Array<Matrix4x4>} the resulting matrix.
         */
        value: function _calcPositioningMatrices (time, source, position, event, cachedGlyphInfo) {
            const toRad = Math.PI / 180;

            let rotation = this._calcRotation(
                time,
                event.getStyle(),
                event.getOverrides()
            );
            rotation[0] *= toRad;
            rotation[1] *= toRad;
            rotation[2] *= toRad;

            const sinx = Math.sin(rotation[0]);
            const siny = Math.sin(rotation[1]);
            const sinz = Math.sin(rotation[2]);

            const cosx = Math.cos(rotation[0]);
            const cosy = Math.cos(rotation[1]);
            const cosz = Math.cos(rotation[2]);

            let preRotationMatrix;
            {
                let offset;
                let offsetExternal;
                if (cachedGlyphInfo === null) {
                    offset = source.getOffset();
                    offsetExternal = source.getOffsetExternal();
                } else {
                    offset = cachedGlyphInfo.offset;
                    offsetExternal = cachedGlyphInfo.offsetExternal;
                }
                // prettier-ignore
                preRotationMatrix = {
                    m00: 1, m01: 0, m02: 0, m03: -offset[0]+offsetExternal[0],
                    m10: 0, m11: 1, m12: 0, m13: offset[1]-offsetExternal[1],
                    m20: 0, m21: 0, m22: 1, m23: 0,
                    m30: 0, m31: 0, m32: 0, m33: 1
                };
            }

            const rotationOrigin = event.getLineOverrides().getRotationOrigin();

            let rotationOffset;
            if (rotationOrigin === null)
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
                const translatedPositionY =
                    this._config.renderer["resolution_y"] - position.y;

                // prettier-ignore
                const positioningOffsetMatrix = {
                    m00: 1, m01: 0, m02: 0, m03: position.x,
                    m10: 0, m11: 1, m12: 0, m13: translatedPositionY,
                    m20: 0, m21: 0, m22: 1, m23: 0,
                    m30: 0, m31: 0, m32: 0, m33: 1
                };

                postRotationMatrix = this._matrixMultiply4x4(
                    postRotationMatrix,
                    positioningOffsetMatrix
                );
            }

            //NOTE: Shear the subtitle.
            {
                let shear = this._calcShear(
                    time,
                    event.getStyle(),
                    event.getOverrides()
                );

                // prettier-ignore
                const shearOffsetMatrix = {
                    m00: 1,     m01: 0,     m02: 0, m03: -position.alignmentOffsetX,
                    m10: 0,     m11: 1,     m12: 0, m13: position.alignmentOffsetY,
                    m20: 0,     m21: 0,     m22: 1, m23: 0,
                    m30: 0,     m31: 0,     m32: 0, m33: 1,
                };

                // prettier-ignore
                const shearMatrix = {
                    m00: 1 + (-shear.x * -shear.y), m01: -shear.x, m02: 0, m03: 0,
                    m10: -shear.y,                  m11: 1,        m12: 0, m13: 0,
                    m20: 0,                         m21: 0,        m22: 1, m23: 0,
                    m30: 0,                         m31: 0,        m32: 0, m33: 1
                };

                // prettier-ignore
                const shearOffsetResetMatrix = {
                    m00: 1,     m01: 0,     m02: 0, m03: position.alignmentOffsetX,
                    m10: 0,     m11: 1,     m12: 0, m13: -position.alignmentOffsetY,
                    m20: 0,     m21: 0,     m22: 1, m23: 0,
                    m30: 0,     m31: 0,     m32: 0, m33: 1,
                };

                postRotationMatrix = this._matrixMultiply4x4(
                    postRotationMatrix,
                    shearOffsetMatrix
                );

                postRotationMatrix = this._matrixMultiply4x4(
                    postRotationMatrix,
                    shearMatrix
                );

                postRotationMatrix = this._matrixMultiply4x4(
                    postRotationMatrix,
                    shearOffsetResetMatrix
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

    _getShapesFromPath: {
        /**
         * Takes a scale and a path and returns the perimeters of the shapes drawn.
         * @private
         * @param {number} scale the scale of the path.
         * @param {string} path the path itself.
         * @return {Array<Array<number>>} the shapes.
         */
        value: function _getShapesFromPath (scale, path) {
            //prep runtime stuff
            const parseFloat = global.parseFloat;
            const BSpline = sabre.BSpline;
            //end prep
            let uniquecommands = path.match(
                /[mnlbspc](?: -?\d+(?:\.\d+)? -?\d+(?:\.\d+)?)*/gi
            );
            if (uniquecommands === null) return [];
            let height = this._config.renderer["resolution_y"];
            let spline_points = null;
            let lastpos = [0, 0];
            let shapes = [];
            let current_shape = [];
            for (let i = 0; i < uniquecommands.length; i++) {
                let cmdtype = uniquecommands[i][0];
                let params = uniquecommands[i].substring(1).trim().split(" ");
                let length;
                switch (cmdtype) {
                    case "b":
                        length = 6;
                        break;
                    case "s":
                        length = params.length;
                        break;
                    case "c":
                        length = 0;
                        break;
                    default:
                        length = 2;
                }
                for (
                    let j = 0;
                    j < (length === 0 ? 1 : params.length / length);
                    j++
                ) {
                    let localparam = params.slice(j * length, (j + 1) * length);
                    switch (cmdtype) {
                        case "m":
                            if (current_shape.length > 0) {
                                shapes.push(current_shape);
                                current_shape = [];
                            }
                        case "n":
                            lastpos[0] = global.parseFloat(localparam[0]);
                            lastpos[1] = global.parseFloat(localparam[1]);
                            break;
                        case "l":
                            if (current_shape.length === 0) {
                                current_shape.push(
                                    scale * lastpos[0],
                                    height - scale * lastpos[1]
                                );
                            }
                            lastpos[0] = global.parseFloat(localparam[0]);
                            lastpos[1] = global.parseFloat(localparam[1]);
                            current_shape.push(
                                scale * lastpos[0],
                                height - scale * lastpos[1]
                            );
                            break;
                        case "b":
                            if (current_shape.length === 0) {
                                current_shape.push(
                                    scale * lastpos[0],
                                    height - scale * lastpos[1]
                                );
                            }
                            {
                                let old_lastpos = [lastpos[0], lastpos[1]];
                                lastpos[0] = global.parseFloat(localparam[4]);
                                lastpos[1] = global.parseFloat(localparam[5]);
                                for (let t = 0; t < 1; t += 0.001 / scale) {
                                    let result = this._bezierCurve(
                                        t,
                                        old_lastpos[0],
                                        old_lastpos[1],
                                        global.parseFloat(localparam[0]),
                                        global.parseFloat(localparam[1]),
                                        global.parseFloat(localparam[2]),
                                        global.parseFloat(localparam[3]),
                                        lastpos[0],
                                        lastpos[1]
                                    );
                                    current_shape.push(
                                        scale * result[0],
                                        height - scale * result[1]
                                    );
                                }
                            }
                            break;
                        case "s":
                            if (current_shape.length === 0) {
                                current_shape.push(
                                    scale * lastpos[0],
                                    height - scale * lastpos[1]
                                );
                            }
                            {
                                spline_points = spline_points || [];
                                spline_points[0] = [lastpos[0], lastpos[1]];
                                let n = 1;
                                for (let k = 0; k < localparam.length; k += 2) {
                                    spline_points[n++] = [
                                        global.parseFloat(localparam[k]),
                                        global.parseFloat(localparam[k + 1])
                                    ];
                                }
                            }
                            break;
                        case "p":
                            spline_points = spline_points || [];
                            spline_points[spline_points.length] = [
                                global.parseFloat(localparam[0]),
                                global.parseFloat(localparam[1])
                            ];
                            break;
                        case "c":
                            {
                                let spline = new BSpline(
                                    spline_points,
                                    3,
                                    true
                                );
                                let point;
                                for (let t = 0; t < 1; t += 0.001 / scale) {
                                    point = spline.calcAt(t);
                                    current_shape.push(
                                        scale * point[0],
                                        height - scale * point[1]
                                    );
                                }
                                lastpos[0] = point[0];
                                lastpos[1] = point[1];
                                spline_points = null;
                            }
                            break;
                    }
                }
            }

            if (spline_points !== null) {
                let spline = new BSpline(spline_points, 3, true);
                for (let t = 0; t < 1; t += 0.001 / scale) {
                    let point = spline.calcAt(t);
                    current_shape.push(
                        scale * point[0],
                        height - scale * point[1]
                    );
                }
            }
            if (current_shape.length > 0) {
                shapes.push(current_shape);
            }
            return shapes;
        },
        writable: false
    },

    _calcRectangularClipCoords: {
        /**
         * Calculates rectangular clip coordinates.
         * @private
         * @param {Array<number>} clip the clip bounds.
         * @param {boolean} inverse is the clip inverted?
         * @return {Float32Array} the resulting vertices.
         */
        value: function _calcRectangularClipCoords (clip, inverse) {
            let minX = Math.min(clip[0], clip[2]);
            let minY = Math.min(clip[1], clip[3]);
            let maxX = Math.max(clip[0], clip[2]);
            let maxY = Math.max(clip[1], clip[3]);
            let upperLeft = {
                m00: minX,
                m01: this._config.renderer["resolution_y"] - minY
            };

            let lowerLeft = {
                m00: minX,
                m01: this._config.renderer["resolution_y"] - maxY
            };

            let upperRight = {
                m00: maxX,
                m01: this._config.renderer["resolution_y"] - minY
            };

            let lowerRight = {
                m00: maxX,
                m01: this._config.renderer["resolution_y"] - maxY
            };

            if (!inverse) {
                const rectangular_clip_coords = this._getFloat32Array(
                    "rectangular_clip_coords",
                    12
                );
                // prettier-ignore
                rectangular_clip_coords.set([
                    upperLeft.m00,  upperLeft.m01, 
                    upperRight.m00, upperRight.m01,
                    lowerLeft.m00,  lowerLeft.m01, 
                    lowerLeft.m00,  lowerLeft.m01, 
                    upperRight.m00, upperRight.m01,
                    lowerRight.m00, lowerRight.m01,
                ],0);
                return rectangular_clip_coords;
            } else {
                const rectangular_clip_coords_inverse = this._getFloat32Array(
                    "rectangular_clip_coords_inverse",
                    24
                );
                // prettier-ignore
                rectangular_clip_coords_inverse.set([
                    0,                                      0,                                    
                    this._config.renderer["resolution_x"],  0,                                    
                    this._config.renderer["resolution_x"],  this._config.renderer["resolution_y"],
                    this._config.renderer["resolution_x"],  this._config.renderer["resolution_y"],
                    0,                                      this._config.renderer["resolution_y"],
                    0,                                      0,                                    
                    upperLeft.m00,                          upperLeft.m01, 
                    upperRight.m00,                         upperRight.m01,
                    lowerLeft.m00,                          lowerLeft.m01, 
                    lowerLeft.m00,                          lowerLeft.m01, 
                    upperRight.m00,                         upperRight.m01,
                    lowerRight.m00,                         lowerRight.m01,
                ],0);
                return rectangular_clip_coords_inverse;
            }
        },
        writable: false
    },

    _calcClipPathCoords: {
        /**
         * Gets clip path coords.
         * @private
         * @param {Array<number|string>} clip the clip params
         * @param {boolean} inverse is it inverse?
         * @return {Float32Array} result
         */
        value: function _calcClipPathCoords (clip, inverse) {
            let scale = /** @type {number} */ (clip[0]);
            let path = /** @type {string} */ (clip[1]);
            let shapes = this._getShapesFromPath(scale, path);
            let triangles = [];
            for (let i = 0; i < shapes.length; i++) {
                let vindices = sabre.earcut(shapes[i]);
                for (let j = 0; j < vindices.length; j++) {
                    let vertex = vindices[j] * 2;
                    triangles.push(shapes[i][vertex], shapes[i][vertex + 1]);
                }
            }
            if (inverse) {
                triangles.push(0, 0);
                triangles.push(this._config.renderer["resolution_x"], 0);
                triangles.push(
                    this._config.renderer["resolution_x"],
                    this._config.renderer["resolution_y"]
                );
                triangles.push(
                    this._config.renderer["resolution_x"],
                    this._config.renderer["resolution_y"]
                );
                triangles.push(0, this._config.renderer["resolution_y"]);
                triangles.push(0, 0);
            }
            return new Float32Array(triangles);
        },
        writable: false
    },

    _allocateCacheSpace: {
        /**
         * Allocates some space in the cache for a glyph or shape.
         * @private
         * @param {number} requiredWidth Width required for the texture.
         * @param {number} requiredHeight Height required for the texture.
         * @param {boolean} extraSpace Check for extra space.
         * @returns {?Array<number>} Results of allocation attempt.
         */
        value: function _allocateCacheSpace (requiredWidth, requiredHeight, extraSpace) {
            requiredWidth = requiredWidth / this._getCacheWidth();
            requiredHeight = requiredHeight / this._getCacheHeight();
            let result = null;
            for(let i = 0; i < this._cacheAvailability.length; i++) {
                const area = this._cacheAvailability[i];
                const areaWidth = area.x2 - area.x;
                const areaHeight = area.y2 - area.y;
                if(areaWidth >= requiredWidth && areaHeight >= requiredHeight) {
                    const params = [i,1];
                    if(areaWidth > requiredWidth){
                        params.push({x:area.x+requiredWidth,y:area.y,x2:area.x2,y2:area.y2});
                    }
                    if(areaHeight > requiredHeight){
                        params.push({x:area.x,y:area.y+requiredHeight,x2:area.x2,y2:area.y2});
                    }
                    if(params[2] && params[3]){
                        let maxx = params[3].x2
                        let maxy = params[2].y2
                        let minx = params[3].x2 = params[2].x;
                        let miny = params[2].y2 = params[3].y;
                        params.push({x:minx,y:miny,x2:maxx,y2:maxy});
                    }
                    this._cacheAvailability.splice.apply(this._cacheAvailability,params);
                    result = [area.x,area.y,requiredWidth,requiredHeight];
                    break;
                }
            }
            if(extraSpace){
                for(let i = 0; i < this._cacheAvailability.length; i++) {
                    const area = this._cacheAvailability[i];
                    const areaWidth = area.x2 - area.x;
                    const areaHeight = area.y2 - area.y;
                    if(areaWidth >= requiredWidth && areaHeight >= requiredHeight) {
                        return result;
                    }
                }
                return null;
            }
            return result;
        },
        writable: false
    },

    _clearCache: {
        /**
         * Clears the cache.
         * @private
         */
        value: function _clearCache () {
            this._cacheAvailability = [{x:0,y:0,x2:1,y2:1}];
            this._glyphCache = {};
        },
        writable: false
    },

    _checkGlyphCache: {
        /**
         * Checks if a glyph is cached in VRAM.
         * @private
         * @param {number} stateHash Hash of the text renderer state.
         * @param {number} glyphIndex Uniquely identifies the glyph.
         * @returns {boolean} Is glyph cached.
         */
        value: function _checkGlyphCache (stateHash, glyphIndex) {
            const glyphDictionary = this._glyphCache[stateHash];
            if (glyphDictionary) {
                return !!glyphDictionary[glyphIndex];
            }
            return false;
        },
        writable: false
    },

    _fetchInfoFromGlyphCache: {
        /**
         * Fetches glyph positioning info from cache.
         * @private
         * @param {number} stateHash Hash of the text renderer state.
         * @param {number} glyphIndex Uniquely identifies the glyph.
         * @returns {?GlyphCacheInfo} The positioning info of the cached glyph.
         */
        value: function _fetchInfoFromGlyphCache (stateHash, glyphIndex) {
            const glyphDictionary = this._glyphCache[stateHash];
            if (glyphDictionary) {
                return glyphDictionary[glyphIndex];
            }
            return null;
        },
        writable: false
    },

    _cacheGlyph: {
        /**
         * Puts a glyph in VRAM cache.
         * @private
         * @param {number} stateHash Hash of the text renderer state.
         * @param {number} glyphIndex Uniquely identifies the glyph.
         * @param {Canvas2DTextRenderer} source The source for the texture.
         * @param {boolean} extraSpace Check for extra space.
         */
        value: function _cacheGlyph (stateHash, glyphIndex, source, extraSpace) {
            let positionAttrib = this._cacheShader.getAttribute(
                this._gl,
                "a_position"
            );
            let textureAttrib = this._cacheShader.getAttribute(
                this._gl,
                "a_texcoord"
            );
            //TODO: Test and revise function.
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferCache);
            this._gl.viewport(
                0,
                0,
                this._getCacheWidth(),
                this._getCacheHeight()
            );
            this._cacheShader.bindShader(this._gl);
            this._gl.activeTexture(this._gl.TEXTURE0);
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._textureSubtitle);
            const cacheInfo = /** @type {GlyphCacheInfo} */ ({});
            cacheInfo.offset = source.getOffset();
            cacheInfo.offsetExternal = source.getOffsetExternal();
            cacheInfo.dimensions = source.getDimensions();
            cacheInfo.textureDimensions = source.getTextureDimensions();
            let allocationInfo = this._allocateCacheSpace(cacheInfo.textureDimensions[0],cacheInfo.textureDimensions[1],extraSpace);
            if(allocationInfo === null){
                this._gl.clear(this._gl.COLOR_BUFFER_BIT|this._gl.DEPTH_BUFFER_BIT);
                this._clearCache();
                allocationInfo = this._allocateCacheSpace(cacheInfo.textureDimensions[0],cacheInfo.textureDimensions[1],extraSpace);
            }
            [cacheInfo.x,cacheInfo.y,cacheInfo.width,cacheInfo.height] = allocationInfo;
            this._loadSubtitleToVram(source, this._textureSubtitleBounds);
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
            const coordinates = this._getFloat32Array("coordinates", 18);

            let adjustedX = (cacheInfo.x * 2) - 1;
            let adjustedY = (cacheInfo.y * 2) - 1;

            let adjustedXW = ((cacheInfo.x+cacheInfo.width) * 2) -1;
            let adjustedYH = ((cacheInfo.y+cacheInfo.height) * 2) -1;
            // prettier-ignore
            coordinates.set([adjustedX,adjustedYH,0,
                             adjustedXW,adjustedYH,0,
                             adjustedX,adjustedY,0,
                             adjustedX,adjustedY,0,
                             adjustedXW,adjustedYH,0,
                             adjustedXW,adjustedY,0]);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, coordinates, this._gl.DYNAMIC_DRAW);

            const bounds = this._textureSubtitleBounds;
            let width = cacheInfo.textureDimensions[0] / bounds[0];
            let height = cacheInfo.textureDimensions[1] / bounds[1];

            let tex_coords = this._getFloat32Array("tex_coords", 12);
            // prettier-ignore
            tex_coords.set([
                0,      1,
                width,  1,
                0,      1 - height,
                0,      1 - height,
                width,  1,
                width,  1 - height
            ],0);
            
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
            this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            this._gl.viewport(
                0,
                0,
                this._compositingCanvas.width,
                this._compositingCanvas.height
            );
            this._glyphCache[stateHash] = this._glyphCache[stateHash] ?? {};
            this._glyphCache[stateHash][glyphIndex] = cacheInfo;
        },
        writable: false
    },

    _loadSubtitleToVram: {
        /**
         * Loads a subtitle into graphics card's VRAM.
         * @private
         * @param {Canvas2DTextRenderer|Canvas2DShapeRenderer} source The source.
         */
        value: function _loadSubtitleToVram (source, bounds) {
            let extents = source.getExtents();
            if (extents[0] < bounds[0] && extents[1] < bounds[1]) {
                this._gl.texSubImage2D(
                    this._gl.TEXTURE_2D,
                    0,
                    0,
                    bounds[1] - extents[1],
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
                bounds[0] = extents[0];
                bounds[1] = extents[1];
            }
        },
        writable: false
    },

    _compositeSubtitle: {
        /**
         * Performs the actual compositing of the subtitles onscreen.
         * @private
         * @param {number} time The time the subtitle must be rendered at.
         * @param {SSASubtitleEvent} currentEvent The properties of the subtitle.
         * @param {number} pass the current render pass we are on.
         * @param {CollisionInfo} position the positioning info of the subtitle.
         * @param {boolean} isShape is the subtitle we are compositing a shape?
         * @param {?number} texHash State hash for the texture.
         * @param {?number} texIndex Index for the texture.
         * @param {?number} texMaskHash State hash for the texture mask.
         * @param {?number} texMaskIndex Index for the texture mask.
         */
        value: function _compositeSubtitle (time, currentEvent, pass, position, isShape, texHash, texIndex, texMaskHash, texMaskIndex) {
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

            let clip_coords = null;
            {
                let line_overrides = currentEvent.getLineOverrides();
                let line_transition_overrides =
                    currentEvent.getLineTransitionTargetOverrides();
                let inverse = line_overrides.getClipInverted();
                let clip = line_overrides.getClip();

                if (
                    line_transition_overrides.length > 0 &&
                    (clip === null || clip.length < 4) &&
                    time >= line_transition_overrides[0].getTransitionStart()
                ) {
                    if (!inverse)
                        clip = [
                            0,
                            0,
                            this._config.renderer["resolution_x"],
                            this._config.renderer["resolution_y"]
                        ];
                    else clip = [0, 0, 0, 0];
                }
                for (let i = 0; i < line_transition_overrides.length; i++) {
                    let transitionClip = line_transition_overrides[i].getClip();
                    if (transitionClip === null) continue;
                    let transitionStart =
                        line_transition_overrides[i].getTransitionStart();
                    if (time < transitionStart) break;
                    let transitionEnd =
                        line_transition_overrides[i].getTransitionEnd();
                    if (time >= transitionEnd) {
                        clip = transitionClip;
                        continue;
                    }
                    let transitionAcceleration =
                        line_transition_overrides[
                            i
                        ].getTransitionAcceleration();
                    clip[0] = sabre.performTransition(
                        time,
                        /** @type {!number} */ (clip[0]),
                        transitionClip[0],
                        transitionStart,
                        transitionEnd,
                        transitionAcceleration
                    );
                    clip[1] = sabre.performTransition(
                        time,
                        /** @type {!number} */ (clip[1]),
                        transitionClip[1],
                        transitionStart,
                        transitionEnd,
                        transitionAcceleration
                    );
                    clip[2] = sabre.performTransition(
                        time,
                        /** @type {!number} */ (clip[2]),
                        transitionClip[2],
                        transitionStart,
                        transitionEnd,
                        transitionAcceleration
                    );
                    clip[3] = sabre.performTransition(
                        time,
                        /** @type {!number} */ (clip[3]),
                        transitionClip[3],
                        transitionStart,
                        transitionEnd,
                        transitionAcceleration
                    );
                }

                if (clip !== null) {
                    if (clip.length === 4) {
                        clip_coords = this._calcRectangularClipCoords(
                            clip,
                            inverse
                        );
                    } else {
                        clip_coords = this._calcClipPathCoords(clip, inverse);
                    }
                }
            }

            if (blurInfo === null && clip_coords === null) {
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
            //TODO: Render from cache.
            let cachedGlyphInfo = null;
            let cachedMaskGlyphInfo = null;
            this._gl.activeTexture(this._gl.TEXTURE0);
            if (texHash === null || !this._checkGlyphCache(texHash,texIndex)) {
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._textureSubtitle);
                this._loadSubtitleToVram(source, this._textureSubtitleBounds); 
            } else {
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureCache);
                cachedGlyphInfo = this._fetchInfoFromGlyphCache(texHash,texIndex);
            }
            if (!isShape) {
                this._gl.activeTexture(this._gl.TEXTURE1);
                if (texMaskHash === null || !this._checkGlyphCache(texMaskHash,texMaskIndex)) {
                    this._gl.bindTexture(
                        this._gl.TEXTURE_2D,
                        this._textureSubtitleMask
                    );
    
                    this._loadSubtitleToVram(
                        this._textMaskRenderer,
                        this._textureSubtitleMaskBounds
                    );
                } else {
                    this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureCache);
                    cachedMaskGlyphInfo = this._fetchInfoFromGlyphCache(texMaskHash,texMaskIndex);
                }
                
                this._positioningShader.updateOption("u_hasmask", 1);
            } else {
                this._positioningShader.updateOption("u_hasmask", 0);
            }

            let xScale = 2 / this._config.renderer["resolution_x"];
            let yScale = 2 / this._config.renderer["resolution_y"];

            let positioningMatrices = this._calcPositioningMatrices(
                time,
                source,
                position,
                currentEvent,
                cachedGlyphInfo
            );

            let upperLeft;
            let lowerLeft;
            let upperRight;
            let lowerRight;
            {
                let dimensions = (cachedGlyphInfo ? cachedGlyphInfo.dimensions : source.getDimensions());

                upperLeft = {
                    m00: 0,
                    m10: 0,
                    m20: 0,
                    m30: 1
                };

                lowerLeft = {
                    m00: 0,
                    m10: -dimensions[1],
                    m20: 0,
                    m30: 1
                };

                upperRight = {
                    m00: dimensions[0],
                    m10: 0,
                    m20: 0,
                    m30: 1
                };

                lowerRight = {
                    m00: dimensions[0],
                    m10: -dimensions[1],
                    m20: 0,
                    m30: 1
                };
            }
            let coordinates = this._getFloat32Array("coordinates", 18);
            // prettier-ignore
            coordinates.set([
                upperLeft.m00,  upperLeft.m10,  upperLeft.m20,
                upperRight.m00, upperRight.m10, upperRight.m20,
                lowerLeft.m00,  lowerLeft.m10,  lowerLeft.m20,
                lowerLeft.m00,  lowerLeft.m10,  lowerLeft.m20,
                upperRight.m00, upperRight.m10, upperRight.m20,
                lowerRight.m00, lowerRight.m10, lowerRight.m20
            ],0);

            let tex_coords;
            if (texHash === null || !this._checkGlyphCache(texHash,texIndex)) {
                let dimensions = source.getTextureDimensions();
                let extents = this._textureSubtitleBounds;
                let width = dimensions[0] / extents[0];
                let height = dimensions[1] / extents[1];

                tex_coords = this._getFloat32Array("tex_coords", 12);
                // prettier-ignore
                tex_coords.set([
                    0,      1,
                    width,  1,
                    0,      1 - height,
                    0,      1 - height,
                    width,  1,
                    width,  1 - height
                ],0);
            } else {
                tex_coords = this._getFloat32Array("tex_coords", 12);
                // prettier-ignore
                tex_coords.set([
                    cachedGlyphInfo.x,                          cachedGlyphInfo.y + cachedGlyphInfo.height,
                    cachedGlyphInfo.x + cachedGlyphInfo.width,  cachedGlyphInfo.y + cachedGlyphInfo.height,
                    cachedGlyphInfo.x,                          cachedGlyphInfo.y,
                    cachedGlyphInfo.x,                          cachedGlyphInfo.y,
                    cachedGlyphInfo.x + cachedGlyphInfo.width,  cachedGlyphInfo.y + cachedGlyphInfo.height,
                    cachedGlyphInfo.x + cachedGlyphInfo.width,  cachedGlyphInfo.y
                ],0); 
            }

            let mask_coords;
            if (!isShape) {
                if (texMaskHash === null || !this._checkGlyphCache(texMaskHash,texMaskIndex)) {
                    let maskDimensions =
                        this._textMaskRenderer.getTextureDimensions();
                    let extents = this._textureSubtitleMaskBounds;
                    let width = maskDimensions[0] / extents[0];
                    let height = maskDimensions[1] / extents[1];

                    mask_coords = this._getFloat32Array("mask_coords", 12);
                    // prettier-ignore
                    mask_coords.set([
                        0,      1,
                        width,  1,
                        0,      1 - height,
                        0,      1 - height,
                        width,  1,
                        width,  1 - height
                    ],0);
                } else {
                    mask_coords = this._getFloat32Array("mask_coords", 12);
                    // prettier-ignore
                    mask_coords.set([
                        cachedMaskGlyphInfo.x,                              cachedMaskGlyphInfo.y + cachedMaskGlyphInfo.height,
                        cachedMaskGlyphInfo.x + cachedMaskGlyphInfo.width,  cachedMaskGlyphInfo.y + cachedMaskGlyphInfo.height,
                        cachedMaskGlyphInfo.x,                              cachedMaskGlyphInfo.y,
                        cachedMaskGlyphInfo.x,                              cachedMaskGlyphInfo.y,
                        cachedMaskGlyphInfo.x + cachedMaskGlyphInfo.width,  cachedMaskGlyphInfo.y + cachedMaskGlyphInfo.height,
                        cachedMaskGlyphInfo.x + cachedMaskGlyphInfo.width,  cachedMaskGlyphInfo.y
                    ],0);  
                }
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
                let maskAttrib = this._positioningShader.getAttribute(
                    this._gl,
                    "a_maskcoord"
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

                let matrix = this._getFloat32Array("pre_rotation_matrix", 16);
                matrix.set(
                    this._matrixToArrayRepresentation4x4(
                        positioningMatrices[0]
                    ),
                    0
                );
                this._positioningShader.updateOption(
                    "u_pre_rotation_matrix",
                    matrix
                );
                matrix = this._getFloat32Array("rotation_matrix_x", 16);
                matrix.set(
                    this._matrixToArrayRepresentation4x4(
                        positioningMatrices[1]
                    ),
                    0
                );
                this._positioningShader.updateOption(
                    "u_rotation_matrix_x",
                    matrix
                );
                matrix = this._getFloat32Array("rotation_matrix_y", 16);
                matrix.set(
                    this._matrixToArrayRepresentation4x4(
                        positioningMatrices[2]
                    ),
                    0
                );
                this._positioningShader.updateOption(
                    "u_rotation_matrix_y",
                    matrix
                );
                matrix = this._getFloat32Array("rotation_matrix_z", 16);
                matrix.set(
                    this._matrixToArrayRepresentation4x4(
                        positioningMatrices[3]
                    ),
                    0
                );
                this._positioningShader.updateOption(
                    "u_rotation_matrix_z",
                    matrix
                );
                matrix = this._getFloat32Array("post_rotation_matrix", 16);
                matrix.set(
                    this._matrixToArrayRepresentation4x4(
                        positioningMatrices[4]
                    ),
                    0
                );
                this._positioningShader.updateOption(
                    "u_post_rotation_matrix",
                    matrix
                );
                this._positioningShader.updateOption("u_aspectscale", [
                    xScale,
                    yScale
                ]);

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

                if (!isShape) {
                    this._gl.bindBuffer(
                        this._gl.ARRAY_BUFFER,
                        this._maskCoordinatesBuffer
                    );
                    this._gl.enableVertexAttribArray(maskAttrib);
                    this._gl.vertexAttribPointer(
                        maskAttrib,
                        2,
                        this._gl.FLOAT,
                        false,
                        0,
                        0
                    );
                    this._gl.bufferData(
                        this._gl.ARRAY_BUFFER,
                        mask_coords,
                        this._gl.DYNAMIC_DRAW
                    );
                }

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

            {
                let backFramebuffer = this._frameBufferB;
                let sourceFramebuffer = this._frameBufferA;
                let backTexture = this._fbTextureB;
                let sourceTexture = this._fbTextureA;
                let swap;
                if (blurInfo !== null) {
                    if (blurInfo.blur > 0) {
                        this._convEdgeBlurShader.updateOption(
                            "u_resolution_x",
                            this._compositingCanvas.width
                        );
                        this._convEdgeBlurShader.updateOption(
                            "u_resolution_y",
                            this._compositingCanvas.height
                        );
                        this._convEdgeBlurShader.updateOption("u_texture", 0);
                        this._convEdgeBlurShader.bindShader(this._gl);
                        //Draw framebuffer to destination

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
                        if (blurInfo.gaussBlur > 0 || clip_coords !== null) {
                            this._gl.bindFramebuffer(
                                this._gl.FRAMEBUFFER,
                                backFramebuffer
                            );
                            this._gl.clear(
                                this._gl.DEPTH_BUFFER_BIT |
                                    this._gl.COLOR_BUFFER_BIT
                            );
                        } else {
                            this._gl.bindFramebuffer(
                                this._gl.FRAMEBUFFER,
                                null
                            );
                        }

                        this._gl.activeTexture(this._gl.TEXTURE0);
                        this._gl.bindTexture(
                            this._gl.TEXTURE_2D,
                            sourceTexture
                        );

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
                            this._gl.DEPTH_BUFFER_BIT |
                                this._gl.COLOR_BUFFER_BIT
                        );
                        this._gl.activeTexture(this._gl.TEXTURE0);
                        this._gl.bindTexture(
                            this._gl.TEXTURE_2D,
                            sourceTexture
                        );
                        //Apply gaussian filter 1
                        this._gaussEdgeBlurPass1Shader.updateOption(
                            "u_resolution_x",
                            this._compositingCanvas.width
                        );
                        this._gaussEdgeBlurPass1Shader.updateOption(
                            "u_sigma",
                            blurInfo.gaussBlur
                        );
                        this._gaussEdgeBlurPass1Shader.updateOption(
                            "u_texture",
                            0
                        );
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

                        swap = backTexture;
                        backTexture = sourceTexture;
                        sourceTexture = swap;
                        swap = backFramebuffer;
                        backFramebuffer = sourceFramebuffer;
                        sourceFramebuffer = swap;

                        if (clip_coords !== null) {
                            this._gl.bindFramebuffer(
                                this._gl.FRAMEBUFFER,
                                backFramebuffer
                            );
                            this._gl.clear(
                                this._gl.DEPTH_BUFFER_BIT |
                                    this._gl.COLOR_BUFFER_BIT
                            );
                        } else
                            this._gl.bindFramebuffer(
                                this._gl.FRAMEBUFFER,
                                null
                            );
                        this._gl.activeTexture(this._gl.TEXTURE0);
                        this._gl.bindTexture(
                            this._gl.TEXTURE_2D,
                            sourceTexture
                        );
                        //Apply gaussian filter 2
                        this._gaussEdgeBlurPass2Shader.updateOption(
                            "u_resolution_y",
                            this._compositingCanvas.height
                        );
                        this._gaussEdgeBlurPass2Shader.updateOption(
                            "u_sigma",
                            blurInfo.gaussBlur
                        );
                        this._gaussEdgeBlurPass2Shader.updateOption(
                            "u_texture",
                            0
                        );
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

                        swap = backTexture;
                        backTexture = sourceTexture;
                        sourceTexture = swap;
                        swap = backFramebuffer;
                        backFramebuffer = sourceFramebuffer;
                        sourceFramebuffer = swap;
                    }
                }

                if (clip_coords !== null) {
                    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
                    this._gl.activeTexture(this._gl.TEXTURE0);
                    this._gl.bindTexture(this._gl.TEXTURE_2D, sourceTexture);
                    this._clipShader.updateOption("u_texture", 0);
                    this._clipShader.updateOption("u_aspectscale", [
                        xScale,
                        yScale
                    ]);
                    this._clipShader.bindShader(this._gl);
                    let positionAttrib =
                        this._gaussEdgeBlurPass1Shader.getAttribute(
                            this._gl,
                            "a_position"
                        );
                    this._gl.bindBuffer(
                        this._gl.ARRAY_BUFFER,
                        this._clipBuffer
                    );
                    this._gl.enableVertexAttribArray(positionAttrib);
                    this._gl.vertexAttribPointer(
                        positionAttrib,
                        2,
                        this._gl.FLOAT,
                        false,
                        0,
                        0
                    );
                    this._gl.bufferData(
                        this._gl.ARRAY_BUFFER,
                        clip_coords,
                        this._gl.DYNAMIC_DRAW
                    );
                    this._gl.drawArrays(
                        this._gl.TRIANGLES,
                        0,
                        clip_coords.length / 2
                    );
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
         * @return {void}
         */
        value: function init () {
            this._lastDim = [NaN,NaN];
            this._scheduler = new sabre.SubtitleScheduler();
            this._textRenderer = new sabre.Canvas2DTextRenderer();
            this._textMaskRenderer = new sabre.Canvas2DTextRenderer();
            this._shapeRenderer = new sabre.Canvas2DShapeRenderer();
            this._glyphCache = {};
            this._cacheAvailability = [{x:0,y:0,x2:1,y2:1}];
            this._renderData = {};
        },
        writable: false
    },

    "load": {
        /**
         * Load the configuration for the renderer and do any follow-up steps.
         * @param {RendererData} config configuration for the renderer.
         * @return {void}
         */
        value: function load (config) {
            this._fontServer = new sabre.FontServer(config);
            const _this = this;
            const requestFont = function requestFont (name, weight, italic) {
                return _this._findFont(name, weight, italic);
            };
            this._textRenderer.setRequestFont(requestFont);
            this._textMaskRenderer.setRequestFont(requestFont);
            this._config = config;
            this._scheduler.setEvents(
                /** @type {Array<SSASubtitleEvent>} */ (
                    config.renderer["events"]
                )
            );
            const options = Object.freeze({
                "alpha": true,
                //"desynchronized": true,
                "antialias": true,
                "powerPreference": "high-performance",
                "premultipliedAlpha": false
            });

            let isCanvasOffscreen = false;
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
                isCanvasOffscreen = true
            }

            this._gl = this._compositingCanvas.getContext("webgl", options);
            //To work around safari bug in safari 16:
            if(!this._gl&&isCanvasOffscreen){
                this._compositingCanvas =
                    global.document.createElement("canvas");
                this._compositingCanvas.width = config.renderer["resolution_x"];
                this._compositingCanvas.height =
                    config.renderer["resolution_y"];
                this._gl = this._compositingCanvas.getContext("webgl", options);
            }

            if (!this._gl) {
                this._gl = this._compositingCanvas.getContext(
                    "experimental-webgl",
                    options
                );
            }

            this._compositingCanvas.addEventListener(
                "webglcontextlost",
                function lostContext(event) {
                    console.log("[SABRE.js] WebGL Context Lost...");
                    _this._contextLost = true;
                    event.preventDefault();
                    return false;
                },
                false
            );

            this._compositingCanvas.addEventListener(
                "webglcontextrestored",
                function restoredContext(event) {
                    console.log(
                        "[SABRE.js] WebGL Context Restored. Recovering..."
                    );
                    sabre.Shader.resetStateEngine();
                    _this._glSetup();
                    _this._contextLost = false;
                    return false;
                },
                false
            );
            this._glSetup();
        },
        writable: false
    },

    "updateViewport": {
        /**
         * Update the size of the compositing canvas and base rendering scale.
         * @param {number} width the new width of the output.
         * @param {number} height the new height of the output.
         * @return {void}
         */
        value: function updateViewport(width, height) {
            const pixelRatio = sabre.getPixelRatio();
            this._lastPixelRatio = pixelRatio;
            this._lastDim[0] = width;
            this._lastDim[1] = height;
            width *= pixelRatio;
            height *= pixelRatio;
            this._compositingCanvas.width = width;
            this._compositingCanvas.height = height;
            let scale_x = width / this._config.renderer["resolution_x"];
            let scale_y = height / this._config.renderer["resolution_y"];
            this._textRenderer.setPixelScaleRatio(scale_x, scale_y);
            this._textMaskRenderer.setPixelScaleRatio(scale_x, scale_y);
            this._shapeRenderer.setPixelScaleRatio(scale_x, scale_y);
            this._clearCache();
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferA);
            this._gl.viewport(0, 0, width, height);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferB);
            this._gl.viewport(0, 0, width, height);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferCache);
            this._gl.viewport(
                0,
                0,
                this._getCacheWidth(),
                this._getCacheHeight()
            );
            this._gl.clear(this._gl.COLOR_BUFFER_BIT|this._gl.DEPTH_BUFFER_BIT);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            this._gl.viewport(0, 0, width, height);
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._fbTextureA);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                width,
                height,
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
                width,
                height,
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                null
            );
            this._gl.bindTexture(this._gl.TEXTURE_2D,this._fbTextureCache);
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._getCacheWidth(),
                this._getCacheHeight(),
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
         * @return {boolean}
         */
        value: function canRender() {
            return !this._contextLost;
        },
        writable: false
    },

    "frame": {
        /**
         * Render one frame.
         * @param {number} time the current frame time.
         * @return {void}
         */
        value: function frame (time) {
            if (this._contextLost) return;
            if (time === this._lastTime) return;
            {
                const pixelRatio = sabre.getPixelRatio();
                if (pixelRatio !== this._lastPixelRatio)
                    this["updateViewport"](this._lastDim[0],this._lastDim[1]);
            }
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
                let currentHash = sabre.hashObject(events);
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
                        if (currentEvent.getText().trim() === "") continue;
                        if (!currentEvent.getOverrides().getDrawingMode()) {
                            const textHash = this._textRenderer.startEventRender(
                                time,
                                currentEvent,
                                pass,
                                false
                            );
                            const textMaskHash = this._textMaskRenderer.startEventRender(
                                time,
                                currentEvent,
                                pass,
                                true
                            );
                            for(;;) { //Infinite loop equivelent to while(true) but faster.
                                const textGlyphInfo = this._textRenderer.nextGlyph();
                                if (textGlyphInfo.breakOut)
                                    break;
                                if(textGlyphInfo.glyph){
                                    if (this._checkGlyphCache(textHash, textGlyphInfo.glyph.index)) {
                                        this._textRenderer.positionCachedGlyph(textGlyphInfo)
                                        this._fetchInfoFromGlyphCache(textHash, textGlyphInfo.glyph.index).offsetExternal = this._textRenderer.getOffsetExternal();
                                    } else {
                                        const textCacheGlyph = this._textRenderer.renderGlyph(
                                            time,
                                            currentEvent,
                                            textGlyphInfo,
                                            pass,
                                            false
                                        );
                                        if (textCacheGlyph)
                                            this._cacheGlyph(textHash, textGlyphInfo.glyph.index, this._textRenderer, true);
                                    }
                                }
                                const maskGlyphInfo = this._textMaskRenderer.nextGlyph();
                                if (maskGlyphInfo.glyph){
                                    if(this._checkGlyphCache(textMaskHash, maskGlyphInfo.glyph.index)) {
                                        this._textMaskRenderer.positionCachedGlyph(textGlyphInfo)
                                        this._fetchInfoFromGlyphCache(textHash, textGlyphInfo.glyph.index).offsetExternal = this._textMaskRenderer.getOffsetExternal();
                                    } else {
                                        const maskCacheGlyph = this._textMaskRenderer.renderGlyph(
                                            time,
                                            currentEvent,
                                            maskGlyphInfo,
                                            pass,
                                            true
                                        );
                                        if (maskCacheGlyph)
                                            this._cacheGlyph(textMaskHash, maskGlyphInfo.glyph.index, this._textMaskRenderer, false);
                                    }
                                }
                                this._compositeSubtitle(
                                    time,
                                    currentEvent,
                                    pass,
                                    positions[i + j],
                                    false,
                                    textHash,
                                    textGlyphInfo.glyph.index,
                                    textMaskHash,
                                    maskGlyphInfo.glyph.index
                                );
                            }
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
                                true,
                                null,
                                null,
                                null,
                                null
                            );
                        }
                    }
                    if (pass === 2) i += j;
                }
            }
        },
        writable: false
    },

    "getDisplayUri": {
        /**
         * Get the frame output.
         * @param {function(string):void} callback the callback to call with the URI.
         * @return {void}
         */
        value: function getDisplayUri (callback) {
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
         * @return {?ImageBitmap} the bitmap.
         */
        value: function getDisplayBitmap () {
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
         * @return {void}
         */
        value: function copyToCanvas (canvas, bitmap) {
            let context;
            if (bitmap) {
                context = canvas.getContext("bitmaprenderer");
                context.transferFromImageBitmap(this["getDisplayBitmap"]());
            } else {
                let width = canvas.width | 0;
                let height = canvas.height | 0;
                context = canvas.getContext("2d");
                context.clearRect(0, 0, width, height);
                context.drawImage(this._compositingCanvas, 0, 0, width, height);
            }
        },
        writable: false
    }
    //END PUBLIC FUNCTIONS
});

sabre["Renderer"] = function Renderer () {
    let renderer = global.Object.create(renderer_prototype);
    renderer.init();
    return renderer;
};
