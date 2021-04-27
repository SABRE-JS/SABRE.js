//@include [color.js]
//@include [style.js]
//@include [style-override.js]
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre["SSASubtitleEvent"] = function () {
    let obj = {
        layer: 0,
        start: 0,
        end: 0,
        style: null,
        overrides: null,
        lineOverrides: null,
        text: null
    };
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return (
                    "{l:" +
                    obj.layer +
                    ",s:" +
                    obj.start +
                    ",e:" +
                    obj.end +
                    ",st:" +
                    JSON.stringify(obj.style) +
                    ",o:" +
                    JSON.stringify(obj.overrides) +
                    ",lO:" +
                    JSON.stringify(obj.lineOverrides) +
                    ",t:" +
                    JSON.stringify(obj.text) +
                    "}"
                );
            },
            writable: false
        },

        "setStart": {
            value: function (/** number */ start) {
                obj.start = start;
            },
            writable: false
        },

        "getStart": {
            value: function () {
                return obj.start;
            },
            writable: false
        },

        "setEnd": {
            value: function (/** number */ end) {
                obj.end = end;
            },
            writable: false
        },

        "getEnd": {
            value: function () {
                return obj.end;
            },
            writable: false
        },

        "setText": {
            value: function (/** string */ text) {
                obj.text = text;
            },
            writable: false
        },
        "getText": {
            value: function () {
                return obj.text;
            },
            writable: false
        },

        "setLayer": {
            value: function (/** number */ layer) {
                obj.layer = layer;
            },
            writable: false
        },

        "getLayer": {
            value: function () {
                return obj.layer;
            },
            writable: false
        },

        "setStyle": {
            value: function (/** SSAStyleDefinition */ style) {
                obj.style = style;
            },
            writable: false
        },

        "getStyle": {
            value: function () {
                return obj.style;
            },
            writable: false
        },

        "setOverrides": {
            value: function (/** SSAStyleOverride */ overrides) {
                obj.overrides = overrides;
            },
            writable: false
        },

        "getOverrides": {
            value: function () {
                return obj.overrides;
            },
            writable: false
        },

        "setLineOverrides": {
            value: function (/** SSALineStyleOverride */ line_overrides) {
                obj.lineOverrides = line_overrides;
            },
            writable: false
        },

        "getLineOverrides": {
            value: function () {
                return obj.lineOverrides;
            },
            writable: false
        }
    });
};
