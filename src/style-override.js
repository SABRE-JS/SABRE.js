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
//@include [color]

sabre["SSATransitionTargetOverride"] = function SSATransitionTargetOverride () {
    let obj = {
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
    };
    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
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
            value: function setTransitionStart (/** number */ start) {
                obj.transitionStart = start;
            },
            writable: false
        },

        "getTransitionStart": {
            value: function getTransitionStart () {
                return obj.transitionStart;
            },
            writable: false
        },

        "setTransitionEnd": {
            value: function setTransitionEnd (/** number */ end) {
                obj.transitionEnd = end;
            },
            writable: false
        },

        "getTransitionEnd": {
            value: function getTransitionEnd () {
                return obj.transitionEnd;
            },
            writable: false
        },

        "setTransitionAcceleration": {
            value: function setTransitionAcceleration (/** number */ accel) {
                obj.transitionAcceleration = accel;
            },
            writable: false
        },

        "getTransitionAcceleration": {
            value: function getTransitionAcceleration () {
                return obj.transitionAcceleration;
            },
            writable: false
        },

        "setEdgeBlur": {
            value: function setEdgeBlur (/** number */ blurIterations) {
                obj.blurIterations = blurIterations;
            },
            writable: false
        },

        "getEdgeBlur": {
            value: function getEdgeBlur () {
                return obj.blurIterations;
            },
            writable: false
        },

        "setFontSize": {
            value: function setFontSize (/** number */ size) {
                obj.fontSize = size;
            },
            writable: false
        },

        "getFontSize": {
            value: function getFontSize () {
                return obj.fontSize;
            },
            writable: false
        },

        "setGaussianEdgeBlur": {
            value: function setGaussianEdgeBlur (/** number */ blur_value) {
                obj.gblurValue = blur_value;
            },
            writable: false
        },

        "getGaussianEdgeBlur": {
            value: function getGaussianEdgeBlur () {
                return obj.gblurValue;
            },
            writable: false
        },

        "setOutline": {
            value: function setOutline (/** number */ outline) {
                obj.outlineX = outline;
                obj.outlineY = outline;
            },
            writable: false
        },

        "setOutlineX": {
            value: function setOutlineX (/** number */ outline) {
                obj.outlineX = outline;
            },
            writable: false
        },

        "setOutlineY": {
            value: function setOutlineY (/** number */ outline) {
                obj.outlineY = outline;
            },
            writable: false
        },

        "getOutlineX": {
            value: function getOutlineX () {
                return obj.outlineX;
            },
            writable: false
        },

        "getOutlineY": {
            value: function getOutlineY () {
                return obj.outlineY;
            },
            writable: false
        },

        "setPrimaryColor": {
            value: function setPrimaryColor (/** SSAOverrideColor */ color) {
                obj.primaryColor = color;
            },
            writable: false
        },

        "getPrimaryColor": {
            value: function getPrimaryColor () {
                return obj.primaryColor;
            },
            writable: false
        },

        "setSecondaryColor": {
            value: function setSecondaryColor (/** SSAOverrideColor */ color) {
                obj.secondaryColor = color;
            },
            writable: false
        },

        "getSecondaryColor": {
            value: function getSecondaryColor () {
                return obj.secondaryColor;
            },
            writable: false
        },

        "setTertiaryColor": {
            value: function setTertiaryColor (/** SSAOverrideColor */ color) {
                obj.tertiaryColor = color;
            },
            writable: false
        },

        "getTertiaryColor": {
            value: function getTertiaryColor () {
                return obj.tertiaryColor;
            },
            writable: false
        },

        "setQuaternaryColor": {
            value: function setQuaternaryColor (/** SSAOverrideColor */ color) {
                obj.quaternaryColor = color;
            },
            writable: false
        },

        "getQuaternaryColor": {
            value: function getQuaternaryColor () {
                return obj.quaternaryColor;
            },
            writable: false
        },

        "setRotation": {
            value: function setRotation (
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
            value: function getRotation () {
                return obj.rotation.slice(0);
            },
            writable: false
        },

        "setScaleX": {
            value: function setScaleX (/** number */ scaleX) {
                obj.scaleX = scaleX;
            },
            writable: false
        },

        "setScaleY": {
            value: function setScaleY (/** number */ scaleY) {
                obj.scaleY = scaleY;
            },
            writable: false
        },

        "getScaleX": {
            value: function getScaleX () {
                return obj.scaleX;
            },
            writable: false
        },

        "getScaleY": {
            value: function getScaleY () {
                return obj.scaleY;
            },
            writable: false
        },

        "setShadowX": {
            value: function setShadowX (/** number */ shadowX) {
                obj.shadowX = shadowX;
            },
            writable: false
        },

        "getShadowX": {
            value: function getShadowX () {
                return obj.shadowX;
            },
            writable: false
        },

        "setShadowY": {
            value: function setShadowY (/** number */ shadowY) {
                obj.shadowY = shadowY;
            },
            writable: false
        },

        "getShadowY": {
            value: function getShadowY () {
                return obj.shadowY;
            },
            writable: false
        },

        "setShadow": {
            value: function setShadow (/** number */ shadow) {
                shadow = shadow / global.Math.sqrt(2);
                obj.shadowX = shadow;
                obj.shadowY = shadow;
            },
            writable: false
        },

        "setShearX": {
            value: function setShearX (/** number */ shearX) {
                obj.shearX = shearX;
            },
            writable: false
        },

        "setShearY": {
            value: function setShearY (/** number */ shearY) {
                obj.shearY = shearY;
            },
            writable: false
        },

        "getShearX": {
            value: function getShearX () {
                return obj.shearX;
            },
            writable: false
        },

        "getShearY": {
            value: function getShearY () {
                return obj.shearY;
            },
            writable: false
        },

        "setSpacing": {
            value: function setSpacing (/** number */ spacing) {
                obj.spacing = spacing;
            },
            writable: true
        },

        "getSpacing": {
            value: function getSpacing () {
                return obj.spacing;
            },
            writable: false
        }
    });
};

