/*
 |   canvas-2d-shape-renderer.js
 |----------------
 |  canvas-2d-shape-renderer.js is copyright Patrick Rhodes Martin 2021.
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
//@include [lib/BSpline.js]
sabre.import("util.min.js");
sabre.import("global-constants.min.js");
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre.import("subtitle-event.min.js");
sabre.import("lib/BSpline.min.js");

/**
 * Expands bounds if a point is outside them.
 * @param {Array<number>} max max bounds
 * @param {Array<number>} min min bounds
 * @param {number} x new point x
 * @param {number} y new point y
 * @private
 */
const expandBounds = function (max, min, x, y) {
    if (x > max[0]) max[0] = x;
    else if (x < min[0]) min[0] = x;
    if (y > max[1]) max[1] = y;
    else if (y < min[1]) min[1] = y;
};

const shape_renderer_prototype = global.Object.create(Object, {
    _initialized: {
        /**
         * Is the shape renderer initialized.
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

    _canvas: {
        /**
         * The canvas for the shape renderer.
         * @type {?HTMLCanvasElement|?OffscreenCanvas}
         */
        value: null,
        writable: true
    },

    _ctx: {
        /**
         * The canvas context for the shape renderer.
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
            if (typeof global.OffscreenCanvas === "undefined") {
                this._canvas = global.document.createElement("canvas");
                this._canvas.height = this._canvas.width = 0;
            } else {
                this._canvas = new global.OffscreenCanvas(0, 0);
            }
            this._height = this._width = 0;
            this._ctx = this._canvas.getContext("2d", {
                "alpha": true,
                "desynchronized": true
            });
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
            let transitionOverrides = overrides.getTransition();
            let scaleX = overrides.getScaleX() ?? style.getScaleX();
            let scaleY = overrides.getScaleY() ?? style.getScaleY();
            if (transitionOverrides !== null) {
                scaleX = sabre.performTransition(
                    time,
                    scaleX,
                    transitionOverrides.getScaleX(),
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
                scaleY = sabre.performTransition(
                    time,
                    scaleY,
                    transitionOverrides.getScaleY(),
                    transitionOverrides.getTransitionStart(),
                    transitionOverrides.getTransitionEnd(),
                    transitionOverrides.getTransitionAcceleration()
                );
            }
            return { x: scaleX, y: scaleY };
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
                scale.x * overrides.getDrawingScale() * this._pixelsPerDpt,
                scale.y * overrides.getDrawingScale() * this._pixelsPerDpt
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

    _setOutline: {
        /**
         * Set outline width to the correct size.
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
            //TODO: Figgure out a good way to do dimension specific line widths.
            let outline = this._calcOutline(time, style, overrides);
            if (pass === sabre.RenderPasses.OUTLINE)
                this._ctx.lineWidth = Math.min(outline.x, outline.y) * 2;
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
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass
        ) {},
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
         */
        value: function (
            time,
            style,
            overrides,
            lineOverrides,
            lineTransitionTargetOverrides,
            pass
        ) {
            this._ctx.resetTransform();
            this._setScale(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass
            );
            this._setOutline(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass
            );
            this._setColors(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass
            );
        },
        writable: false
    },

    _calcSize: {
        value: function (cmds, xoffset, yoffset, outline) {
            //prep runtime stuff
            const parseFloat = global.parseFloat;
            const BSpline = sabre.BSpline;
            //end prep
            let uniquecommands = cmds.match(
                /[mnlbspc](?: \-?\d+(?:\.\d+)? \-?\d+(?:\.\d+)?)*/gi
            );
            if (uniquecommands === null) return;
            let min_coords = [
                Number.POSITIVE_INFINITY,
                Number.POSITIVE_INFINITY
            ];
            let max_coords = [
                Number.NEGATIVE_INFINITY,
                Number.NEGATIVE_INFINITY
            ];
            let spline_points = null;
            let x = NaN,
                y = NaN;
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
                        case "n":
                            x = parseFloat(localparam[0]);
                            y = parseFloat(localparam[1]);
                            break;
                        case "l":
                            expandBounds(max_coords, min_coords, x, y);
                            x = parseFloat(localparam[0]);
                            y = parseFloat(localparam[1]);
                            break;
                        case "b":
                            expandBounds(max_coords, min_coords, x, y);
                            x = parseFloat(localparam[0]);
                            y = parseFloat(localparam[1]);
                            expandBounds(max_coords, min_coords, x, y);
                            x = parseFloat(localparam[2]);
                            y = parseFloat(localparam[3]);
                            expandBounds(max_coords, min_coords, x, y);
                            x = parseFloat(localparam[4]);
                            y = parseFloat(localparam[5]);
                            break;
                        case "s":
                            {
                                expandBounds(max_coords, min_coords, x, y);
                                spline_points = spline_points || [];
                                spline_points[0] = [x, y];
                                let n = 1;
                                for (let k = 0; k < localparam.length; k += 2) {
                                    spline_points[n++] = [
                                        parseFloat(localparam[k]),
                                        parseFloat(localparam[k + 1])
                                    ];
                                }
                            }
                            break;
                        case "p":
                            spline_points = spline_points || [];
                            spline_points[spline_points.length] = [
                                parseFloat(localparam[0]),
                                parseFloat(localparam[1])
                            ];
                            break;
                        case "c":
                            {
                                let spline = new BSpline(
                                    spline_points,
                                    3,
                                    true
                                );
                                for (let t = 0; t < 1; t += 0.001) {
                                    let point = spline.calcAt(t);
                                    expandBounds(
                                        max_coords,
                                        min_coords,
                                        point[0],
                                        point[1]
                                    );
                                }
                                spline_points = null;
                            }
                            break;
                    }
                }
            }

            if (spline_points !== null) {
                let spline = new BSpline(spline_points, 3, true);
                for (let t = 0; t < 1; t += 0.001) {
                    let point = spline.calcAt(t);
                    expandBounds(max_coords, min_coords, point[0], point[1]);
                }
            } else {
                expandBounds(max_coords, min_coords, x, y);
            }
            this._offsetX = min_coords[0];
            this._offsetY = min_coords[1];
            this._width = max_coords[0] - min_coords[0];
            this._height = max_coords[1] - min_coords[1];
        },
        writable: false
    },

    _drawShape: {
        value: function (cmds, xoffset, yoffset, outline) {
            //prep runtime stuff
            const parseFloat = global.parseFloat;
            const BSpline = sabre.BSpline;
            //end prep
            let uniquecommands = cmds.match(
                /[mnlbspc](?: \-?\d+(?:\.\d+)? \-?\d+(?:\.\d+)?)*/gi
            );
            if (uniquecommands === null) return;
            let spline_points = null;
            let lastpos = [0, 0];
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
                            this._ctx.closePath();
                            if (outline) this._ctx.stroke();
                            else this._ctx.fill();

                            this._ctx.beginPath();
                        case "n":
                            lastpos[0] = parseFloat(localparam[0]);
                            lastpos[1] = parseFloat(localparam[1]);
                            this._ctx.moveTo(
                                xoffset + lastpos[0],
                                yoffset + lastpos[1]
                            );
                            break;
                        case "l":
                            lastpos[0] = parseFloat(localparam[0]);
                            lastpos[1] = parseFloat(localparam[1]);
                            this._ctx.lineTo(
                                xoffset + lastpos[0],
                                yoffset + lastpos[1]
                            );
                            break;
                        case "b":
                            lastpos[0] = parseFloat(localparam[4]);
                            lastpos[1] = parseFloat(localparam[5]);
                            this._ctx.bezierCurveTo(
                                xoffset + parseFloat(localparam[0]),
                                yoffset + parseFloat(localparam[1]),
                                xoffset + parseFloat(localparam[2]),
                                yoffset + parseFloat(localparam[3]),
                                xoffset + lastpos[0],
                                yoffset + lastpos[1]
                            );
                            break;
                        case "s":
                            {
                                spline_points = spline_points || [];
                                spline_points[0] = [lastpos[0], lastpos[1]];
                                let n = 1;
                                for (let k = 0; k < localparam.length; k += 2) {
                                    spline_points[n++] = [
                                        parseFloat(localparam[k]),
                                        parseFloat(localparam[k + 1])
                                    ];
                                }
                            }
                            break;
                        case "p":
                            spline_points = spline_points || [];
                            spline_points[spline_points.length] = [
                                parseFloat(localparam[0]),
                                parseFloat(localparam[1])
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
                                for (let t = 0; t < 1; t += 0.001) {
                                    point = spline.calcAt(t);
                                    this._ctx.lineTo(
                                        xoffset + point[0],
                                        yoffset + point[1]
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
                for (let t = 0; t < 1; t += 0.001) {
                    let point = spline.calcAt(t);
                    this._ctx.lineTo(xoffset + point[0], yoffset + point[1]);
                }
            }
            this._ctx.closePath();
            if (outline) this._ctx.stroke();
            else this._ctx.fill();
        },
        writable: false
    },

    "renderEvent": {
        /**
         * Render an event.
         * @param {number} time the time at which to render the subtitles.
         * @param {SSASubtitleEvent} event the subtitle event to render
         * @param {number} pass the pass we are on.
         * @param {boolean} dryRun is this a dry run for positioning.
         */
        value: function (time, event, pass, dryRun) {
            if (!this._initialized) this._init();

            let cmds = event.getText();
            let style = event.getStyle();
            let overrides = event.getOverrides();
            let lineOverrides = event.getLineOverrides();
            let lineTransitionTargetOverrides = event.getLineTransitionTargetOverrides();

            this._offsetX = this._offsetY = 0;

            this._handleStyling(
                time,
                style,
                overrides,
                lineOverrides,
                lineTransitionTargetOverrides,
                pass
            );

            //calculate size of drawing without scaling.
            this._calcSize(cmds);

            //pad for outline
            let outline_x = 0;
            let outline_y = 0;

            if (pass === sabre.RenderPasses.OUTLINE) {
                let outline = this._calcOutline(time, style, overrides);
                this._width += outline.x * 2;
                this._height += outline.x * 2;
                this._offsetX += outline.x;
                this._offsetY += outline.y;
                outline_x = outline.x;
                outline_y = outline.y;
            }

            let offsetXUnscaled = this._offsetX;
            let offsetYUnscaled = this._offsetY;
            {
                let scale = this._calcScale(time, style, overrides);
                this._offsetX *=
                    scale.x * overrides.getDrawingScale() * this._pixelsPerDpt;
                this._offsetY *=
                    scale.y * overrides.getDrawingScale() * this._pixelsPerDpt;
                this._width *=
                    scale.x * overrides.getDrawingScale() * this._pixelsPerDpt;
                this._height *=
                    scale.y * overrides.getDrawingScale() * this._pixelsPerDpt;
            }

            if (!dryRun) {
                this._canvas.width = this._width;
                this._canvas.height = this._height;
                this._handleStyling(
                    time,
                    style,
                    overrides,
                    lineOverrides,
                    lineTransitionTargetOverrides,
                    pass
                ); //To workaround a bug.

                //reset the composite operation
                this._ctx.globalCompositeOperation = "source-over";
                //draw the shape
                {
                    let spacing = overrides.getSpacing() ?? style.getSpacing();
                    if (pass === sabre.RenderPasses.OUTLINE) {
                        let outline_gt_zero = outline_x > 0 && outline_y > 0;
                        if (outline_x > outline_y) {
                            if (outline_gt_zero) {
                                for (
                                    let i = -outline_x / outline_y;
                                    i <= outline_x / outline_y;
                                    i += outline_y / outline_x
                                ) {
                                    this._drawShape(
                                        cmds,
                                        offsetXUnscaled + i,
                                        offsetYUnscaled,
                                        true
                                    );
                                }
                            } else {
                                for (let i = -outline_x; i <= outline_x; i++) {
                                    this._ctx.fillStyle = this._ctx.strokeStyle;
                                    this._drawShape(
                                        cmds,
                                        offsetXUnscaled + i,
                                        offsetYUnscaled,
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
                                    this._drawShape(
                                        cmds,
                                        offsetXUnscaled,
                                        offsetYUnscaled + i,
                                        true
                                    );
                                }
                            } else {
                                for (let i = -outline_y; i <= outline_y; i++) {
                                    this._ctx.fillStyle = this._ctx.strokeStyle;
                                    this._drawShape(
                                        cmds,
                                        offsetXUnscaled,
                                        offsetYUnscaled + i,
                                        false
                                    );
                                }
                            }
                        }
                        this._ctx.globalCompositeOperation = "destination-out";
                        this._drawShape(
                            cmds,
                            offsetXUnscaled,
                            offsetYUnscaled,
                            false
                        );
                    } else {
                        this._drawShape(
                            cmds,
                            offsetXUnscaled,
                            offsetYUnscaled,
                            false
                        );
                    }
                }
            }
        },
        writable: false
    },

    "setDPI": {
        /**
         * Sets the DPI for Rendering text
         * @param {number} dpi the DPI to use for rendering shapes.
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

sabre["Canvas2DShapeRenderer"] = function () {
    return Object.create(shape_renderer_prototype);
};
