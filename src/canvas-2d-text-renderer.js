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

    _fontInfo:{
        /**
         * @type {?{font:!Font,size:number,italic:boolean,foundItalic:boolean,weight:number,foundWeight:number}}
         */
        value: null,
        writable: true
    },

    _requestFont:{
        /**
         * @type {?function(string,number,boolean):!{font:Font,foundItalic:boolean,foundWeight:number}}
         */
        value: null,
        writable: true
    },

    _offsetX: {
        /**
         * The offset in the x coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _offsetY: {
        /**
         * The offset in the y coordinate.
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
        value: function () {
            const options = Object.freeze({
                "alpha": true,
                "desynchronized": true
            });
            if (typeof global.OffscreenCanvas === "undefined") {
                this._canvas = global.document.createElement("canvas");
                this._canvas.height = this._canvas.width = 64;
            } else {
                this._canvas = new global.OffscreenCanvas(64, 64);
            }
            this._height = this._width = 1;
            this._ctx = this._canvas.getContext("2d", options);
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
        value: function (time, style, overrides) {
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
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {SSALineStyleOverride} lineOverrides
         * @param {SSALineTransitionTargetOverride} lineTransitionTargetOverrides
         * @param {number} pass
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass
        ) {
            let scale = this._calcScale(time, style, overrides);
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

    _setOutline: {
        /**
         * Set outline width to the correct size.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {SSALineStyleOverride} lineOverrides
         * @param {SSALineTransitionTargetOverride} lineTransitionTargetOverrides
         * @param {number} pass
         * @param {boolean} mask
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass,
            mask
        ) {
            let outline = this._calcOutline(time, style, overrides);

            this._ctx.lineWidth = Math.min(outline.x, outline.y) * 2;
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
        value: function (time, style, overrides) {
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
         * @param {SSALineStyleOverride} lineOverrides
         * @param {SSALineTransitionTargetOverride} lineTransitionTargetOverrides
         * @param {number} pass
         * @param {boolean} mask
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass,
            mask
        ) {
            let fontSize = this._calcFontSize(time, style, overrides);
            let fontName = overrides.getFontName() ?? style.getFontName();
            let fontWeight = overrides.getWeight() ?? style.getWeight();
            let fontItalicized = overrides.getItalic() ?? style.getItalic();
            let {font,foundItalic,foundWeight} = this._requestFont(fontName,fontWeight,fontItalicized);
            this._fontInfo = {};
            this._fontInfo.font = font;
            this._fontInfo.foundItalic = foundItalic;
            this._fontInfo.foundWeight = foundWeight;
            this._fontInfo.size = fontSize;
            this._fontInfo.weight = fontWeight;
            this._fontInfo.italic = fontItalicized;
        },
        writable: false
    },

    _setColors: {
        /**
         * Set the colors for the subtitle.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {SSALineStyleOverride} lineOverrides
         * @param {SSALineTransitionTargetOverride} lineTransitionTargetOverrides
         * @param {number} pass
         * @param {boolean} mask
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass,
            mask
        ) {
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
                        let progress =
                            Math.max(time - overrides.getKaraokeStart(), 0) /
                            (overrides.getKaraokeEnd() -
                                overrides.getKaraokeStart());
                        let gradient = this._ctx.createLinearGradient(
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
                        gradient.addColorStop(1, "rgba(0,255,255,1)");
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
                        let progress =
                            Math.max(time - overrides.getKaraokeStart(), 0) /
                            (overrides.getKaraokeEnd() -
                                overrides.getKaraokeStart());
                        let gradient = this._ctx.createLinearGradient(
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
                        gradient.addColorStop(1, "rgba(255,0,0,1)");
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
        value: function (time, style, overrides) {
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

    _handleStyling: {
        /**
         * Sets up the canvas to render according to specified styles.
         * @param {number} time
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {SSALineStyleOverride} lineOverrides
         * @param {SSALineTransitionTargetOverride} lineTransitionTargetOverrides
         * @param {number} pass
         * @param {boolean} mask
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass,
            mask
        ) {
            this._ctx.textAlign = "left";
            this._ctx.textBaseline = "top";
            this._ctx.lineCap = "round";
            this._ctx.lineJoin = "round";
            //TODO: Strikeout/Strikethrough
            this._setOutline(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass,
                mask
            );
            this._setFont(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass,
                mask
            );
            this._setColors(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass,
                mask
            );
        },
        writable: false
    },

    _drawGlyphs: {
        /**
         * Draws glyphs with specified kerning offset.
         * @param {Array<Glyph>} glyphs the text.
         * @param {number} offsetX the offset of the text in the x coordinate.
         * @param {number} offsetY the offset of the text in the y coordinate.
         * @param {number} kerning_offset the amount to offset kerning by.
         * @param {boolean} stroke if true, stroke text, if false fill it.
         */
        value: function (glyphs, offsetX, offsetY, kerning_offset, stroke) {
            let letter_offset = 0;
            const fontSize = this._fontInfo.size;
            const fontUnitsScale = this._fontInfo.font.unitsPerEm || 1000;
            const yoffset = (this._fontInfo.font.ascender * (fontSize/fontUnitsScale));
            for (let i = 0; i < glyphs.length; i++) {
                const path = glyphs[i].getPath(
                    offsetX + letter_offset,
                    offsetY + yoffset,
                    fontSize
                )
                path.fill = null;
                path.stroke = null;
                path.draw(this._ctx);
                if(stroke){
                    this._ctx.stroke();
                }else{
                    this._ctx.fill();
                }
                let kerning = 0;
                if(i+1 < glyphs.length){
                    kerning += this._fontInfo.font.getKerningValue(glyphs[i],glyphs[i+1]);
                }
                letter_offset += ((glyphs[i].advanceWidth + kerning) * (fontSize/fontUnitsScale)) + kerning_offset;
            }
        },
        writable: false
    },

    "renderEvent": {
        /**
         * Render an event.
         * @param {number} time the time relative to the start of the event.
         * @param {SSASubtitleEvent} event the subtitle event to render
         * @param {number} pass the pass we are on.
         * @param {boolean} dryRun is this a dry run for positioning.
         * @param {boolean} mask is this a mask for setable colors.
         */
        value: function (time, event, pass, dryRun, mask) {
            if (!this._initialized) this._init();

            let style = event.getStyle();
            let overrides = event.getOverrides();
            let lineOverrides = event.getLineOverrides();
            let lineTransitionTargetOverrides =
                event.getLineTransitionTargetOverrides();

            this._offsetX = this._offsetY = 0;

            //Reset the scaling from previous subtitles.
            this._ctx.resetTransform();

            this._handleStyling(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass,
                mask
            );

            let noDraw = false;
            //These are used in multiple places, so to avoid recalculation we put it in the function scope.
            let spacing = this._calcSpacing(time, style, overrides);
            let scale = this._calcScale(time, style, overrides);

            let glyphs = this._fontInfo.font.stringToGlyphs(event.getText());
            if(glyphs.length )
            //calculate size of text without scaling.
            {
                const fontSize = this._fontInfo.size;
                const fontUnitsScale = this._fontInfo.font.unitsPerEm||1000;
                
                this._height = fontSize;

                this._textSpacingWidth = 0;

                if(glyphs.length > 0) {
                    const firstSpacing = Math.max(-glyphs[0].getBoundingBox().x1,0) * (fontSize/fontUnitsScale);
                    const lastSpacing = Math.max(0,glyphs[glyphs.length-1].getBoundingBox().x2) * (fontSize/fontUnitsScale);
                    this._offsetX += firstSpacing;

                    this._width = firstSpacing+lastSpacing;
                
                    for(let i = 0; i < glyphs.length; i++){
                        let kerning = 0;
                        if(i+1 < glyphs.length){
                            kerning += this._fontInfo.font.getKerningValue(glyphs[i],glyphs[i+1]);
                        }
                        kerning = ((glyphs[i].advanceWidth + kerning) * (fontSize/fontUnitsScale)) + spacing;
                        this._textSpacingWidth += kerning;
                        this._width += kerning;
                    }
                }
            }

            let borderStyle = event.getStyle().getBorderStyle();

            //pad for outline
            let outline_x = 0;
            let outline_y = 0;

            if (
                pass === sabre.RenderPasses.OUTLINE ||
                pass === sabre.RenderPasses.BACKGROUND
            ) {
                let outline = this._calcOutline(time, style, overrides);
                this._width += outline.x * 2;
                this._height += outline.y * 2;
                this._offsetX += outline.x;
                this._offsetY += outline.y;
                outline_x = outline.x;
                outline_y = outline.y;
            }

            let offsetXUnscaled = this._offsetX;
            let offsetYUnscaled = this._offsetY;

            if (pass === sabre.RenderPasses.BACKGROUND) {
                if (
                    borderStyle !== sabre.BorderStyleModes.NONE &&
                    borderStyle !== sabre.BorderStyleModes.SRT_STYLE &&
                    borderStyle !== sabre.BorderStyleModes.SRT_NO_OVERLAP
                ) {
                    let shadowComponent =
                        Math.sign(style.getShadow()) *
                        Math.sqrt(Math.pow(style.getShadow(), 2) / 2);

                    let shadowX = overrides.getShadowX() ?? shadowComponent;
                    let shadowY = overrides.getShadowY() ?? shadowComponent;

                    if (shadowX === 0 && shadowY === 0) noDraw = true;

                    this._offsetX -= shadowX;
                    this._offsetY -= shadowY;
                } else if (borderStyle === sabre.BorderStyleModes.NONE) {
                    noDraw = true;
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

            if (!dryRun) {
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
                this._handleStyling(
                    time,
                    style,
                    overrides,
                    lineOverrides,
                    lineTransitionTargetOverrides,
                    pass,
                    mask
                ); //To workaround a bug.

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
                if (!noDraw) {
                    if (pass === sabre.RenderPasses.BACKGROUND) {
                        switch (borderStyle) {
                            case sabre.BorderStyleModes.NONE:
                                return;
                            case sabre.BorderStyleModes.UNKNOWN:
                            case sabre.BorderStyleModes.NORMAL:
                            default:
                                {
                                    this._drawGlyphs(
                                        glyphs,
                                        offsetXUnscaled,
                                        offsetYUnscaled,
                                        spacing,
                                        false
                                    );
                                }
                                break;
                            case sabre.BorderStyleModes.SRT_STYLE:
                            case sabre.BorderStyleModes.SRT_NO_OVERLAP:
                                this._ctx.fillRect(
                                    0,
                                    0,
                                    this._width,
                                    this._height
                                );
                                break;
                        }
                    } else if (pass === sabre.RenderPasses.OUTLINE) {
                        if (
                            borderStyle === sabre.BorderStyleModes.NONE ||
                            borderStyle === sabre.BorderStyleModes.SRT_STYLE ||
                            borderStyle ===
                                sabre.BorderStyleModes.SRT_NO_OVERLAP
                        )
                            return;
                        let outline_x_bigger = outline_x > outline_y;
                        let outline_gt_zero = outline_x > 0 && outline_y > 0;
                        this._ctx.fillStyle = this._ctx.strokeStyle;
                        // Smear outline
                        if (outline_x_bigger) {
                            if (outline_gt_zero) {
                                for (
                                    let i = -outline_x / outline_y;
                                    i <= outline_x / outline_y;
                                    i += outline_y / outline_x
                                ) {
                                    this._drawGlyphs(
                                        glyphs,
                                        offsetXUnscaled + i,
                                        offsetYUnscaled,
                                        spacing,
                                        true
                                    );
                                }
                                this._drawGlyphs(
                                    glyphs,
                                    offsetXUnscaled,
                                    offsetYUnscaled,
                                    spacing,
                                    false
                                );
                            } else {
                                for (
                                    let i = -outline_x;
                                    i <= outline_x;
                                    i++
                                ) {
                                    this._drawGlyphs(
                                        glyphs,
                                        offsetXUnscaled + i,
                                        offsetYUnscaled,
                                        spacing,
                                        false
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
                                    this._drawGlyphs(
                                        glyphs,
                                        offsetXUnscaled,
                                        offsetYUnscaled + i,
                                        spacing,
                                        true
                                    );
                                }
                                this._drawGlyphs(
                                    glyphs,
                                    offsetXUnscaled,
                                    offsetYUnscaled,
                                    spacing,
                                    false
                                );
                            } else {
                                for (
                                    let i = -outline_y;
                                    i <= outline_y;
                                    i++
                                ) {
                                    this._drawGlyphs(
                                        glyphs,
                                        offsetXUnscaled,
                                        offsetYUnscaled + i,
                                        spacing,
                                        false
                                    );
                                }
                            }
                        }
                    } else {
                        this._drawGlyphs(
                            glyphs,
                            offsetXUnscaled,
                            offsetYUnscaled,
                            spacing,
                            false
                        );
                    }
                }
            }
        },
        writable: false
    },

    "setRequestFont": {
        /**
         * Sets the function used to request fonts from the font server.
         * @param {!function(string,number,boolean):!{font:Font,foundItalic:boolean,foundWeight:number}} callback the callback function to fetch a font.
         */
        value: function(callback){
            this._requestFont = callback;
        },
        writable:false
    },

    "setPixelScaleRatio": {
        /**
         * Sets the scale ratio for pixels to account for differences between script pixels and pixels.
         * @param {number} xratio the ratio in the x coordinate.
         * @param {number} yratio the ratio in the y coordinate.
         */
        value: function (xratio, yratio) {
            this._pixelScaleRatio = { xratio: xratio, yratio: yratio };
        },
        writable: false
    },

    "getOffset": {
        /**
         * Gets the offset of the resulting image.
         * @return {Array<number>} offset of the resulting image
         */
        value: function () {
            return [
                this._offsetX / this._pixelScaleRatio.xratio,
                this._offsetY / this._pixelScaleRatio.yratio
            ];
        },
        writable: false
    },

    "getBounds": {
        /**
         * Gets the collision bounds of the text.
         * @return {Array<number>} dimensions of the text.
         */
        value: function () {
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
        value: function () {
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
        value: function () {
            return [this._width, this._height];
        },
        writable: false
    },

    "getExtents": {
        /**
         * Gets the dimensions of the canvas.
         * @return {Array<number>} dimensions of the canvas
         */
        value: function () {
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
        value: function () {
            return this._canvas;
        },
        writable: true
    }
});

sabre["Canvas2DTextRenderer"] = function () {
    return Object.create(text_renderer_prototype);
};