sabre["SSAStyleOverride"] = function SSAStyleOverride () {
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
        outlineX: null,
        outlineY: null,
        position: null,
        primaryColor: null,
        secondaryColor: null,
        tertiaryColor: null,
        quaternaryColor: null,
        rotation: [0, 0, 0],
        scaleX: null,
        scaleY: null,
        shadowX: null,
        shadowY: null,
        shearX: 0,
        shearY: 0,
        spacing: null,
        strikeout: null,
        transitions: [],
        underline: null,
        weight: null,
        wrapStyle: 0
    });
    let obj = {
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
        outlineX: null,
        outlineY: null,
        position: null,
        primaryColor: null,
        secondaryColor: null,
        tertiaryColor: null,
        quaternaryColor: null,
        rotation: [0, 0, 0],
        scaleX: null,
        scaleY: null,
        shadowX: null,
        shadowY: null,
        shearX: 0,
        shearY: 0,
        spacing: null,
        strikeout: null,
        transitions: [],
        underline: null,
        weight: null,
        wrapStyle: 0
    };
    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
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
                    t: obj.transitions,
                    u: obj.underline,
                    w: obj.weight,
                    wS: obj.wrapStyle
                };
            },
            writable: false
        },

        "setAlignment": {
            value: function setAlignment (/** number */ alignment) {
                obj.alignment = alignment;
            },
            writable: false
        },

        "getAlignment": {
            value: function getAlignment () {
                return obj.alignment;
            },
            writable: false
        },

        "setBaselineOffset": {
            value: function setBaselineOffset (/** number */ offset) {
                obj.baselineOffset = offset;
            },
            writable: false
        },

        "getBaselineOffset": {
            value: function getBaselineOffset () {
                return obj.baselineOffset;
            },
            writable: false
        },

        "setDrawingMode": {
            value: function setDrawingMode (/** boolean */ enabled) {
                obj.drawingMode = enabled;
            },
            writable: false
        },

        "getDrawingMode": {
            value: function getDrawingMode () {
                return obj.drawingMode;
            },
            writable: false
        },

        "setDrawingScale": {
            value: function setDrawingScale (/** number */ scale) {
                obj.drawingScale = scale;
            },
            writable: false
        },

        "getDrawingScale": {
            value: function getDrawingScale () {
                return obj.drawingScale;
            },
            writable: false
        },

        "setEncoding": {
            value: function setEncoding (/** number */ encoding) {
                obj.encoding = encoding;
            },
            writable: false
        },

        "getEncoding": {
            value: function getEncoding () {
                return obj.encoding;
            },
            writable: false
        },

        "setEdgeBlur": {
            value: function setEdgeBlur (/** number */ blurIterations) {
                obj.blurIterations = blurIterations;
            },
            writable: false
        },

        "getEdgeBlur": {
            value: function getEdgeBlur () {
                return obj.blurIterations;
            },
            writable: false
        },

        "setFontName": {
            value: function setFontName (/** string */ name) {
                obj.fontName = name;
            },
            writable: false
        },

        "getFontName": {
            value: function getFontName () {
                return obj.fontName;
            },
            writable: false
        },

        "setFontSize": {
            value: function setFontSize (/** number */ size) {
                obj.fontSize = size;
            },
            writable: false
        },

        "getFontSize": {
            value: function getFontSize () {
                return obj.fontSize;
            },
            writable: false
        },

        "setFontSizeMod": {
            value: function setFontSizeMod (/** number */ mod) {
                obj.fontSizeMod = mod;
            },
            writable: false
        },

        "increaseFontSizeMod": {
            value: function increaseFontSizeMod (/** number */ size) {
                obj.fontSizeMod += size;
            },
            writable: false
        },

        "decreaseFontSizeMod": {
            value: function decreaseFontSizeMod (/** number */ size) {
                obj.fontSizeMod -= size;
            },
            writable: false
        },

        "resetFontSizeMod": {
            value: function resetFontSizeMod () {
                obj.fontSizeMod = 0;
            },
            writable: false
        },

        "getFontSizeMod": {
            value: function getFontSizeMod () {
                return obj.fontSizeMod;
            },
            writable: false
        },

        "setGaussianEdgeBlur": {
            value: function setGaussianEdgeBlur (/** number */ blur_value) {
                obj.gblurValue = blur_value;
            },
            writable: false
        },

        "getGaussianEdgeBlur": {
            value: function getGaussianEdgeBlur () {
                return obj.gblurValue;
            },
            writable: false
        },

        "setItalic": {
            value: function setItalic (/** boolean */ italic) {
                obj.italic = italic;
            },
            writable: false
        },

        "getItalic": {
            value: function getItalic () {
                return obj.italic;
            },
            writable: false
        },

        "setKaraokeMode": {
            value: function setKaraokeMode (/** number */ mode) {
                obj.karaokeMode = mode;
            },
            writable: false
        },

        "getKaraokeMode": {
            value: function getKaraokeMode () {
                return obj.karaokeMode;
            },
            writable: false
        },

        "setKaraokeStart": {
            value: function setKaraokeStart (/** number */ start) {
                obj.karaokeStart = start;
            },
            writable: false
        },

        "getKaraokeStart": {
            value: function getKaraokeStart () {
                return obj.karaokeStart;
            },
            writable: false
        },

        "setKaraokeEnd": {
            value: function setKaraokeEnd (/** number */ end) {
                obj.karaokeEnd = end;
            },
            writable: false
        },

        "getKaraokeEnd": {
            value: function getKaraokeEnd () {
                return obj.karaokeEnd;
            },
            writable: false
        },

        "setMargins": {
            value: function setMargins (
                /** number */ left,
                /** number */ right,
                /** number */ vertical
            ) {
                obj.margins = [left, right, vertical];
            },
            writable: false
        },

        "setMarginLeft": {
            value: function setMarginLeft (/** number */ left) {
                obj.margins[0] = left;
            },
            writable: false
        },

        "setMarginRight": {
            value: function setMarginRight (/** number */ right) {
                obj.margins[1] = right;
            },
            writable: false
        },

        "setMarginVertical": {
            value: function setMarginVertical (/** number */ vertical) {
                obj.margins[2] = vertical;
            },
            writable: false
        },

        "getMargins": {
            value: function getMargins () {
                return obj.margins.slice(0);
            },
            writable: false
        },

        "setOutline": {
            value: function setOutline (/** number */ outline) {
                obj.outlineX = outline;
                obj.outlineY = outline;
            },
            writable: false
        },

        "setOutlineX": {
            value: function setOutlineX (/** number */ outline) {
                obj.outlineX = outline;
            },
            writable: false
        },

        "setOutlineY": {
            value: function setOutlineY (/** number */ outline) {
                obj.outlineY = outline;
            },
            writable: false
        },

        "getOutlineX": {
            value: function getOutlineX () {
                return obj.outlineX;
            },
            writable: false
        },

        "getOutlineY": {
            value: function getOutlineY () {
                return obj.outlineY;
            },
            writable: false
        },

        "setPrimaryColor": {
            value: function setPrimaryColor (/** SSAOverrideColor */ color) {
                obj.primaryColor = color;
            },
            writable: false
        },

        "getPrimaryColor": {
            value: function getPrimaryColor () {
                return obj.primaryColor;
            },
            writable: false
        },

        "setSecondaryColor": {
            value: function setSecondaryColor (/** SSAOverrideColor */ color) {
                obj.secondaryColor = color;
            },
            writable: false
        },

        "getSecondaryColor": {
            value: function getSecondaryColor () {
                return obj.secondaryColor;
            },
            writable: false
        },

        "setTertiaryColor": {
            value: function setTertiaryColor (/** SSAOverrideColor */ color) {
                obj.tertiaryColor = color;
            },
            writable: false
        },

        "getTertiaryColor": {
            value: function getTertiaryColor () {
                return obj.tertiaryColor;
            },
            writable: false
        },

        "setQuaternaryColor": {
            value: function setQuaternaryColor (/** SSAOverrideColor */ color) {
                obj.quaternaryColor = color;
            },
            writable: false
        },

        "getQuaternaryColor": {
            value: function getQuaternaryColor () {
                return obj.quaternaryColor;
            },
            writable: false
        },

        "setRotation": {
            value: function setRotation (
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
            value: function getRotation () {
                return obj.rotation.slice(0);
            },
            writable: false
        },

        "setScaleX": {
            value: function setScaleX (/** number */ scaleX) {
                obj.scaleX = scaleX;
            },
            writable: false
        },

        "setScaleY": {
            value: function setScaleY (/** number */ scaleY) {
                obj.scaleY = scaleY;
            },
            writable: false
        },

        "getScaleX": {
            value: function getScaleX () {
                return obj.scaleX;
            },
            writable: false
        },

        "getScaleY": {
            value: function getScaleY () {
                return obj.scaleY;
            },
            writable: false
        },

        "setShadowX": {
            value: function setShadowX (/** number */ shadowX) {
                obj.shadowX = shadowX;
            },
            writable: false
        },

        "getShadowX": {
            value: function getShadowX () {
                return obj.shadowX;
            },
            writable: false
        },

        "setShadowY": {
            value: function setShadowY (/** number */ shadowY) {
                obj.shadowY = shadowY;
            },
            writable: false
        },

        "getShadowY": {
            value: function getShadowY () {
                return obj.shadowY;
            },
            writable: false
        },

        "setShadow": {
            value: function setShadow (/** number */ shadow) {
                shadow = shadow / global.Math.sqrt(2);
                obj.shadowX = shadow;
                obj.shadowY = shadow;
            },
            writable: false
        },

        "setShearX": {
            value: function setShearX (/** number */ shearX) {
                obj.shearX = shearX;
            },
            writable: false
        },

        "setShearY": {
            value: function setShearY (/** number */ shearY) {
                obj.shearY = shearY;
            },
            writable: false
        },

        "getShearX": {
            value: function getShearX () {
                return obj.shearX;
            },
            writable: false
        },

        "getShearY": {
            value: function getShearY () {
                return obj.shearY;
            },
            writable: false
        },

        "setSpacing": {
            value: function setSpacing (/** number */ spacing) {
                obj.spacing = spacing;
            },
            writable: true
        },

        "getSpacing": {
            value: function getSpacing () {
                return obj.spacing;
            },
            writable: false
        },

        "setStrikeout": {
            value: function setStrikeout (/** boolean */ value) {
                obj.strikeout = value;
            },
            writable: false
        },

        "getStrikeout": {
            value: function getStrikeout () {
                return obj.strikeout;
            },
            writable: false
        },

        "addTransition": {
            value: function addTransition (/** Object */ transition) {
                for (let i = 0; i <= obj.transitions.length; i++) {
                    if (i !== obj.transitions.length) {
                        if (
                            transition["getTransitionStart"]() <
                            obj.transitions[i]["getTransitionStart"]()
                        ) {
                            obj.transitions.splice(i, 0, transition);
                            break;
                        }
                    } else {
                        obj.transitions.push(transition);
                        break;
                    }
                }
            },
            writable: false
        },

        "getTransitions": {
            value: function getTransitions () {
                return obj.transitions.slice(0);
            },
            writable: false
        },

        "setUnderline": {
            value: function setUnderline (/** boolean */ underline) {
                obj.underline = underline;
            },
            writable: false
        },

        "getUnderline": {
            value: function getUnderline () {
                return obj.underline;
            },
            writable: false
        },

        "setWeight": {
            value: function setWeight (/** number */ weight) {
                obj.weight = weight;
            },
            writable: false
        },

        "getWeight": {
            value: function getWeight () {
                return obj.weight;
            },
            writable: false
        },

        "setWrapStyle": {
            value: function setWrapStyle (/** number */ wrapStyle) {
                obj.wrapStyle = wrapStyle;
            },
            writable: false
        },

        "getWrapStyle": {
            value: function getWrapStyle () {
                return obj.wrapStyle;
            },
            writable: false
        },

        "reset": {
            value: function reset () {
                obj = Object.assign({}, template);
                obj.margins = template.margins.slice(0);
                obj.rotation = template.rotation.slice(0);
                obj.transitions = [];
            },
            writable: false
        },

        "clone": {
            value: function clone () {
                let new_override = new sabre["SSAStyleOverride"]();
                new_override._cloneHelper(obj);
                return new_override;
            },
            writable: false
        },

        _cloneHelper: {
            value: function _cloneHelper (other) {
                obj = Object.assign(obj, other);
                obj.margins = other.margins.slice(0);
                obj.rotation = other.rotation.slice(0);
                obj.transitions = other.transitions.slice(0);
            },
            writable: false
        }
    });
};

