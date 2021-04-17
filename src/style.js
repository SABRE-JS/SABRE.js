//@include [color.js]
sabre.import("color.min.js");

sabre["SSAStyleDefinition"] = function () {
    let obj = {
        name: "Default",
        fontName: "Arial",
        fontSize: 18,
        primaryColor: new sabre.SSAColor(0x00ffffff),
        secondaryColor: new sabre.SSAColor(0x00ffff00),
        tertiaryColor: new sabre.SSAColor(0x00000000),
        quaternaryColor: new sabre.SSAColor(0x00000080),
        weight: 200,
        scaleX: 1,
        scaleY: 1,
        /**
         *  This is an optimization
         *  we make to avoid having to
         *  manually space each character
         *  for default spacing.
         */
        spacing: global.NaN,
        borderStyle: 1,
        outline: 2,
        shadow: 3,
        alignment: 2,
        margins: [20, 20, 20],
        encoding: 1
    };
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return (
                    "{n:" +
                    JSON.stringify(obj.name) +
                    ",fn:" +
                    JSON.stringify(obj.fontName) +
                    ",fs:" +
                    obj.fontSize +
                    ",pc:" +
                    JSON.stringify(obj.primaryColor) +
                    ",sc:" +
                    JSON.stringify(obj.secondaryColor) +
                    ",tc:" +
                    JSON.stringify(obj.tertiaryColor) +
                    ",qc:" +
                    JSON.stringify(obj.quaternaryColor) +
                    ",w:" +
                    obj.weight +
                    ",i:" +
                    obj.italic +
                    ",u:" +
                    obj.underline +
                    ",st:" +
                    obj.strikeout +
                    ",sx:" +
                    obj.scaleX +
                    ",sy:" +
                    obj.scaleY +
                    ",sp:" +
                    (global.isNaN(obj.spacing) ? 0 : obj.spacing) +
                    ",an:" +
                    obj.angle +
                    ",bs:" +
                    obj.borderStyle +
                    ",ox:" +
                    obj.outlineX +
                    ",oy:" +
                    obj.outlineY +
                    ",sh:" +
                    obj.shadow +
                    ",al:" +
                    obj.alignment +
                    ",m:" +
                    JSON.stringify(obj.margins) +
                    ",en:" +
                    obj.encoding +
                    "}"
                );
            },
            writable: false
        },

        "setName": {
            value: function (/** string */ name) {
                obj.name = name;
            },
            writable: false
        },

        "getName": {
            value: function () {
                return obj.name;
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

        "setPrimaryColor": {
            value: function (/** SSAColor */ color) {
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
            value: function (/** SSAColor */ color) {
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
            value: function (/** SSAColor */ color) {
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
            value: function (/** SSAColor */ color) {
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

        "setStrikeout": {
            value: function (/** boolean */ strikeout) {
                obj.strikeout = strikeout;
            },
            writable: false
        },

        "getStrikeout": {
            value: function () {
                return obj.strikeout;
            },
            writable: false
        },

        "setScale": {
            value: function (/** number */ scale) {
                obj.scaleX = scale;
                obj.scaleY = scale;
            },
            writable: false
        },

        "setScaleX": {
            value: function (/** number */ scale) {
                obj.scaleX = scale;
            },
            writable: false
        },

        "setScaleY": {
            value: function (/** number */ scale) {
                obj.scaleY = scale;
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
                return obj.scaleX;
            },
            writable: false
        },

        "setSpacing": {
            value: function (/** number */ spacing) {
                obj.spacing = spacing;
            },
            writable: false
        },

        "getSpacing": {
            value: function () {
                return obj.spacing;
            },
            writable: false
        },

        "setAngle": {
            value: function (/** number */ angle) {
                obj.angle = angle;
            },
            writable: false
        },

        "getAngle": {
            value: function () {
                return obj.angle;
            },
            writable: false
        },

        "setBorderStyle": {
            value: function (/** number */ style) {
                obj.borderStyle = style;
            },
            writable: false
        },

        "getBorderStyle": {
            value: function () {
                return obj.borderStyle;
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

        "setShadow": {
            value: function (/** number */ shadow) {
                obj.shadow = shadow;
            },
            writable: false
        },

        "getShadow": {
            value: function () {
                return obj.shadow;
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
        }
    });
};
