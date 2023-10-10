//@include [color]

sabre["SSAStyleDefinition"] = function SSAStyleDefinition () {
    let obj = {
        name: "Default",
        fontName: "Arial",
        fontSize: 18,
        primaryColor: new sabre.SSAColor(0x00ffffff),
        secondaryColor: new sabre.SSAColor(0x00ffff00),
        tertiaryColor: new sabre.SSAColor(0x00000000),
        quaternaryColor: new sabre.SSAColor(0x00000080),
        weight: 200,
        italic: false,
        underline: false,
        strikeout: false,
        scaleX: 1,
        scaleY: 1,
        spacing: 0,
        angle: 0,
        borderStyle: 1,
        outlineX: 2,
        outlineY: 2,
        shadow: 3,
        alignment: 2,
        margins: [20, 20, 20],
        encoding: 1
    };
    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
                return {
                    n: obj.name,
                    fn: obj.fontName,
                    fs: obj.fontSize,
                    pc: obj.primaryColor,
                    sc: obj.secondaryColor,
                    tc: obj.tertiaryColor,
                    qc: obj.quaternaryColor,
                    w: obj.weight,
                    i: obj.italic,
                    u: obj.underline,
                    st: obj.strikeout,
                    sx: obj.scaleX,
                    sy: obj.scaleY,
                    sp: obj.spacing,
                    an: obj.angle,
                    bs: obj.borderStyle,
                    ox: obj.outlineX,
                    oy: obj.outlineY,
                    sh: obj.shadow,
                    al: obj.alignment,
                    m: obj.margins,
                    en: obj.encoding
                };
            },
            writable: false
        },

        "setName": {
            value: function setName (/** string */ name) {
                obj.name = name;
            },
            writable: false
        },

        "getName": {
            value: function getName () {
                return obj.name;
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

        "setPrimaryColor": {
            value: function setPrimaryColor (/** SSAColor */ color) {
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
            value: function setSecondaryColor (/** SSAColor */ color) {
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
            value: function setTertiaryColor (/** SSAColor */ color) {
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
            value: function setQuaternaryColor (/** SSAColor */ color) {
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

        "setStrikeout": {
            value: function setStrikeout (/** boolean */ strikeout) {
                obj.strikeout = strikeout;
            },
            writable: false
        },

        "getStrikeout": {
            value: function getStrikeout () {
                return obj.strikeout;
            },
            writable: false
        },

        "setScale": {
            value: function setScale (/** number */ scale) {
                obj.scaleX = scale;
                obj.scaleY = scale;
            },
            writable: false
        },

        "setScaleX": {
            value: function setScaleX (/** number */ scale) {
                obj.scaleX = scale;
            },
            writable: false
        },

        "setScaleY": {
            value: function setScaleY (/** number */ scale) {
                obj.scaleY = scale;
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

        "setSpacing": {
            value: function setSpacing (/** number */ spacing) {
                obj.spacing = spacing;
            },
            writable: false
        },

        "getSpacing": {
            value: function getSpacing () {
                return obj.spacing;
            },
            writable: false
        },

        "setAngle": {
            value: function setAngle (/** number */ angle) {
                obj.angle = angle;
            },
            writable: false
        },

        "getAngle": {
            value: function getAngle () {
                return obj.angle;
            },
            writable: false
        },

        "setBorderStyle": {
            value: function setBorderStyle (/** number */ style) {
                obj.borderStyle = style;
            },
            writable: false
        },

        "getBorderStyle": {
            value: function getBorderStyle () {
                return obj.borderStyle;
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

        "setShadow": {
            value: function setShadow (/** number */ shadow) {
                obj.shadow = shadow;
            },
            writable: false
        },

        "getShadow": {
            value: function getShadow () {
                return obj.shadow;
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
        }
    });
};