sabre["SSALineStyleOverride"] = function SSALineStyleOverride () {
    let obj = {
        clip: null,
        clipInverted: false,
        movement: null,
        position: null,
        rotationOrigin: null,
        fade: null
    };
    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
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
            value: function setClip (a, b, c, d) {
                if (typeof c === "undefined") {
                    obj.clip = [a, b];
                } else {
                    obj.clip = [a, b, c, d];
                }
            },
            writable: false
        },

        "getClip": {
            value: function getClip () {
                if (obj.clip !== null) return obj.clip.slice(0);
                return null;
            },
            writable: false
        },

        "setClipInverted": {
            value: function setClipInverted (bool) {
                obj.clipInverted = bool;
            },
            writable: false
        },

        "getClipInverted": {
            value: function getClipInverted () {
                return obj.clipInverted;
            },
            writable: false
        },

        "setFade": {
            value: function setFade (
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
            value: function getFade () {
                if (obj.fade !== null) return obj.fade.slice(0);
                return null;
            },
            writable: false
        },

        "setMovement": {
            value: function setMovement (
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

        "hasMovement": {
            value: function hasMovement () {
                return obj.movement !== null;
            },
            writable:false
        },

        "getMovement": {
            value: function getMovement () {
                if (obj.movement !== null) return obj.movement.slice(0);
                return null;
            },
            writable: false
        },

        "setPosition": {
            value: function setPosition (/** number */ x, /** number */ y) {
                obj.position = [x, y];
            },
            writable: false
        },

        "hasPosition": {
            value: function hasPosition () {
                return obj.position !== null;
            },
            writable: false
        },

        "getPosition": {
            value: function getPosition () {
                if (obj.position !== null) return obj.position.slice(0);
                return null;
            },
            writable: false
        },

        "setRotationOrigin": {
            value: function setRotationOrigin (/** number */ x, /** number */ y) {
                obj.rotationOrigin = [x, y];
            },
            writable: false
        },

        "getRotationOrigin": {
            value: function getRotationOrigin () {
                return obj.rotationOrigin;
            },
            writable: false
        }
    });
};

