/**
 * Determines if we are doing a debug build.
 * @private
 * @define {boolean}
 *
 */
const ENABLE_DEBUG = true;
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
if (typeof require !== "function" || ENABLE_DEBUG) {
    sabre.import("color");
    sabre.import("style");
    sabre.import("style-override");
} else {
    require("./color.min.js");
    require("./style.min.js");
    require("./style-override.min.js");
}

sabre["SSASubtitleEvent"] = function () {
    let obj = {
        id: NaN,
        order: NaN,
        newLine: false,
        layer: 0,
        start: 0,
        end: 0,
        style: null,
        overrides: null,
        lineOverrides: null,
        lineTransitionTargetOverrides: [],
        text: null
    };
    return Object.create(Object, {
        "toJSON": {
            value: function () {
                return {
                    id: obj.id,
                    or: obj.order,
                    nl: obj.newLine,
                    l: obj.layer,
                    s: obj.start,
                    e: obj.end,
                    st: obj.style,
                    o: obj.overrides,
                    lO: obj.lineOverrides,
                    tO: obj.lineTransitionTargetOverrides,
                    t: obj.text
                };
            },
            writable: false
        },

        "setId": {
            value: function (/** number */ id) {
                obj.id = id;
            },
            writable: false
        },

        "getId": {
            value: function () {
                return obj.id;
            },
            writable: false
        },

        "setOrder": {
            value: function (/** number */ order) {
                obj.order = order;
            },
            writable: false
        },

        "getOrder": {
            value: function () {
                return obj.order;
            },
            writable: false
        },

        "setNewLine": {
            value: function (/** boolean */ newLine) {
                obj.newLine = newLine;
            },
            writable: false
        },

        "isNewLine": {
            value: function () {
                return obj.newLine;
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
        },

        "setLineTransitionTargetOverrides": {
            value: function (
                /** Array<SSALineTransitionTargetOverride> */ targets
            ) {
                obj.lineTransitionTargetOverrides = targets;
            },
            writable: false
        },

        "addLineTransitionTargetOverrides": {
            value: function (
                /** SSALineTransitionTargetOverride */ line_overrides
            ) {
                for (
                    let i = 0;
                    i <= obj.lineTransitionTargetOverrides.length;
                    i++
                ) {
                    if (i !== obj.lineTransitionTargetOverrides.length) {
                        if (
                            line_overrides.getTransitionStart() <
                            obj.lineTransitionTargetOverrides[
                                i
                            ].getTransitionStart()
                        ) {
                            obj.lineTransitionTargetOverrides.splice(
                                i,
                                0,
                                line_overrides
                            );
                            break;
                        }
                    } else {
                        obj.lineTransitionTargetOverrides.push(line_overrides);
                        break;
                    }
                }
            },
            writable: false
        },

        "getLineTransitionTargetOverrides": {
            value: function () {
                return obj.lineTransitionTargetOverrides.slice(0);
            },
            writable: false
        }
    });
};
