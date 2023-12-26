//@include [color]
//@include [style]
//@include [style-override]

sabre["SSASubtitleEvent"] = function SSASubtitleEvent () {
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
            value: function toJSON () {
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
            value: function setId (/** number */ id) {
                obj.id = id;
            },
            writable: false
        },

        "getId": {
            value: function getId () {
                return obj.id;
            },
            writable: false
        },

        "setOrder": {
            value: function setOrder (/** number */ order) {
                obj.order = order;
            },
            writable: false
        },

        "getOrder": {
            value: function getOrder () {
                return obj.order;
            },
            writable: false
        },

        "setNewLine": {
            value: function setNewLine (/** boolean */ newLine) {
                obj.newLine = newLine;
            },
            writable: false
        },

        "isNewLine": {
            value: function isNewLine () {
                return obj.newLine;
            },
            writable: false
        },

        "setStart": {
            value: function setStart (/** number */ start) {
                obj.start = start;
            },
            writable: false
        },

        "getStart": {
            value: function getStart () {
                return obj.start;
            },
            writable: false
        },

        "setEnd": {
            value: function setEnd (/** number */ end) {
                obj.end = end;
            },
            writable: false
        },

        "getEnd": {
            value: function getEnd () {
                return obj.end;
            },
            writable: false
        },

        "setText": {
            value: function setText (/** string */ text) {
                obj.text = text;
            },
            writable: false
        },
        "getText": {
            value: function getText () {
                return obj.text;
            },
            writable: false
        },

        "setLayer": {
            value: function setLayer (/** number */ layer) {
                obj.layer = layer;
            },
            writable: false
        },

        "getLayer": {
            value: function getLayer () {
                return obj.layer;
            },
            writable: false
        },

        "setStyle": {
            value: function setStyle (/** SSAStyleDefinition */ style) {
                obj.style = style;
            },
            writable: false
        },

        "getStyle": {
            value: function getStyle () {
                return obj.style;
            },
            writable: false
        },

        "setOverrides": {
            value: function setOverrides (/** SSAStyleOverride */ overrides) {
                obj.overrides = overrides;
            },
            writable: false
        },

        "getOverrides": {
            value: function getOverrides () {
                return obj.overrides;
            },
            writable: false
        },

        "setLineOverrides": {
            value: function setLineOverrides (/** SSALineStyleOverride */ line_overrides) {
                obj.lineOverrides = line_overrides;
            },
            writable: false
        },

        "getLineOverrides": {
            value: function getLineOverrides () {
                return obj.lineOverrides;
            },
            writable: false
        },

        "setLineTransitionTargetOverrides": {
            value: function setLineTransitionTargetOverrides (
                /** Array<SSALineTransitionTargetOverride> */ targets
            ) {
                obj.lineTransitionTargetOverrides = targets;
            },
            writable: false
        },

        "addLineTransitionTargetOverrides": {
            value: function addLineTransitionTargetOverrides (
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
            value: function getLineTransitionTargetOverrides () {
                return obj.lineTransitionTargetOverrides;
            },
            writable: false
        }
    });
};