sabre["SSALineTransitionTargetOverride"] = function SSALineTransitionTargetOverride () {
    let obj = {
        transitionStart: 0,
        transitionEnd: 0,
        transitionAcceleration: 1,
        clip: null
    };
    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
                return {
                    tS: obj.transitionStart,
                    tE: obj.transitionEnd,
                    tA: obj.transitionAcceleration,
                    cl: obj.clip
                };
            },
            writable: false
        },

        "setTransitionStart": {
            value: function setTransitionStart (/** number */ start) {
                obj.transitionStart = start;
            },
            writable: false
        },

        "getTransitionStart": {
            value: function getTransitionStart () {
                return obj.transitionStart;
            },
            writable: false
        },

        "setTransitionEnd": {
            value: function setTransitionEnd (/** number */ end) {
                obj.transitionEnd = end;
            },
            writable: false
        },

        "getTransitionEnd": {
            value: function getTransitionEnd () {
                return obj.transitionEnd;
            },
            writable: false
        },

        "setTransitionAcceleration": {
            value: function setTransitionAcceleration (/** number */ accel) {
                obj.transitionAcceleration = accel;
            },
            writable: false
        },

        "getTransitionAcceleration": {
            value: function getTransitionAcceleration () {
                return obj.transitionAcceleration;
            },
            writable: false
        },

        "setClip": {
            value: function setClip (a, b, c, d) {
                obj.clip = [a, b, c, d];
            },
            writable: false
        },

        "getClip": {
            value: function getClip () {
                if (obj.clip !== null) return obj.clip.slice(0);
                return null;
            },
            writable: false
        }
    });
};
