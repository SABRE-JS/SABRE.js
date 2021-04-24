/*
 |   style-override.js
 |----------------
 |  style-override.js is copyright Patrick Rhodes Martin 2020,2021.
 |
 |-
 */
/**
 * @fileoverview This file defines the storage objects for style overrides.
 */
//@include [color.js]
const jsonNaNFix = function (a) {
    if (global.isNaN(a)) {
        return '"NaN"';
    }
    return a;
};

sabre["SSAStyleOverride"] = function () {
    const template = Object.freeze({
        alignment: null,
        baselineOffset: 0,
        blurIterations: 0,
        drawingMode: false,
        drawingScale: 1,
        encoding: null,
        fontName: null,
        fontSize: null,
        fontSizeMod: 0,
        gblurValue: 0,
        italic: null,
        karaokeMode: 0,
        karaokeStart: global.NaN,
        karaokeEnd: global.NaN,
        margins: [null, null, null],
        movement: null,
        outlineX: null,
        outlineY: null,
        position: null,
        primaryColor: null,
        secondaryColor: null,
        tertiaryColor: null,
        quaternaryColor: null,
        rotations: [],
        rotationOrigin: null,
        scaleX: null,
        scaleY: null,
        shadowX: null,
        shadowY: null,
        shearX: 0,
        shearY: 0,
        spacing: null,
        transition: null,
        underline: null,
        weight: null,
        wrapStyle: 0
    });
    let obj = Object.assign({}, template);
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return (
                    "{a:" +
                    obj.alignment +
                    ",bO:" +
                    obj.baselineOffset +
                    ",bI:" +
                    obj.blurIterations +
                    ",dM:" +
                    obj.drawingMode +
                    ",dS:" +
                    obj.drawingScale +
                    ",e:" +
                    obj.encoding +
                    ",fN:" +
                    JSON.stringify(obj.fontName) +
                    ",fS:" +
                    JSON.stringify(obj.fontSize) +
                    ",fSM:" +
                    obj.fontSizeMod +
                    ",gB:" +
                    obj.gblurValue +
                    ",i:" +
                    obj.italic +
                    ",kM:" +
                    obj.karaokeMode +
                    ",kS:" +
                    jsonNaNFix(obj.karaokeStart) +
                    ",kE:" +
                    jsonNaNFix(obj.karaokeEnd) +
                    ",m:" +
                    JSON.stringify(obj.margins) +
                    ",mo:" +
                    JSON.stringify(obj.movement) +
                    ",oX:" +
                    obj.outlineX +
                    ",oY:" +
                    obj.outlineY +
                    ",p:" +
                    JSON.stringify(obj.position) +
                    ",pC:" +
                    JSON.stringify(obj.primaryColor) +
                    ",sC:" +
                    JSON.stringify(obj.secondaryColor) +
                    ",tC:" +
                    JSON.stringify(obj.tertiaryColor) +
                    ",qC:" +
                    JSON.stringify(obj.quaternaryColor) +
                    ",r:" +
                    JSON.stringify(obj.rotations) +
                    ",rO:" +
                    JSON.stringify(obj.rotationOrigin) +
                    ",sX:" +
                    obj.scaleX +
                    ",sY:" +
                    obj.scaleY +
                    ",shX:" +
                    obj.shadowX +
                    ",shY:" +
                    obj.shadowY +
                    ",sheX:" +
                    obj.shearX +
                    ",sheY:" +
                    obj.shearY +
                    ",sp:" +
                    obj.spacing +
                    ",t:" +
                    (obj.transition !== null) +
                    ",u:" +
                    obj.underline +
                    ",w:" +
                    obj.weight +
                    ",wS:" +
                    obj.wrapStyle +
                    "}"
                );
            },
            writable: false
        },

        "setAlignment": {
            value: function (/** number */ alignment) {
                obj.alignment = alignment;
            },
            writable: false
        },

        "getAlignment": {
            value: function () {
                return obj.alignment;
            },
            writable: false
        },

        "setBaselineOffset": {
            value: function (/** number */ offset) {
                obj.baselineOffset = offset;
            },
            writable: false
        },

        "getBaselineOffset": {
            value: function () {
                return obj.baselineOffset;
            },
            writable: false
        },

        "setDrawingMode": {
            value: function (/** boolean */ enabled) {
                obj.drawingMode = enabled;
            },
            writable: false
        },

        "getDrawingMode": {
            value: function () {
                return obj.drawingMode;
            },
            writable: false
        },

        "setDrawingScale": {
            value: function (/** number */ scale) {
                obj.drawingScale = scale;
            },
            writable: false
        },

        "getDrawingScale": {
            value: function () {
                return obj.drawingScale;
            },
            writable: false
        },

        "setEncoding": {
            value: function (/** number */ encoding) {
                obj.encoding = encoding;
            },
            writable: false
        },

        "getEncoding": {
            value: function () {
                return obj.encoding;
            },
            writable: false
        },

        "setEdgeBlur": {
            value: function (/** number */ blurIterations) {
                obj.blurIterations = blurIterations;
            },
            writable: false
        },

        "getEdgeBlur": {
            value: function () {
                return obj.blurIterations;
            },
            writable: false
        },

        "setFontName": {
            value: function (/** string */ name) {
                obj.fontName = name;
            },
            writable: false
        },

        "getFontName": {
            value: function () {
                return obj.fontName;
            },
            writable: false
        },

        "setFontSize": {
            value: function (/** number */ size) {
                obj.fontSize = size;
            },
            writable: false
        },

        "getFontSize": {
            value: function () {
                return obj.fontSize;
            },
            writable: false
        },

        "setFontSizeMod": {
            value: function (/** number */ mod) {
                obj.fontSizeMod = mod;
            },
            writable: false
        },

        "increaseFontSizeMod": {
            value: function (/** number */ size) {
                obj.fontSizeMod += size;
            },
            writable: false
        },

        "decreaseFontSizeMod": {
            value: function (/** number */ size) {
                obj.fontSizeMod -= size;
                if (obj.fontSizeMod < 0) obj.fontSizeMod = 0;
            },
            writable: false
        },

        "resetFontSizeMod": {
            value: function () {
                obj.fontSizeMod = 0;
            },
            writable: false
        },

        "getFontSizeMod": {
            value: function () {
                return obj.fontSizeMod;
            },
            writable: false
        },

        "setGaussianEdgeBlur": {
            value: function (/** number */ blur_value) {
                obj.gblurValue = blur_value;
            },
            writable: false
        },

        "getGaussianEdgeBlur": {
            value: function () {
                return obj.gblurValue;
            },
            writable: false
        },

        "setItalic": {
            value: function (/** boolean */ italic) {
                obj.italic = italic;
            },
            writable: false
        },

        "getItalic": {
            value: function () {
                return obj.italic;
            },
            writable: false
        },

        "setKaraokeMode": {
            value: function (/** number */ mode) {
                obj.karaokeMode = mode;
            },
            writable: false
        },

        "getKaraokeMode": {
            value: function () {
                return obj.karaokeMode;
            },
            writable: false
        },

        "setKaraokeStart": {
            value: function (/** number */ start) {
                obj.karaokeStart = start;
            },
            writable: false
        },

        "getKaraokeStart": {
            value: function () {
                return obj.karaokeStart;
            },
            writable: false
        },

        "setKaraokeEnd": {
            value: function (/** number */ end) {
                obj.karaokeEnd = end;
            },
            writable: false
        },

        "getKaraokeEnd": {
            value: function () {
                return obj.karaokeEnd;
            },
            writable: false
        },

        "setMargins": {
            value: function (
                /** number */ left,
                /** number */ right,
                /** number */ vertical
            ) {
                obj.margins = [left, right, vertical];
            },
            writable: false
        },

        "setMarginLeft": {
            value: function (/** number */ left) {
                obj.margins[0] = left;
            },
            writable: false
        },

        "setMarginRight": {
            value: function (/** number */ right) {
                obj.margins[1] = right;
            },
            writable: false
        },

        "setMarginVertical": {
            value: function (/** number */ vertical) {
                obj.margins[2] = vertical;
            },
            writable: false
        },

        "getMargins": {
            value: function () {
                return obj.margins.slice(0);
            },
            writable: false
        },

        "setMovement": {
            value: function (
                /** number */ x1,
                /** number */ y1,
                /** number */ x2,
                /** number */ y2,
                /** number */ t1,
                /** number */ t2
            ) {
                obj.movement = [x1, y1, x2, y2, t1, t2];
            },
            writable: false
        },

        "getMovement": {
            value: function () {
                if (obj.movement != null) return obj.movement.slice(0);
                return null;
            },
            writable: false
        },

        "setOutline": {
            value: function (/** number */ outline) {
                obj.outlineX = outline;
                obj.outlineY = outline;
            },
            writable: false
        },

        "setOutlineX": {
            value: function (/** number */ outline) {
                obj.outlineX = outline;
            },
            writable: false
        },

        "setOutlineY": {
            value: function (/** number */ outline) {
                obj.outlineY = outline;
            },
            writable: false
        },

        "getOutlineX": {
            value: function () {
                return obj.outlineX;
            },
            writable: false
        },

        "getOutlineY": {
            value: function () {
                return obj.outlineY;
            },
            writable: false
        },

        "setPosition": {
            value: function (/** number */ x, /** number */ y) {
                obj.position = [x, y];
            },
            writable: false
        },

        "getPosition": {
            value: function () {
                if (obj.position != null) return obj.position.slice(0);
                return null;
            },
            writable: false
        },

        "setPrimaryColor": {
            value: function (/** SSAOverrideColor */ color) {
                obj.primaryColor = color;
            },
            writable: false
        },

        "getPrimaryColor": {
            value: function () {
                return obj.primaryColor;
            },
            writable: false
        },

        "setSecondaryColor": {
            value: function (/** SSAOverrideColor */ color) {
                obj.secondaryColor = color;
            },
            writable: false
        },

        "getSecondaryColor": {
            value: function () {
                return obj.secondaryColor;
            },
            writable: false
        },

        "setTertiaryColor": {
            value: function (/** SSAOverrideColor */ color) {
                obj.tertiaryColor = color;
            },
            writable: false
        },

        "getTertiaryColor": {
            value: function () {
                return obj.tertiaryColor;
            },
            writable: false
        },

        "setQuaternaryColor": {
            value: function (/** SSAOverrideColor */ color) {
                obj.quaternaryColor = color;
            },
            writable: false
        },

        "getQuaternaryColor": {
            value: function () {
                return obj.quaternaryColor;
            },
            writable: false
        },

        "addRotation": {
            value: function (
                /** number */ x,
                /** number */ y,
                /** number */ z
            ) {
                obj.rotations.push([x, y, z]);
            },
            writable: false
        },

        "getRotations": {
            value: function () {
                return obj.rotations.slice(0);
            },
            writable: false
        },

        "setRotationOrigin": {
            value: function (/** number */ x, /** number */ y) {
                obj.rotationOrigin = [x, y];
            },
            writable: false
        },

        "getRotationOrigin": {
            value: function () {
                return obj.rotationOrigin;
            },
            writable: false
        },

        "setScaleX": {
            value: function (/** number */ scaleX) {
                obj.scaleX = scaleX;
            },
            writable: false
        },

        "setScaleY": {
            value: function (/** number */ scaleY) {
                obj.scaleY = scaleY;
            },
            writable: false
        },

        "getScaleX": {
            value: function () {
                return obj.scaleX;
            },
            writable: false
        },

        "getScaleY": {
            value: function () {
                return obj.scaleY;
            },
            writable: false
        },

        "setShadowX": {
            value: function (/** number */ shadowX) {
                obj.shadowX = shadowX;
            },
            writable: false
        },

        "getShadowX": {
            value: function () {
                return obj.shadowX;
            },
            writable: false
        },

        "setShadowY": {
            value: function (/** number */ shadowY) {
                obj.shadowY = shadowY;
            },
            writable: false
        },

        "getShadowY": {
            value: function () {
                return obj.shadowY;
            },
            writable: false
        },

        "setShadow": {
            value: function (/** number */ shadow) {
                shadow = shadow / global.Math.sqrt(2);
                obj.shadowX = shadow;
                obj.shadowY = shadow;
            },
            writable: false
        },

        "setShearX": {
            value: function (/** number */ shearX) {
                obj.shearX = shearX;
            },
            writable: false
        },

        "setShearY": {
            value: function (/** number */ shearY) {
                obj.shearY = shearY;
            },
            writable: false
        },

        "getShearX": {
            value: function () {
                return obj.shearX;
            },
            writable: false
        },

        "getShearY": {
            value: function () {
                return obj.shearY;
            },
            writable: false
        },

        "setSpacing": {
            value: function (/** number */ spacing) {
                obj.spacing = spacing;
            },
            writable: true
        },

        "getSpacing": {
            value: function () {
                return obj.spacing;
            },
            writable: false
        },

        "setTransition": {
            value: function (/** Array<number|string> */ transition) {
                obj.transition = transition.slice(0);
            },
            writable: false
        },

        "getTransition": {
            value: function () {
                return obj.transition.slice(0);
            },
            writable: false
        },

        "setUnderline": {
            value: function (/** boolean */ underline) {
                obj.underline = underline;
            },
            writable: false
        },

        "getUnderline": {
            value: function () {
                return obj.underline;
            },
            writable: false
        },

        "setWeight": {
            value: function (/** number */ weight) {
                obj.weight = weight;
            },
            writable: false
        },

        "getWeight": {
            value: function () {
                return obj.weight;
            },
            writable: false
        },

        "setWrapStyle": {
            value: function (/** number */ wrapStyle) {
                obj.wrapStyle = wrapStyle;
            },
            writable: false
        },

        "getWrapStyle": {
            value: function () {
                return obj.wrapStyle;
            },
            writable: false
        },

        "reset": {
            value: function () {
                obj = Object.assign({}, template);
            },
            writable: false
        },

        "clone": {
            value: function () {
                let new_override = new sabre["SSAStyleOverride"]();
                new_override._cloneHelper(obj);
                return new_override;
            },
            writable: false
        },

        _cloneHelper: {
            value: function (other) {
                obj = Object.assign(obj, other);
            },
            writable: false
        }
    });
};
