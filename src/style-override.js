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

sabre["SSATransitionTargetOverride"] = function () {
    const template = Object.freeze({
        transitionStart: 0,
        transitionEnd: 0,
        transitionAcceleration: 1,
        blurIterations: null,
        fontSize: null,
        gblurValue: null,
        outlineX: null,
        outlineY: null,
        primaryColor: null,
        secondaryColor: null,
        tertiaryColor: null,
        quaternaryColor: null,
        rotation: [0, 0, 0],
        scaleX: null,
        scaleY: null,
        shadowX: null,
        shadowY: null,
        shearX: null,
        shearY: null,
        spacing: null
    });
    let obj = Object.assign({}, template);
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return {
                    tS: obj.transitionStart,
                    tE: obj.transitionEnd,
                    tA: obj.transitionAcceleration,
                    bI: obj.blurIterations,
                    fS: obj.fontSize,
                    gB: obj.gblurValue,
                    oX: obj.outlineX,
                    oY: obj.outlineY,
                    pC: obj.primaryColor,
                    sC: obj.secondaryColor,
                    tC: obj.tertiaryColor,
                    qC: obj.quaternaryColor,
                    r: obj.rotation,
                    sX: obj.scaleX,
                    sY: obj.scaleY,
                    shX: obj.shadowX,
                    shY: obj.shadowY,
                    sheX: obj.shearX,
                    sheY: obj.shearY,
                    sp: obj.spacing
                };
            },
            writable: false
        },

        "setTransitionStart": {
            value: function (/** number */ start) {
                obj.transitionStart = start;
            },
            writable: false
        },

        "getTransitionStart": {
            value: function () {
                return obj.transitionStart;
            },
            writable: false
        },

        "setTransitionEnd": {
            value: function (/** number */ end) {
                obj.transitionEnd = end;
            },
            writable: false
        },

        "getTransitionEnd": {
            value: function () {
                return obj.transitionEnd;
            },
            writable: false
        },

        "setTransitionAcceleration": {
            value: function (/** number */ accel) {
                obj.transitionAcceleration = accel;
            },
            writable: false
        },

        "getTransitionAcceleration": {
            value: function () {
                return obj.transitionAcceleration;
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

        "setRotation": {
            value: function (
                /** ?number */ x,
                /** ?number */ y,
                /** ?number */ z
            ) {
                obj.rotation = [
                    x === null ? obj.rotation[0] : x,
                    y === null ? obj.rotation[1] : y,
                    z === null ? obj.rotation[2] : z
                ];
            },
            writable: false
        },

        "getRotation": {
            value: function () {
                return obj.rotation.slice(0);
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
        }
    });
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
        rotation: [0, 0, 0],
        rotationOrigin: null,
        scaleX: null,
        scaleY: null,
        shadowX: null,
        shadowY: null,
        shearX: 0,
        shearY: 0,
        spacing: null,
        strikeout: null,
        transition: null,
        underline: null,
        weight: null,
        wrapStyle: 0
    });
    let obj = Object.assign({}, template);
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return {
                    a: obj.alignment,
                    bO: obj.baselineOffset,
                    bI: obj.blurIterations,
                    dM: obj.drawingMode,
                    dS: obj.drawingScale,
                    e: obj.encoding,
                    fN: obj.fontName,
                    fS: obj.fontSize,
                    fSM: obj.fontSizeMod,
                    gB: obj.gblurValue,
                    i: obj.italic,
                    kM: obj.karaokeMode,
                    kS: obj.karaokeStart,
                    kE: obj.karaokeEnd,
                    m: obj.margins,
                    oX: obj.outlineX,
                    oY: obj.outlineY,
                    pC: obj.primaryColor,
                    sC: obj.secondaryColor,
                    tC: obj.tertiaryColor,
                    qC: obj.quaternaryColor,
                    r: obj.rotation,
                    sX: obj.scaleX,
                    sY: obj.scaleY,
                    shX: obj.shadowX,
                    shY: obj.shadowY,
                    sheX: obj.shearX,
                    sheY: obj.shearY,
                    sp: obj.spacing,
                    st: obj.strikeout,
                    t: obj.transition,
                    u: obj.underline,
                    w: obj.weight,
                    wS: obj.wrapStyle
                };
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

        "setRotation": {
            value: function (
                /** ?number */ x,
                /** ?number */ y,
                /** ?number */ z
            ) {
                obj.rotation = [
                    x === null ? obj.rotation[0] : x,
                    y === null ? obj.rotation[1] : y,
                    z === null ? obj.rotation[2] : z
                ];
            },
            writable: false
        },

        "getRotation": {
            value: function () {
                return obj.rotation.slice(0);
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

        "setStrikeout": {
            value: function (/** boolean */ value) {
                obj.strikeout = value;
            },
            writable: false
        },

        "getStrikeout": {
            value: function () {
                return obj.strikeout;
            },
            writable: false
        },

        "setTransition": {
            value: function (/** Object */ transition) {
                obj.transition = transition;
            },
            writable: false
        },

        "getTransition": {
            value: function () {
                return obj.transition;
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

sabre["SSALineStyleOverride"] = function () {
    const template = Object.freeze({
        clip: null,
        clipInverted: false,
        movement: null,
        position: null,
        rotationOrigin: null,
        fade: null
    });
    let obj = Object.assign({}, template);
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return {
                    cl: obj.clip,
                    cli: obj.clipInverted,
                    mo: obj.movement,
                    p: obj.position,
                    rO: obj.rotationOrigin,
                    f: obj.fade
                };
            },
            writable: false
        },

        "setClip": {
            value: function (a, b, c, d) {
                if (typeof c === "undefined") {
                    obj.clip = [a, b];
                } else {
                    obj.clip = [a, b, c, d];
                }
            },
            writable: false
        },

        "getClip": {
            value: function () {
                if (obj.clip !== null) return obj.clip.slice(0);
                return null;
            },
            writable: false
        },

        "setClipInverted": {
            value: function (bool) {
                obj.clipInverted = bool;
            },
            writable: false
        },

        "getClipInverted": {
            value: function () {
                return obj.clipInverted;
            },
            writable: false
        },

        "setFade": {
            value: function (
                /** number */ a1,
                /** number */ a2,
                /** number */ a3,
                /** number */ t1,
                /** number */ t2,
                /** number */ t3,
                /** number */ t4
            ) {
                obj.fade = [a1, a2, a3, t1, t2, t3, t4];
            },
            writable: false
        },

        "getFade": {
            value: function () {
                if (obj.fade !== null) return obj.fade.slice(0);
                return null;
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
                if (obj.movement !== null) return obj.movement.slice(0);
                return null;
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
                if (obj.position !== null) return obj.position.slice(0);
                return null;
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
        }
    });
};

sabre["SSALineTransitionTargetOverride"] = function () {
    const template = Object.freeze({
        clip: null
    });
    let obj = Object.assign({}, template);
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return {
                    cl: obj.clip
                };
            },
            writable: false
        },

        "setClip": {
            value: function (a, b, c, d) {
                obj.clip = [a, b, c, d];
            },
            writable: false
        },

        "getClip": {
            value: function () {
                if (obj.clip !== null) return obj.clip.slice(0);
                return null;
            },
            writable: false
        }
    });
};
