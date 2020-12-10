sabre["SSAStyleOverride"] = function () {
    var obj = {
        alignment: null,
        blur_iterations: 0,
        gblur_value: 0,
        outlineX: null,
        outlineY: null,
        shearX: 0,
        shearY: 0,
        encoding: null,
        primaryColor: null,
        secondaryColor: null,
        tertiaryColor: null,
        quaternaryColor: null,
        fontName: null,
        fontSize: null,
        fontSizeMod: 0,
        rotations: []
    };
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return "";
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
            value: function (/** number */ blur_iterations) {
                obj.blur_iterations = blur_iterations;
            },
            writable: false
        },

        "getEdgeBlur": {
            value: function () {
                return obj.blur_iterations;
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
                obj.gblur_value = blur_value;
            },
            writable: false
        },

        "getGaussianEdgeBlur": {
            value: function () {
                return obj.gblur_value;
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

        clone: {
            value: function () {
                var new_override = new sabre["SSAStyleOverride"]();

                return new_override;
            },
            writable: false
        }
    });
};
