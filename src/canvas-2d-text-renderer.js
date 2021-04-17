/*
 |   canvas-2d-text-renderer.js
 |----------------
 |  canvas-2d-text-renderer.js is copyright Patrick Rhodes Martin 2019.
 |
 |-
 */
/**
 * @fileoverview advance stubstation alpha subtitle text renderer.
 */
//@include [util.js]
//@include [global-constants.js]
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
sabre.import("util.min.js");
sabre.import("global-constants.min.js");
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre.import("subtitle-event.min.js");

const lineSpacing = 1.2;

const text_renderer_prototype = global.Object.create(Object, {
    _serializer: {
        value: new XMLSerializer(),
        writable: false
    },

    _initialized: {
        /**
         * Is the text renderer initialized.
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _pixelsPerDpt: {
        /**
         * Pixel to Dpt Ratio
         * @type {number}
         */
        value: 72 / 96,
        writable: false
    },

    _blur_urls: {
        /**
         * Blur URLS
         * @type {Array<string>}
         */
        value: [],
        writable: false
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
         * The width of the canvas.
         * @type {number}
         */
        value: NaN,
        writable: true
    },

    _height: {
        /**
         * The height of the canvas.
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
            if (typeof global.OffscreenCanvas == "undefined") {
                this._canvas = global.document.createElement("canvas");
                this._height = this._width = 0;
            } else {
                this._canvas = new global.OffscreenCanvas(0, 0);
            }
            this._ctx = this._canvas.getContext("2d", {
                "alpha": true,
                "desynchronized": true
            });
            this._initialized = true;
        },
        writable: false
    },

    _getBlurKernelValueForPosition: {
        value: function (center_value, x, y, dim, intgr) {
            if (intgr == null) intgr = false;
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

    _getBlurMatrixUrl: {
        /**
         * Generates a edge-blur URL.
         * @param {number} blur_count Number of times to apply edge-blur.
         * @returns {string} the resulting URL.
         */
        value: function (blur_count) {
            if (
                typeof this._blur_urls[blur_count] === "undefined" ||
                this._blur_urls[blur_count] == null
            ) {
                let filterdom;
                let doctype = global.document.implementation.createDocumentType(
                    "svg",
                    "-//W3C//DTD SVG 1.1//EN",
                    "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"
                );
                let filter_doc = (filterdom = global.document.implementation.createDocument(
                    "http://www.w3.org/2000/svg",
                    "svg",
                    doctype
                )).documentElement;
                let defs = filterdom.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "defs"
                );
                let filter = filterdom.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "filter"
                );
                filter.setAttribute("id", "filter");
                defs.appendChild(filter);
                filter_doc.appendChild(defs);
                filter.setAttribute("filterUnits", "userSpaceOnUse");
                filter.setAttribute("x", "0");
                filter.setAttribute("y", "0");
                filter.setAttribute("width", global.screen.width);
                filter.setAttribute("height", global.screen.height);
                let filters_count = 0;
                while (blur_count > 0) {
                    let blur = filterdom.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "feConvolveMatrix"
                    );
                    blur.setAttribute("edgeMode", "none");
                    if (filters_count++ == 0)
                        blur.setAttribute("in", "SourceGraphic");
                    else
                        blur.setAttribute(
                            "in",
                            "filterStep" + (filters_count - 1)
                        );
                    let blur_matrix = [];
                    for (let i = 0; i < 5; i++)
                        for (let j = 0; j < 5; j++)
                            blur_matrix[
                                i * 5 + j
                            ] = this._getBlurKernelValueForPosition(
                                4,
                                j,
                                i,
                                5,
                                false
                            );
                    blur.setAttribute("order", Math.sqrt(blur_matrix.length));
                    blur.setAttribute("kernelMatrix", blur_matrix.join(", "));
                    if (--blur_count > 0)
                        blur.setAttribute(
                            "result",
                            "filterStep" + filters_count
                        );
                    filter.appendChild(blur);
                }
                let filterxml = this._serializer.serializeToString(filterdom);
                let filterurl =
                    "data:image/svg+xml;utf8," +
                    global.encodeURIComponent(filterxml) +
                    "#filter";
                return (this._blur_urls[blur_count] = filterurl);
            } else {
                return this._blur_urls[blur_count];
            }
        },
        writable: false
    },

    _setScale: {
        /**
         * Sets up the canvas to render to the correct scale.
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         */
        value: function (style, overrides, pass) {
            this._ctx.scale(
                overrides.getScaleX() ?? style.getScaleX(),
                overrides.getScaleY() ?? style.getScaleY()
            );
        },
        writable: false
    },

    _setOutline: {
        /**
         * Set outline width to the correct size.
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         */
        value: function (style, overrides, pass) {
            //TODO: Figgure out a good way to do dimension specific line widths.
            if (pass == sabre.RenderPasses.OUTLINE)
                this._ctx.lineWidth =
                    (overrides.getOutlineX() ?? style.getOutlineX()) +
                    (overrides.getOutlineY() ?? style.getOutlineY()); //AVERAGE * 2 = SUM
        },
        writable: false
    },

    _setFont: {
        /**
         * Set font settings for drawing.
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         */
        value: function (style, overrides, pass) {
            let fontSize =
                (overrides.getFontSize() ?? style.getFontSize()) +
                overrides.getFontSizeMod();
            let fontName = overrides.getFontName() ?? style.getFontName();
            let fontWeight = overrides.getWeight() ?? style.getWeight();
            let fontItalicized = overrides.getItalic() ?? style.getItalic();
            let font =
                fontSize * this._pixelsPerDpt +
                "px '" +
                fontName +
                "', 'Arial', 'Open Sans'";
            font = fontWeight + " " + font;
            if (fontItalicized) font = "italic " + font;
            this._ctx.font = font;
        },
        writable: false
    },

    _setEdgeBlur: {
        /**
         * Set box blur radius, gaussian blur is handled in the compositing step instead of here for performance reasons.
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         */
        value: function (style, overrides, pass) {
            let iterations = overrides.getEdgeBlur() ?? 0;
            if (iterations > 0) {
                this._ctx.filter =
                    "url('" + this._getBlurMatrixUrl(iterations) + "')";
            } else this._ctx.filter = "none";
        },
        writable: false
    },

    _disableEdgeBlur: {
        /**
         * disables edge blur for passes where it is invalid.
         */
        value: function () {
            this._ctx.filter = "none";
        },
        writable: false
    },

    _setColors: {
        /**
         * Set the colors for the subtitle.
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         */
        value: function (style, overrides, pass) {},
        writable: false
    },

    _handleStyling: {
        /**
         * Sets up the canvas to render according to specified styles.
         * @param {SSAStyleDefinition} style
         * @param {SSAStyleOverride} overrides
         * @param {number} pass
         */
        value: function (style, overrides, pass) {
            this._ctx.resetTransform();
            this._setScale(style, overrides, pass);
            this._setOutline(style, overrides, pass);
            this._setFont(style, overrides, pass);
            this._setColors(style, overrides, pass);
            {
                let borderStyle = style.getBorderStyle();
                let outlineActive =
                    (overrides.getOutlineX() ?? style.getOutlineX()) > 0 ||
                    (overrides.getOutlineY() ?? style.getOutlineY()) > 0;
                if (
                    pass == sabre.RenderPasses.OUTLINE ||
                    (pass != sabre.RenderPasses.BACKGROUND &&
                        (borderStyle != 1 || !outlineActive))
                )
                    this._setEdgeBlur(style, overrides, pass);
                else this._disableEdgeBlur();
            }
            //TODO: Strikeout/Strikethrough
            this._ctx.textAlign = "left";
            this._ctx.textBaseline = "middle";
            this._ctx.lineCap = "round";
            this._ctx.lineJoin = "round";
        },
        writable: false
    },

    "renderEvent": {
        /**
         * Render an event.
         * @param {SSASubtitleEvent} event
         * @param {number} pass
         */
        value: function (event, pass) {
            if (!this._initialized) this._init();

            let text = event.getText();
            let style = event.getStyle();
            let overrides = event.getOverrides();

            this._offsetX = this._offsetY = 0;

            this._handleStyling(style, overrides, pass);

            //calculate size of text without scaling.
            {
                let spacing = overrides.getSpacing() ?? style.getSpacing();
                let fontSize =
                    (overrides.getFontSize() ?? style.getFontSize()) +
                    overrides.getFontSizeMod();
                if (spacing == 0) {
                    this._width = this._ctx.measureText(text).width;
                } else {
                    this._width = 0;
                    for (let i = 0; i < text.length; i++)
                        this._width += this._ctx.measureText(text[i]).width;
                    this._width += spacing * (text.length - 1);
                }
                this._height = fontSize * this._pixelsPerDpt * lineSpacing;
            }

            //pad for box blur
            if ((overrides.getEdgeBlur() ?? 0) > 0) {
                let twoToEdgeBlur = global.Math.pow(2, overrides.getEdgeBlur());
                this._width += twoToEdgeBlur * 2;
                this._height += twoToEdgeBlur * 2;
                this._offsetX += twoToEdgeBlur;
            }

            //pad for outline
            if (pass == sabre.RenderPasses.OUTLINE) {
                let outlineX = overrides.getOutlineX() ?? style.getOutlineX();
                let outlineY = overrides.getOutlineY() ?? style.getOutlineY();
                this._width += outlineX * 2;
                this._height += outlineY * 2;
                this._offsetX += outlineX;
            }

            this._offsetY += this._height / 2;

            let offsetXUnscaled = this._offsetX;
            let offsetYUnscaled = this._offsetY;
            {
                let scaleX = overrides.getScaleX() ?? style.getScaleX();
                let scaleY = overrides.getScaleY() ?? style.getScaleY();
                this._offsetX *= scaleX;
                this._offsetY *= scaleY;
                this._width *= scaleX;
                this._height *= scaleY;
                this._canvas.width = this._width;
                this._canvas.height = this._height;
                this._handleStyling(style, overrides, pass); //To workaround a bug.
            }

            //reset the composite operation
            this._ctx.globalCompositeOperation = "source-over";
            //draw the text
            {
                let spacing = overrides.getSpacing() ?? style.getSpacing();
                if (pass == sabre.RenderPasses.OUTLINE) {
                    if (global.isNaN(spacing)) {
                        this._ctx.strokeText(
                            text,
                            offsetXUnscaled,
                            offsetYUnscaled
                        );
                        this._ctx.globalCompositeOperation = "destination-out";
                        this._ctx.filter = "none";
                        this._ctx.fillText(
                            text,
                            offsetXUnscaled,
                            offsetYUnscaled
                        );
                    } else {
                        let letter_offset = 0;
                        for (let i = 0; i < text.length; i++) {
                            this._ctx.strokeText(
                                text[i],
                                offsetXUnscaled + (spacing * i + letter_offset),
                                offsetYUnscaled
                            );
                            letter_offset += this._ctx.measureText(text[i])
                                .width;
                        }
                        this._ctx.globalCompositeOperation = "destination-out";
                        this._ctx.filter = "none";
                        letter_offset = 0;
                        for (let i = 0; i < text.length; i++) {
                            this._ctx.fillText(
                                text[i],
                                offsetXUnscaled + (spacing * i + letter_offset),
                                offsetYUnscaled
                            );
                            letter_offset += this._ctx.measureText(text[i])
                                .width;
                        }
                    }
                } else {
                    if (global.isNaN(spacing))
                        this._ctx.fillText(
                            text,
                            offsetXUnscaled,
                            offsetYUnscaled
                        );
                    else {
                        let letter_offset = 0;
                        for (let i = 0; i < text.length; i++) {
                            this._ctx.fillText(
                                text[i],
                                offsetXUnscaled + (spacing * i + letter_offset),
                                offsetYUnscaled
                            );
                            letter_offset += this._ctx.measureText(text[i])
                                .width;
                        }
                    }
                }
            }
        },
        writable: false
    },

    "setDPI": {
        /**
         * Sets the DPI for Rendering text
         * @param {number} dpi the DPI to use for rendering text.
         */
        value: function (dpi) {
            this._pixelsPerDpt = dpi * (72 / 96);
        },
        writable: false
    },

    "getOffset": {
        /**
         * Gets the offset of the resulting image.
         * @returns {Array<number>} offset of the resulting image
         */
        value: function () {
            return [-this._offsetX, -this._offsetY];
        },
        writable: false
    },

    "getDimensions": {
        /**
         * Gets the dimensions of the resulting image.
         * @returns {Array<number>} dimensions of the resulting image
         */
        value: function () {
            return [this._width, this._height];
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
