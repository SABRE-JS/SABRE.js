/*
 |   canvas-2d-text-renderer.js
 |----------------
 |  canvas-2d-text-renderer.js is copyright Patrick Rhodes Martin 2019.
 |
 |-
 */
/**
 * @fileoverview advanced stubstation alpha subtitles text renderer.
 */
//@include [util]
//@include [global-constants]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]

const text_renderer_prototype = global.Object.create(Object, {
    _initialized: {
        /**
         * Is the text renderer initialized.
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _pixelScaleRatio: {
        /**
         * ratio to scale pixels by due to resolution differences between script pixels and actual pixels.
         * @type {{xratio:number,yratio:number}}
         */
        value: { xratio: 1, yratio: 1 },
        writable: true
    },

    _scaledOutlineAndShadow: {
        /**
         * If the outline is scaled.
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _canvas: {
        /**
         * The canvas for the text renderer.
         * @type {?HTMLCanvasElement|?OffscreenCanvas}
         */
        value: null,
        writable: true
    },

    _ctx: {
        /**
         * The canvas context for the text renderer.
         * @type {CanvasRenderingContext2D}
         */
        value: null,
        writable: true
    },

    _glyphs: {
        /**
         * The Glyphs that make up the event being rendered.
         * @type {Array<Glyph>}
         */
        value: [],
        writable: true
    },

    _glyphIndex: {
        /**
         * The index in the Glyphs array.
         * @type {!number}
         */
        value: 0,
        writable: true
    },

    _spacing: {
        /**
         * The relative kerning factor of the event being rendered.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _strikethrough: {
        /**
         * Determines if we are doing strikethrough.
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _underline: {
        /**
         * Determines if we are doing underline.
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _scale: {
        /**
         * The scale factors of the event being rendered.
         * @type {{x:number,y:number}}
         */
        value: { x: 1, y: 1 },
        writable: true
    },

    _fontInfo: {
        /**
         * @type {?{
         *              font:!Font,
         *              name:string,
         *              size:number,
         *              italic:boolean,
         *              foundItalic:boolean,
         *              weight:number,
         *              foundWeight:number,
         *              strikethroughSize:number,
         *              strikethroughPosition:number,
         *              underlineThickness:number,
         *              underlinePosition:number 
         *       }}
         */
        value: null,
        writable: true
    },

    _requestFont: {
        /**
         * @type {?function(string,number,boolean):!{
         *              font:Font,
         *              foundItalic:boolean,
         *              foundWeight:number,
         *              strikethroughSize:number,
         *              strikethroughPosition:number,
         *              underlineThickness:number,
         *              underlinePosition:number
         *          }
         *       }
         */
        value: null,
        writable: true
    },

    _offsetX: {
        /**
         * The internal offset in the x coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _offsetY: {
        /**
         * The internal offset in the y coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _eOffsetX: {
        /**
         * The external offset in the x coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _eOffsetY: {
        /**
         * The external offset in the y coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _width: {
        /**
         * The width of the text.
         * @type {number}
         */
        value: NaN,
        writable: true
    },

    _textSpacingWidth: {
        /**
         * The width in terms of text spacing.
         * @type {number}
         */
        value: NaN,
        writable: true
    },

    _height: {
        /**
         * The height of the text.
         * @type {number}
         */
        value: NaN,
        writable: true
    },

    _init: {
        /**
         * Initializes the rendering canvas.
         */
        value: function _init () {
            const options = Object.freeze({
                "alpha": true,
                "colorSpace": "srgb",
                "desynchronized": true
            });
            if (typeof global.OffscreenCanvas === "undefined") {
                this._canvas = global.document.createElement("canvas");
                this._canvas.height = this._canvas.width = 64;
            } else {
                this._canvas = new global.OffscreenCanvas(64, 64);
            }
            this._height = this._width = 64;
            this._ctx = /** @type {CanvasRenderingContext2D} */(this._canvas.getContext("2d", options));
            if(!this._pixelScaleRatio.preFactoredBacking){
                const backingRatio = sabre.getBackingRatio(this._ctx);
                this._pixelScaleRatio.xratio /= backingRatio;
                this._pixelScaleRatio.yratio /= backingRatio;
                this._pixelScaleRatio.preFactoredBacking = true;
            }
            this._initialized = true;
        },
        writable: false
    },

    _calcScale: {
        /**
         * Calc scale, handing transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function _calcScale (time, style, overrides) {
            let transitionOverrides = overrides.getTransitions();
            let scaleX = overrides.getScaleX() ?? style.getScaleX();
            let scaleY = overrides.getScaleY() ?? style.getScaleY();
            for (let i = 0; i < transitionOverrides.length; i++) {
                scaleX = sabre.performTransition(
                    time,
                    scaleX,
                    transitionOverrides[i].getScaleX(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
                scaleY = sabre.performTransition(
                    time,
                    scaleY,
                    transitionOverrides[i].getScaleY(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
            }
            return { x: scaleX / 100, y: scaleY / 100 };
        },
        writable: false
    },

    _setScale: {
        /**
         * Sets up the canvas to render to the correct scale.
         */
        value: function _setScale () {
            let scale = this._scale;
            this._ctx.scale(
                scale.x * this._pixelScaleRatio.xratio,
                scale.y * this._pixelScaleRatio.yratio
            );
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
            return { x: Math.max(outlineX,0), y: Math.max(outlineY,0) };
        },
        writable: false
    },

    _setOutline: {
        /**
         * Set outline width to the correct size.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function _setOutline (time, style, overrides) {
            let outline = this._calcOutline(time, style, overrides);

            this._ctx.lineWidth = Math.min((!this._scaledOutlineAndShadow?outline.x/this._pixelScaleRatio.xratio:outline.x), (!this._scaledOutlineAndShadow?outline.y/this._pixelScaleRatio.yratio:outline.y)) * 2;
        },
        writable: false
    },

    _calcFontSize: {
        /**
         * Calc font size, handing transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function _calcFontSize (time, style, overrides) {
            let transitionOverrides = overrides.getTransitions();
            let fontSize =
                (overrides.getFontSize() ?? style.getFontSize()) +
                overrides.getFontSizeMod();
            for (let i = 0; i < transitionOverrides.length; i++) {
                fontSize = sabre.performTransition(
                    time,
                    fontSize,
                    transitionOverrides[i].getFontSize(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
            }
            return fontSize;
        },
        writable: false
    },

    _setFont: {
        /**
         * Set font settings for drawing.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function _setFont (time, style, overrides) {
            let fontSize = this._calcFontSize(time, style, overrides);
            let fontName = overrides.getFontName() ?? style.getFontName();
            let fontWeight = overrides.getWeight() ?? style.getWeight();
            let fontItalicized = overrides.getItalic() ?? style.getItalic();
            let { font, foundItalic, foundWeight, strikethroughSize, strikethroughPosition, underlineThickness, underlinePosition } = this._requestFont(
                fontName,
                fontWeight,
                fontItalicized
            );
            this._fontInfo = {};
            this._fontInfo.name = fontName;
            this._fontInfo.font = font;
            this._fontInfo.foundItalic = foundItalic;
            this._fontInfo.foundWeight = foundWeight;
            this._fontInfo.size = fontSize;
            this._fontInfo.weight = fontWeight;
            this._fontInfo.italic = fontItalicized;
            this._fontInfo.strikethroughSize = strikethroughSize;
            this._fontInfo.strikethroughPosition = strikethroughPosition;
            this._fontInfo.underlineThickness = underlineThickness;
            this._fontInfo.underlinePosition = underlinePosition;
        },
        writable: false
    },

    _setColors: {
        /**
         * Set the colors for the subtitle.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         * @param {boolean} mask
         */
        value: function _setColors (time, style, overrides, pass, mask) {
            if (mask) {
                if (
                    pass === sabre.RenderPasses.BACKGROUND &&
                    style.getBorderStyle() !==
                        sabre.BorderStyleModes.SRT_STYLE &&
                    style.getBorderStyle() !==
                        sabre.BorderStyleModes.SRT_NO_OVERLAP
                ) {
                    this._ctx.fillStyle = "rgba(255,255,255,1)";
                } else {
                    if (
                        (overrides.getKaraokeMode() ===
                            sabre.KaraokeModes.COLOR_SWAP ||
                            overrides.getKaraokeMode() ===
                                sabre.KaraokeModes.COLOR_SWEEP) &&
                        time < overrides.getKaraokeStart()
                    ) {
                        this._ctx.fillStyle = "rgba(255,0,255,1)";
                    } else if (
                        overrides.getKaraokeMode() ===
                            sabre.KaraokeModes.COLOR_SWEEP &&
                        time < overrides.getKaraokeEnd()
                    ) {
                        const progress = this._calcKaraokeWipeProgress(time, style, overrides);
                        const gradient = this._ctx.createLinearGradient(
                            0,
                            0,
                            this._width,
                            0
                        );
                        gradient.addColorStop(0, "rgba(0,255,255,1)");
                        gradient.addColorStop(progress, "rgba(0,255,255,1)");
                        gradient.addColorStop(
                            Math.min(progress + 1 / this._width, 1),
                            "rgba(255,0,255,1)"
                        );
                        gradient.addColorStop(1, "rgba(255,0,255,1)");
                        this._ctx.fillStyle = gradient;
                    } else {
                        this._ctx.fillStyle = "rgba(0,255,255,1)";
                    }

                    if (
                        overrides.getKaraokeMode() ===
                            sabre.KaraokeModes.OUTLINE_TOGGLE &&
                        time < overrides.getKaraokeStart()
                    ) {
                        this._ctx.strokeStyle = "rgba(255,255,0,0)";
                    } else {
                        this._ctx.strokeStyle = "rgba(255,255,0,1)";
                    }
                }
            } else {
                if (
                    pass === sabre.RenderPasses.BACKGROUND &&
                    style.getBorderStyle() !==
                        sabre.BorderStyleModes.SRT_STYLE &&
                    style.getBorderStyle() !==
                        sabre.BorderStyleModes.SRT_NO_OVERLAP
                ) {
                    this._ctx.fillStyle = "rgba(0,0,0,1)";
                } else {
                    if (
                        (overrides.getKaraokeMode() ===
                            sabre.KaraokeModes.COLOR_SWAP ||
                            overrides.getKaraokeMode() ===
                                sabre.KaraokeModes.COLOR_SWEEP) &&
                        time < overrides.getKaraokeStart()
                    ) {
                        this._ctx.fillStyle = "rgba(0,255,0,1)";
                    } else if (
                        overrides.getKaraokeMode() ===
                            sabre.KaraokeModes.COLOR_SWEEP &&
                        time < overrides.getKaraokeEnd()
                    ) {
                        const progress = this._calcKaraokeWipeProgress(time, style, overrides);
                        const gradient = this._ctx.createLinearGradient(
                            0,
                            0,
                            this._width,
                            0
                        );
                        gradient.addColorStop(0, "rgba(255,0,0,1)");
                        gradient.addColorStop(progress, "rgba(255,0,0,1)");
                        gradient.addColorStop(
                            Math.min(progress + 1 / this._width, 1),
                            "rgba(0,255,0,1)"
                        );
                        gradient.addColorStop(1, "rgba(0,255,0,1)");
                        this._ctx.fillStyle = gradient;
                    } else {
                        this._ctx.fillStyle = "rgba(255,0,0,1)";
                    }

                    if (
                        overrides.getKaraokeMode() ===
                            sabre.KaraokeModes.OUTLINE_TOGGLE &&
                        time < overrides.getKaraokeStart()
                    ) {
                        this._ctx.strokeStyle = "rgba(0,0,255,0)";
                    } else {
                        this._ctx.strokeStyle = "rgba(0,0,255,1)";
                    }
                }
            }
        },
        writable: false
    },

    _calcSpacing: {
        /**
         * Calc spacing, handing transitions.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         */
        value: function _calcSpacing (time, style, overrides) {
            let transitionOverrides = overrides.getTransitions();
            let spacing = overrides.getSpacing() ?? style.getSpacing();
            for (let i = 0; i < transitionOverrides.length; i++)
                spacing = sabre.performTransition(
                    time,
                    spacing,
                    transitionOverrides[i].getSpacing(),
                    transitionOverrides[i].getTransitionStart(),
                    transitionOverrides[i].getTransitionEnd(),
                    transitionOverrides[i].getTransitionAcceleration()
                );
            return spacing;
        },
        writable: false
    },

    _calcShadow: {
        /**
         * Calculates the shadow offset.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @return {{x:number, y:number}} Shadow x and y offsets.
         */
        value: function _calcShadow (time, style, overrides){
            const shadowComponent =
            Math.sign(style.getShadow()) *
            Math.sqrt(Math.pow(style.getShadow(), 2) / 2);

            return {x: overrides.getShadowX() ?? shadowComponent, y: overrides.getShadowY() ?? shadowComponent};
        },
        writable: false
    },

    _calcKaraokeWipeProgress: {
        /**
         * Calculates the karaoke wipe progress.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @return {number} Ratio of completion of the wipe in the range 0 to 1.
         */
        value: function _calcKaraokeWipeProgress (time, style, overrides){
            return Math.max(time - overrides.getKaraokeStart(), 0) / (overrides.getKaraokeEnd() - overrides.getKaraokeStart());
        },
        writable: false
    },

    _getStateHash: {
        /**
         * Returns a hash of the current event's state for indexing cached glyphs.
         * @param {number} time the time relative to the start of the event.
         * @param {SSASubtitleEvent} event the subtitle event to render
         * @param {number} pass the pass we are on.
         * @param {boolean} mask is this a mask for setable colors.
         * @return {number} Hash of the state.
         */
        value: function _getStateHash (time, event, pass, mask) {
            const style = event.getStyle();
            const overrides = event.getOverrides();

            const karaokeMode = overrides.getKaraokeMode();
            let karaokeProgress = 0;
            if (karaokeMode !== sabre.KaraokeModes.OFF) {
                switch(karaokeMode) {
                    case sabre.KaraokeModes.COLOR_SWAP:
                        if (pass === sabre.RenderPasses.FILL && time >= overrides.getKaraokeStart()) {
                            karaokeProgress = 1;
                        }
                        break;
                    case sabre.KaraokeModes.COLOR_SWEEP:
                        if (pass === sabre.RenderPasses.FILL) {
                            karaokeProgress = this._calcKaraokeWipeProgress(time, style, overrides);
                        }                        
                        break;
                    case sabre.KaraokeModes.OUTLINE_TOGGLE:
                        if (pass === sabre.RenderPasses.OUTLINE && time >= overrides.getKaraokeStart()) {
                            karaokeProgress = 1;
                        }
                        break;
                }
            }
            const scale = this._calcScale(time, style, overrides);
            scale.x *= this._pixelScaleRatio.xratio;
            scale.y *= this._pixelScaleRatio.yratio;
            const state = {
                isMask: mask,
                renderPass: pass,
                outline: this._calcOutline(time, style, overrides),
                strikethrough: overrides.getStrikeout() ?? style.getStrikeout(),
                underline: overrides.getUnderline() ?? style.getUnderline(),
                borderStyle: style.getBorderStyle(),
                karaokeMode: overrides.getKaraokeMode(),
                karaokeProgress: karaokeProgress,
                //spacing: this._calcSpacing(time, style, overrides), //TODO: See if this is needed.
                scale: scale,
                shadow: this._calcShadow(time, style, overrides),
                pixelScaleRatio: this._pixelScaleRatio,
                fontName: this._fontInfo.name,
                fontSize: this._fontInfo.size,
                fontWeight: this._fontInfo.weight,
                fontItalic: this._fontInfo.italic
            };
            return sabre.hashObject(state);
        },
        writable: false
    },

    _handleStyling: {
        /**
         * Sets up the canvas to render according to specified styles.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         * @param {boolean} mask
         */
        value: function _handleStyling (time, style, overrides, pass, mask) {
            this._ctx.textAlign = "left";
            this._ctx.textBaseline = "top";
            this._ctx.lineCap = "round";
            this._ctx.lineJoin = "round";
            this._strikethrough = overrides.getStrikeout() ?? style.getStrikeout();
            this._underline = overrides.getUnderline() ?? style.getUnderline();
            this._setOutline(time, style, overrides);
            this._setFont(time, style, overrides);
            this._setColors(time, style, overrides, pass, mask);
        },
        writable: false
    },

    _drawGlyph: {
        /**
         * Draws glyphs with specified kerning offset.
         * @param {Glyph} glyph the text.
         * @param {number} offsetX the offset of the text in the x coordinate.
         * @param {number} offsetY the offset of the text in the y coordinate.
         * @param {boolean} stroke if true, stroke text, if false fill it.
         * @param {boolean} strikethrough if true, strikethrough text, if false do nothing.
         * @param {boolean} underline if true, underline text, if false do nothing.
         */
        value: function _drawGlyph (glyph, offsetX, offsetY, stroke, strikethrough, underline) {
            const glyphbb = glyph.getBoundingBox();
            const fontSize = this._fontInfo.size;
            const fontUnitsScale = this._fontInfo.font.unitsPerEm || 1000;
            const fontSizeMultiplier = fontSize / fontUnitsScale;
            const yoffset =
                this._fontInfo.font.ascender * fontSizeMultiplier;
            const path = glyph.getPath(
                offsetX,
                offsetY + yoffset,
                fontSize
            );
            path.fill = null;
            path.stroke = null;
            path.draw(this._ctx);
            if (stroke) {
                this._ctx.stroke();
            } else {
                this._ctx.fill();
            }
            if (strikethrough) {
                this._ctx.beginPath();
                const size =  this._fontInfo.strikethroughSize * fontSizeMultiplier;
                const position = this._fontInfo.strikethroughPosition * fontSizeMultiplier;
                this._ctx.rect(offsetX + Math.min(glyphbb.x1, 0) * fontSizeMultiplier, offsetY + yoffset - position, glyph.advanceWidth * fontSizeMultiplier, size);
                if (stroke) {
                    this._ctx.stroke();
                } else {
                    this._ctx.fill();
                }
            }
            if (underline) {
                this._ctx.beginPath();
                const size = this._fontInfo.underlineThickness * fontSizeMultiplier;
                const position = this._fontInfo.underlinePosition * fontSizeMultiplier;
                this._ctx.rect(offsetX + Math.min(glyphbb.x1, 0)  * fontSizeMultiplier, offsetY + yoffset - position, glyph.advanceWidth * fontSizeMultiplier, size);
                if (stroke) {
                    this._ctx.stroke();
                } else {
                    this._ctx.fill();
                }
            }
        },
        writable: false
    },

    "calcBounds": {
        /**
         * Calculate the bounds of the subtitle.
         * @param {number} time the time relative to the start of the event.
         * @param {SSASubtitleEvent} event the subtitle event
         */
        value: function calcBounds (time, event) {
            if (!this._initialized) this._init();

            const style = event.getStyle();
            const overrides = event.getOverrides();

            this._setFont(time, style, overrides);

            this._offsetX = this._offsetY = 0;
            this._eOffsetX = this._eOffsetY = 0;

            const glyphs = this._fontInfo.font.stringToGlyphs(event.getText());

            const spacing = this._calcSpacing(time, style, overrides);
            const scale = this._calcScale(time, style, overrides);

            {
                const fontSize = this._fontInfo.size;
                const fontUnitsScale = this._fontInfo.font.unitsPerEm || 1000;

                this._height = fontSize;

                this._textSpacingWidth = 0;

                if (glyphs.length > 0) {
                    const firstSpacing =
                        Math.max(-glyphs[0].getBoundingBox().x1, 0) *
                        (fontSize / fontUnitsScale);
                    const lastSpacing =
                        Math.max(
                            0,
                            glyphs[glyphs.length - 1].getBoundingBox().x2
                        ) *
                        (fontSize / fontUnitsScale);
                    this._offsetX += firstSpacing;

                    this._width = firstSpacing + lastSpacing;

                    for (let i = 0; i < glyphs.length; i++) {
                        let kerning = 0;
                        if (i + 1 < glyphs.length) {
                            kerning = this._fontInfo.font.getKerningValue(
                                glyphs[i],
                                glyphs[i + 1]
                            );
                        }
                        kerning =
                            (glyphs[i].advanceWidth + kerning) *
                                (fontSize / fontUnitsScale) +
                            spacing;
                        this._textSpacingWidth += kerning;
                        this._width += kerning;
                    }
                }
            }

            {
                this._offsetX *= scale.x * this._pixelScaleRatio.xratio;
                this._offsetY *= scale.y * this._pixelScaleRatio.yratio;
                this._width *= scale.x * this._pixelScaleRatio.xratio;
                this._textSpacingWidth *=
                    scale.x * this._pixelScaleRatio.xratio;
                this._height *= scale.y * this._pixelScaleRatio.yratio;
            }
        }
    },

    "startEventRender": {
        /**
         * Starts the rendering of an event.
         * @param {number} time the time relative to the start of the event.
         * @param {SSASubtitleEvent} event the subtitle event to render
         * @param {number} pass the pass we are on.
         * @param {boolean} mask is this a mask for setable colors.
         * @return {number} event style state hash. 
         */
        value: function startEventRender (time, event, pass, mask) {
            if (!this._initialized) this._init();

            const style = event.getStyle();
            const overrides = event.getOverrides();

            this._offsetX = this._offsetY = 0;
            this._eOffsetX = this._eOffsetY = 0;
            this._glyphIndex = 0;

            this._handleStyling(time, style, overrides, pass, mask);

            this._glyphs = this._fontInfo.font.stringToGlyphs(event.getText());

            this._spacing = this._calcSpacing(time, style, overrides);
            this._scale = this._calcScale(time, style, overrides);

            this._noDraw = false;

            const borderStyle = style.getBorderStyle();

            if (pass === sabre.RenderPasses.BACKGROUND) {
                if (
                    borderStyle !== sabre.BorderStyleModes.NONE &&
                    borderStyle !== sabre.BorderStyleModes.SRT_STYLE &&
                    borderStyle !== sabre.BorderStyleModes.SRT_NO_OVERLAP
                ) {
                    const shadow = this._calcShadow(time, style, overrides);
                   
                    if (shadow.x === 0 && shadow.y === 0) {
                        this._noDraw = true;
                        return this._getStateHash(time, event, pass, mask);
                    }

                    this._eOffsetX +=
                        shadow.x * this._scale.x * (this._scaledOutlineAndShadow?this._pixelScaleRatio.xratio:1);
                    this._eOffsetY +=
                        shadow.y * this._scale.y * (this._scaledOutlineAndShadow?this._pixelScaleRatio.yratio:1);
                } else if (borderStyle === sabre.BorderStyleModes.NONE) {
                    this._noDraw = true;
                }
            }
            return this._getStateHash(time, event, pass, mask);
        },
        writable: false
    },

    "nextGlyph": {
        /**
         * Return info on the next glyph for rendering.
         * @return {{prevGlyph:?Glyph, glyph:?Glyph, breakOut:boolean}} Information on the glyph to render.
         */
        value: function nextGlyph () {
            if (
                this._glyphs.length <= 0 ||
                this._glyphIndex > this._glyphs.length ||
                this._noDraw
            ) {
                this._width = 0;
                this._height = 0;
                this._textSpacingWidth = 0;
                return {"prevGlyph":null, "glyph":null, "breakOut":true};
            }

            const prevGlyph =
                this._glyphIndex - 1 >= 0
                    ? this._glyphs[this._glyphIndex - 1]
                    : null;
            return {"prevGlyph":prevGlyph, "glyph":this._glyphs[this._glyphIndex], "breakOut":++this._glyphIndex > this._glyphs.length};
        },
        writable: false
    },

    "positionCachedGlyph": {
        /**
         * Position a cached glyph.
         * @param {{prevGlyph:?Glyph, glyph:?Glyph, breakOut:boolean}} glyphInfo Glyph information.
         */
        value: function positionCachedGlyph (glyphInfo) {
            if (glyphInfo.breakOut && (glyphInfo.glyph === null || typeof(glyphInfo.glyph) === "undefined"))
                return;
            const prevGlyph = glyphInfo["prevGlyph"];
            const glyph = /** @type {Glyph} */ (glyphInfo["glyph"]);
            {
                const fontSize = this._fontInfo.size;
                const fontUnitsScale = this._fontInfo.font.unitsPerEm || 1000;
                if (prevGlyph !== null) {
                    const kerning = this._fontInfo.font.getKerningValue(
                        prevGlyph,
                        glyph
                    );
                    this._eOffsetX +=
                        ((kerning + prevGlyph.advanceWidth) *
                            (fontSize / fontUnitsScale) +
                            this._spacing) *
                        this._scale.x *
                        this._pixelScaleRatio.xratio;
                }
            }
        },
        writable: true
    },

    "renderGlyph": {
        /**
         * Render a glyph for composition.
         * @param {number} time the time relative to the start of the event.
         * @param {SSASubtitleEvent} event the subtitle event to render.
         * @param {{prevGlyph:?Glyph, glyph:?Glyph, breakOut:boolean}} glyphInfo Glyph information.
         * @param {number} pass the pass we are on.
         * @param {boolean} mask is this a mask for setable colors.
         * @return {boolean} Is glyph cachable.
         */
        value: function renderGlyph (time, event, glyphInfo, pass, mask) {
            if (glyphInfo.breakOut && (glyphInfo.glyph === null || typeof(glyphInfo.glyph) === "undefined"))
                return false;
            let style = event.getStyle();
            let overrides = event.getOverrides();
            let lineOverrides = event.getLineOverrides();
            let lineTransitionTargetOverrides =
                event.getLineTransitionTargetOverrides();

            const borderStyle = style.getBorderStyle();

            //Reset the scaling from previous subtitles.
            this._ctx.resetTransform();

            this._offsetX = this._offsetY = 0;
            const prevGlyph = glyphInfo["prevGlyph"];
            const glyph = /** @type {Glyph} */ (glyphInfo["glyph"]);
            //calculate size of text without scaling.
            {
                const fontSize = this._fontInfo.size;
                const fontUnitsScale = this._fontInfo.font.unitsPerEm || 1000;

                this._height =
                    fontSize * this._scale.y * this._pixelScaleRatio.yratio;

                const bb = glyph.getBoundingBox();
                const firstSpacing =
                    Math.max(-bb.x1, 0) * (fontSize / fontUnitsScale);
                const lastSpacing =
                    Math.max(0, bb.x2) * (fontSize / fontUnitsScale);
                this._offsetX += firstSpacing;
                if (prevGlyph !== null) {
                    const kerning = this._fontInfo.font.getKerningValue(
                        prevGlyph,
                        glyph
                    );
                    this._eOffsetX +=
                        ((kerning + prevGlyph.advanceWidth) *
                            (fontSize / fontUnitsScale) +
                            this._spacing) *
                        this._scale.x *
                        this._pixelScaleRatio.xratio;
                }
                this._textSpacingWidth =
                    glyph.advanceWidth *
                    this._scale.x *
                    this._pixelScaleRatio.xratio;
                if (this._underline || this._strikethrough) {
                    this._width = this._textSpacingWidth;
                } else {
                    this._width =
                        (firstSpacing + lastSpacing) *
                        this._scale.x *
                        this._pixelScaleRatio.xratio;
                }
            }

            //pad for outline
            let outline_x = 0;
            let outline_y = 0;

            if (
                pass === sabre.RenderPasses.OUTLINE ||
                pass === sabre.RenderPasses.BACKGROUND
            ) {
                let outline = this._calcOutline(time, style, overrides);
                this._width +=
                    outline.x *
                    2 *
                    this._scale.x *
                    (this._scaledOutlineAndShadow?this._pixelScaleRatio.xratio:1);
                this._height +=
                    outline.y *
                    2 *
                    this._scale.y *
                    (this._scaledOutlineAndShadow?this._pixelScaleRatio.yratio:1);
                outline_x = (!this._scaledOutlineAndShadow?outline.x/this._pixelScaleRatio.xratio:outline.x);
                outline_y = (!this._scaledOutlineAndShadow?outline.y/this._pixelScaleRatio.yratio:outline.y);
                this._offsetX += outline_x;
                this._offsetY += outline_y;
                
            }

            let offsetXUnscaled = this._offsetX;
            let offsetYUnscaled = this._offsetY;

            {
                this._offsetX *= this._scale.x * this._pixelScaleRatio.xratio;
                this._offsetY *= this._scale.y * this._pixelScaleRatio.yratio;
            }

            {
                {
                    let cwidth = Math.max(
                        Math.max(Math.ceil(this._width), 64),
                        this._canvas.width
                    );
                    let cheight = Math.max(
                        Math.max(Math.ceil(this._height), 64),
                        this._canvas.height
                    );
                    if (
                        this._canvas.width >= cwidth &&
                        this._canvas.height >= cheight
                    ) {
                        this._ctx.clearRect(
                            0,
                            0,
                            Math.ceil(this._width),
                            Math.ceil(this._height)
                        );
                    } else {
                        if (this._canvas.height < cheight) {
                            this._canvas.height = cheight;
                        }
                        if (this._canvas.width < cwidth) {
                            this._canvas.width = cwidth;
                        }
                    }
                }
                this._handleStyling(time, style, overrides, pass, mask); //To workaround a bug.

                this._setScale(
                    time,
                    style,
                    overrides,
                    lineOverrides,
                    lineTransitionTargetOverrides,
                    pass,
                    mask
                );

                //reset the composite operation
                this._ctx.globalCompositeOperation = "source-over";
                //draw the text
                if (pass === sabre.RenderPasses.BACKGROUND) {
                    switch (borderStyle) {
                        case sabre.BorderStyleModes.NONE:
                            return false;
                        case sabre.BorderStyleModes.UNKNOWN:
                        case sabre.BorderStyleModes.NORMAL:
                        default:
                            {
                                this._drawGlyph(
                                    glyph,
                                    offsetXUnscaled,
                                    offsetYUnscaled,
                                    false,
                                    this._strikethrough,
                                    this._underline
                                );
                            }
                            break;
                        case sabre.BorderStyleModes.SRT_STYLE:
                        case sabre.BorderStyleModes.SRT_NO_OVERLAP:
                            this._ctx.fillRect(0, 0, this._width, this._height);
                            break;
                    }
                } else if (pass === sabre.RenderPasses.OUTLINE) {
                    if (
                        borderStyle === sabre.BorderStyleModes.NONE ||
                        borderStyle === sabre.BorderStyleModes.SRT_STYLE ||
                        borderStyle === sabre.BorderStyleModes.SRT_NO_OVERLAP ||
                        (outline_x === 0 && outline_y === 0)
                    )
                        return false;
                    const outline_x_bigger = outline_x > outline_y;
                    const outline_gt_zero = outline_x > 0 && outline_y > 0;
                    this._ctx.fillStyle = this._ctx.strokeStyle;
                    // Smear outline
                    if (outline_x_bigger) {
                        if (outline_gt_zero) {
                            for (
                                let i = -outline_x / outline_y;
                                i <= outline_x / outline_y;
                                i += outline_y / outline_x
                            ) {
                                this._drawGlyph(
                                    glyph,
                                    offsetXUnscaled + i,
                                    offsetYUnscaled,
                                    true,
                                    this._strikethrough,
                                    this._underline
                                );
                            }
                            this._drawGlyph(
                                glyph,
                                offsetXUnscaled,
                                offsetYUnscaled,
                                false,
                                this._strikethrough,
                                this._underline
                            );
                        } else {
                            for (let i = -outline_x; i <= outline_x; i++) {
                                this._drawGlyph(
                                    glyph,
                                    offsetXUnscaled + i,
                                    offsetYUnscaled,
                                    false,
                                    this._strikethrough,
                                    this._underline
                                );
                            }
                        }
                    } else {
                        if (outline_gt_zero) {
                            for (
                                let i = -outline_y / outline_x;
                                i <= outline_y / outline_x;
                                i += outline_x / outline_y
                            ) {
                                this._drawGlyph(
                                    glyph,
                                    offsetXUnscaled,
                                    offsetYUnscaled + i,
                                    true,
                                    this._strikethrough,
                                    this._underline
                                );
                            }
                            this._drawGlyph(
                                glyph,
                                offsetXUnscaled,
                                offsetYUnscaled,
                                false,
                                this._strikethrough,
                                this._underline
                            );
                        } else {
                            for (let i = -outline_y; i <= outline_y; i++) {
                                this._drawGlyph(
                                    glyph,
                                    offsetXUnscaled,
                                    offsetYUnscaled + i,
                                    false,
                                    this._strikethrough,
                                    this._underline
                                );
                            }
                        }
                    }
                } else {
                    this._drawGlyph(
                        glyph,
                        offsetXUnscaled,
                        offsetYUnscaled,
                        false,
                        this._strikethrough,
                        this._underline
                    );
                }
            }
            return true;
        },
        writable: false
    },

    "setRequestFont": {
        /**
         * Sets the function used to request fonts from the font server.
         * @param {!function(string,number,boolean):!{font:Font,foundItalic:boolean,foundWeight:number}} callback the callback function to fetch a font.
         */
        value: function setRequestFont (callback) {
            this._requestFont = callback;
        },
        writable: false
    },

    "setPixelScaleRatio": {
        /**
         * Sets the scale ratio for pixels to account for differences between script pixels and pixels.
         * @param {number} xratio the ratio in the x coordinate.
         * @param {number} yratio the ratio in the y coordinate.
         */
        value: function setPixelScaleRatio (xratio, yratio) {
            if(this._ctx){
                const backingRatio = sabre.getBackingRatio(this._ctx);
                this._pixelScaleRatio = { xratio: xratio/backingRatio, yratio: yratio/backingRatio, preFactoredBacking: true };
            }else{
                this._pixelScaleRatio = { xratio: xratio, yratio: yratio, preFactoredBacking: false };
            }
        },
        writable: false
    },

    "setScaledOutlineAndShadowEnabled": {
        /**
         * Sets whether the outline should be scaled when we are rendering to a higher resolution than the video.
         * @param {boolean} enabled if true, the outline will be scaled.
         */
        value: function setScaledOutlineEnabled (enabled) {
            this._scaledOutlineAndShadow = enabled;
        },
        writable: false
    },

    "getOffset": {
        /**
         * Gets the internal offset of the resulting image.
         * @return {Array<number>} internal offset of the resulting image
         */
        value: function getOffset () {
            return [
                this._offsetX / this._pixelScaleRatio.xratio,
                this._offsetY / this._pixelScaleRatio.yratio
            ];
        },
        writable: false
    },

    "getOffsetExternal": {
        /**
         * Gets the offset of the resulting image relative to its positioning coordinates.
         * @return {Array<number>} external offset of the resulting image
         */
        value: function getOffsetExternal () {
            return [
                this._eOffsetX / this._pixelScaleRatio.xratio,
                this._eOffsetY / this._pixelScaleRatio.yratio
            ];
        },
        writable: false
    },

    "getBounds": {
        /**
         * Gets the collision bounds of the text.
         * @return {Array<number>} dimensions of the text.
         */
        value: function getBounds () {
            return [
                this._textSpacingWidth / this._pixelScaleRatio.xratio,
                this._height / this._pixelScaleRatio.yratio
            ];
        },
        writable: false
    },

    "getDimensions": {
        /**
         * Gets the dimensions of the resulting image.
         * @return {Array<number>} dimensions of the resulting image
         */
        value: function getDimensions () {
            return [
                this._width / this._pixelScaleRatio.xratio,
                this._height / this._pixelScaleRatio.yratio
            ];
        },
        writable: false
    },

    "getTextureDimensions": {
        /**
         * Gets the dimensions of the resulting image.
         * @return {Array<number>} dimensions of the resulting image
         */
        value: function getTextureDimensions () {
            return [this._width, this._height];
        },
        writable: false
    },

    "getExtents": {
        /**
         * Gets the dimensions of the canvas.
         * @return {Array<number>} dimensions of the canvas
         */
        value: function getExtents () {
            return [
                Math.max(
                    Math.max(Math.ceil(this._width), 64),
                    this._canvas.width
                ),
                Math.max(
                    Math.max(Math.ceil(this._height), 64),
                    this._canvas.height
                )
            ];
        },
        writable: false
    },

    "getImage": {
        value: function getImage () {
            return this._canvas;
        },
        writable: true
    }
});

sabre["Canvas2DTextRenderer"] = function Canvas2DTextRenderer () {
    return Object.create(text_renderer_prototype);
};
