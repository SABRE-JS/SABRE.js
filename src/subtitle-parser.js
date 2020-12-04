/*
 |   subtitle-parser.js
 |----------------
 |  subtitle-parser.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */
//@include [util.js]
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
//@include [renderer-main.js]
sabre.import("util.min.js");
sabre.import("color.min.js");
sabre.import("style.min.js");
sabre.import("style-override.min.js");
sabre.import("subtitle-event.min.js");

/**
 * @fileoverview subtitle parser code for Substation Alpha and Advanced Substation Alpha.
 */
/**
 * Assert using grumbles.
 * @param {sabre.Complaint} complaint
 * @param {boolean} test
 */
const gassert = function (complaint, test) {
    if (!test) complaint.grumble();
    return test;
};
//ONE TIME WARN DECLARATIONS
const FOUND_DEPRICATED_COMMENT = new sabre.Complaint(
    "Found a comment in the old depricated style."
);
const INVALID_T_FUNCTION_TAG = new sabre.Complaint(
    "Encountered a parameterless \\t function tag, ignoring."
);

//Default style and dialogue formats
const default_ssa_style_format = [
    "Name",
    "Fontname",
    "Fontsize",
    "PrimaryColour",
    "SecondaryColour",
    "TertiaryColour",
    "BackColour",
    "Bold",
    "Italic",
    "BorderStyle",
    "Outline",
    "Shadow",
    "Alignment",
    "MarginL",
    "MarginR",
    "MarginV",
    "AlphaLevel",
    "Encoding"
];
const default_ass_style_format = [
    "Name",
    "Fontname",
    "Fontsize",
    "PrimaryColour",
    "SecondaryColour",
    "OutlineColour",
    "BackColour",
    "Bold",
    "Italic",
    "Underline",
    "StrikeOut",
    "ScaleX",
    "ScaleY",
    "Spacing",
    "Angle",
    "BorderStyle",
    "Outline",
    "Shadow",
    "Alignment",
    "MarginL",
    "MarginR",
    "MarginV",
    "Encoding"
];
const default_ssa_event_format = [
    "Marked",
    "Start",
    "End",
    "Style",
    "Name",
    "MarginL",
    "MarginR",
    "MarginV",
    "Effect",
    "Text"
];
const default_ass_event_format = [
    "Layer",
    "Start",
    "End",
    "Style",
    "Actor",
    "MarginL",
    "MarginR",
    "MarginV",
    "Effect",
    "Text"
];

const main_prototype = global.Object.create(global.Object, {
    _config: {
        value: null,
        writable: true
    },

    _loadFont: {
        value: null,
        writable: true
    },
    _renderer: {
        value: null,
        writable: true
    },

    _splitOnce: {
        value: function (string, separator) {
            var j = string.indexOf(separator);
            if (j == -1) return [string.trim()];
            return [string.slice(0, j), string.slice(j + 1).trim()];
        },
        writable: false
    },

    _cleanRawColor: {
        /**
         * Cleanup a raw color string.
         * @param {string} raw the raw string.
         * @returns {string} the cleaned string.
         */
        value: function (raw) {
            return raw.replace(
                /^[&H]*(?:0x)?((?:[0-9a-fA-F][0-9a-fA-F])+)[&H]*/,
                "$1"
            );
        },
        writable: false
    },

    _cloneEventWithoutText: {
        /**
         * Clone a SSASubtitleEvent, but leave the text uncloned.
         * @param {SSASubtitleEvent} event
         * @returns {SSASubtitleEvent} the clone.
         */
        value: function (event) {
            var new_event = new sabre.SSASubtitleEvent();
            new_event.setStart(event.getStart());
            new_event.setEnd(event.getEnd());
            new_event.setLayer(event.getLayer());
            new_event.setStyle(event.getStyle());
            new_event.setOverrides(event.getOverrides());
            return new_event;
        },
        writable: false
    },

    _parser: {
        /**
         * Contains parsing methods for root entries.
         * @dict
         * @type {Object<string,function(Array<string>,Object):void>}
         */
        value: Object.freeze({
            "Script Info": function (
                /** Array<string> */ keypair,
                /** Object */ config
            ) {
                switch (keypair[0]) {
                    case "Title":
                        config.info.title = keypair[1];
                        return;
                    case "Original Script":
                        config.info.author = keypair[1];
                        return;
                    case "Original Translation":
                        config.info.translator = keypair[1];
                        return;
                    case "Original Editing":
                        config.info.editor = keypair[1];
                        return;
                    case "Original Timing":
                        config.info.timing = keypair[1];
                        return;
                    case "Synch Point":
                        //TODO: figgure out the format for this timestamp.
                        return;
                    case "Script Updated By":
                        config.info.updater = keypair[1];
                        return;
                    case "Update Details":
                        config.info.update_description = keypair[1];
                        return;
                    case "ScriptType":
                        var version = keypair[1].match(
                            /v([0-9]+(?:\.[0-9]+)?)(\+)?/
                        );
                        if (version == null) throw "Malformed SSA version";
                        console.info(
                            "Sub Station Alpha Version: " + version[0]
                        );
                        config.info.version = parseFloat(version[1]);
                        if (config.info.version < 4) {
                            console.warn(
                                "Warning: Support for SSA versions prior to SSA v4 is not garunteed."
                            );
                        } else if (config.info.version > 4)
                            console.warn(
                                "Warning: Some subtitle features may not be supported"
                            );
                        config.info.is_ass = version[2] == "+";
                        console.info(
                            "Advanced Sub Station Alpha: " + config.info.is_ass
                        );
                        return;
                    case "Collisions":
                        var collisionMode = keypair[1].toLowerCase();
                        if (collisionMode == "normal") {
                            config.renderer.default_collision_mode = 0;
                            return;
                        }
                        if (collisionMode == "reverse") {
                            config.renderer.default_collision_mode = 1;
                            return;
                        }
                        console.warn(
                            "Warning: Unrecognized collision mode, defaulting to normal collisions."
                        );
                        config.renderer.default_collision_mode = 0;
                        return;
                    case "PlayResY":
                        config.renderer.resolution_y = parseInt(keypair[1], 10);
                        return;
                    case "PlayResX":
                        config.renderer.resolution_x = parseInt(keypair[1], 10);
                        return;
                    case "PlayDepth":
                        config.renderer.bit_depth = parseInt(keypair[1], 10);
                        return;
                    case "Timer":
                        config.renderer.playback_speed = parseFloat(keypair[1]);
                        return;
                    case "WrapStyle":
                        config.renderer.default_wrap_style = parseInt(
                            keypair[1],
                            10
                        );
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                keypair[0] +
                                '" for heading "Script Info"; Ignoring.'
                        );
                        return;
                }
            },
            "v4 Styles": function (keypair, config) {
                if (config.info.version < 4) {
                    console.warn(
                        'Warning: The "v4 Styles" heading is only available in SSA v4 and Higher and will be ignored as the script version is: ' +
                            (config.info.is_ass ? "ASS" : "SSA") +
                            " v" +
                            Math.floor(config.info.version)
                    );
                    return;
                }
                if (config.info.is_ass)
                    throw 'Depricated: The "v4 Styles" heading is unsupported in Advanced Substation Alpha Subtitles.';
                config.parser.style_format =
                    config.parser.style_format || default_ssa_style_format;
                var arr = keypair[1].split(",").map(function (a) {
                    return a.trim();
                });
                switch (keypair[0]) {
                    case "Format":
                        config.parser.style_format = arr;
                        return;
                    case "Style":
                        this._parseOldStyle(arr, config);
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                keypair[0] +
                                '" for heading "v4 Styles"; Ignoring.'
                        );
                        return;
                }
            },
            "v4+ Styles": function (keypair, config) {
                if (config.info.version < 4) {
                    console.warn(
                        'Warning: The "v4+ Styles" heading is only available in ASS v4 and Higher and will be ignored as the script version is: ' +
                            (config.info.is_ass ? "ASS" : "SSA") +
                            " v" +
                            Math.floor(config.info.version)
                    );
                    return;
                }
                if (!config.info.is_ass)
                    throw 'Error: The "v4+ Styles" heading is unsupported in Substation Alpha Subtitles.';
                config.parser.style_format =
                    config.parser.style_format || default_ass_style_format;
                var arr = keypair[1].split(",").map(function (a) {
                    return a.trim();
                });
                switch (keypair[0]) {
                    case "Format":
                        config.parser.style_format = arr;
                        return;
                    case "Style":
                        this._parseStyle(arr, config);
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                keypair[0] +
                                '" for heading "v4+ Styles"; Ignoring.'
                        );
                        return;
                }
            },
            "Events": function (keypair, config) {
                if (config.info.is_ass)
                    config.parser.event_format =
                        config.parser.event_format || default_ass_event_format;
                else
                    config.parser.event_format =
                        config.parser.event_format || default_ssa_event_format;
                var arr = keypair[1].split(",").map(function (a) {
                    return a.trim();
                });
                switch (keypair[0]) {
                    case "Format":
                        if (arr[arr.length - 1] !== "Text") {
                            throw "Invalid event tag format";
                        } else config.parser.event_format = arr;
                        return;
                    case "Dialogue":
                        this._parseDialogue(arr, config);
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                keypair[0] +
                                '" for heading "Events"; Ignoring.'
                        );
                    case "Comment":
                        return;
                }
            }
        }),
        writable: false
    },

    _parseOldStyle: {
        value: function (values, config) {
            var style = new sabre.SSAStyleDefinition();
            for (
                var i = 0;
                i < values.length && i < config.parser.style_format.length;
                i++
            ) {
                var key = config.parser.style_format.length[i];
                var value = values[i];
            }
        },
        writable: false
    },

    _parseStyle: {
        value: function (values, config) {
            var style = new sabre.SSAStyleDefinition();
            for (
                var i = 0;
                i < values.length && i < config.parser.style_format.length;
                i++
            ) {
                var key = config.parser.style_format.length[i];
                var value = values[i];
            }
        },
        writable: false
    },

    _parseDialogueText: {
        value: function (events) {
            var event;
            var match;
            if (this._config.info.is_ass) {
                for (var i = 0; i < events.length; i++) {
                    event = events[i];
                    match = /^([^{}]*?)\{(.*?)\}(.*)$/.exec(event.getText());
                    if (match !== null) {
                        var new_event = this._cloneEventWithoutText(event);
                        event.setText(match[1]);
                        new_event.setOverrides(
                            this._parseOverrides(
                                {
                                    start: event.getStart(),
                                    end: event.getEnd()
                                },
                                function (new_style) {
                                    new_event.setStyle(new_style);
                                },
                                event.getOverrides(),
                                match[2]
                            )
                        );
                        new_event.setText(match[3]);
                        events = events.splice(++i, 0, new_event);
                    }
                }
            }
            return events;
        },
        writable: false
    },

    _overrideTags: {
        /**
         * Contains parsing methods for override tags.
         * @struct
         */
        value: Object.freeze([
            {
                ignore_exterior: false,
                regular_expression: /^a/,
                /**
                 * Sets the alignment of the event using the old style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var depricated_align = parseInt(parameters[0], 10);
                    if (isNaN(depricated_align)) return;
                    if (depricated_align > 11) {
                        console.error("Invalid Alignment in legacy \\a tag.");
                        return;
                    }
                    var horizontal_align = depricated_align & 0x03;
                    var vertical_align = (depricated_align >>> 2) & 0x03;
                    var align = horizontal_align;
                    switch (vertical_align) {
                        case 1:
                            align += 3;
                        case 2:
                            align += 3;
                            overrides.setAlignment(align);
                            break;
                        case 0:
                            break;
                        default:
                            console.error(
                                "Invalid Alignment in legacy \\a tag."
                            );
                            break;
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^an/,
                /**
                 * Sets the alignment of the event using the new style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    if (
                        typeof parameters[0] == "undefined" ||
                        parameters[0] == ""
                    ) {
                        overrides.setAlignment(null);
                    } else {
                        var alignment_value = parseInt(parameters[0], 10);
                        if (isNaN(alignment_value)) return;
                        overrides.setAlignment(alignment_value);
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^([1-4])?a(?:lpha)?/,
                /**
                 * Sets the alpha component of the specified color.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var color_index = 1;
                    if (
                        typeof parameters[0] != "undefined" &&
                        parameters[0] != ""
                    )
                        color_index = parseInt(parameters[0], 10);
                    var a = null;
                    if (
                        typeof parameters[1] != "undefined" &&
                        parameters[1] != ""
                    ) {
                        a = parseInt(this._cleanRawColor(parameters[1]), 16);
                        if (isNaN(a)) return;
                        a = (a & 0xff) / 255;
                    }
                    var color;
                    switch (color_index) {
                        case 1:
                            color = overrides.getPrimaryColor();
                            if (color == null && a != null)
                                overrides.setPrimaryColor(
                                    new sabre.SSAOverrideColor(
                                        null,
                                        null,
                                        null,
                                        a
                                    )
                                );
                            else if (color != null) {
                                color.setA(a);
                            }
                            break;
                        case 2:
                            color = overrides.getSecondaryColor();
                            if (color == null && a != null)
                                overrides.setSecondaryColor(
                                    new sabre.SSAOverrideColor(
                                        null,
                                        null,
                                        null,
                                        a
                                    )
                                );
                            else if (color != null) {
                                color.setA(a);
                            }
                            break;
                        case 3:
                            color = overrides.getTertiaryColor();
                            if (color == null && a != null)
                                overrides.setTertiaryColor(
                                    new sabre.SSAOverrideColor(
                                        null,
                                        null,
                                        null,
                                        a
                                    )
                                );
                            else if (color != null) {
                                color.setA(a);
                            }
                            break;
                        case 4:
                            color = overrides.getQuaternaryColor();
                            if (color == null)
                                overrides.setQuaternaryColor(
                                    new sabre.SSAOverrideColor(
                                        null,
                                        null,
                                        null,
                                        a
                                    )
                                );
                            else if (color != null) {
                                color.setA(a);
                            }
                            break;
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^b/,
                /**
                 * Handles boldface for text.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var weight = parseInt(parameters[1], 10);
                    if (isNaN(weight)) return;
                    if (weight == 0) {
                        overrides.setBold(400);
                    } else if (weight == 1) {
                        overrides.setBold(700);
                    } else {
                        overrides.setBold(weight);
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^be/,
                /**
                 * Handles edge blur for text and shapes.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var blur_iterations = parseInt(parameters[0], 10);
                    if (isNaN(blur_iterations)) return;
                    overrides.setEdgeBlur(blur_iterations);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^blur/,
                /**
                 * Handles gaussian edge blur for text and shapes.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var blur_value = parseFloat(parameters[0]);
                    if (isNaN(blur_value)) return;
                    overrides.setGaussianEdgeBlur(blur_value);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^([xy])?bord/,
                /**
                 * Handles outline widths.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var outline_width = parseFloat(parameters[1]);
                    if (isNaN(outline_width)) return;
                    if (
                        typeof parameters[0] == "undefined" ||
                        parameters[0] == ""
                    ) {
                        // x and y outline width
                        overrides.setOutline(outline_width);
                    } else if (parameters[0] == "x") {
                        // x outline width
                        overrides.setOutlineX(outline_width);
                    } else {
                        // y outline width
                        overrides.setOutlineY(outline_width);
                    }
                }
            },
            {
                regular_expression: /^([1-4])?c/,
                /**
                 * Handles color settings.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var color_index = 1;
                    if (
                        typeof parameters[0] != "undefined" &&
                        parameters[0] != ""
                    )
                        color_index = parseInt(parameters[0], 10);
                    var color;
                    if (
                        typeof parameters[1] != "undefined" &&
                        parameters[1] != ""
                    ) {
                        var pcolor = parseInt(
                            this._cleanRawColor(parameters[1]),
                            16
                        );
                        if (isNaN(pcolor)) return;
                        var r = (pcolor & 0xff) / 255;
                        pcolor = pcolor >> 8;
                        var g = (pcolor & 0xff) / 255;
                        pcolor = pcolor >> 8;
                        var b = (pcolor & 0xff) / 255;
                        switch (color_index) {
                            case 1:
                                color = overrides.getPrimaryColor();
                                if (color == null)
                                    overrides.setPrimaryColor(
                                        new sabre.SSAOverrideColor(
                                            r,
                                            g,
                                            b,
                                            null
                                        )
                                    );
                                else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                            case 2:
                                color = overrides.getSecondaryColor();
                                if (color == null)
                                    overrides.setSecondaryColor(
                                        new sabre.SSAOverrideColor(
                                            r,
                                            g,
                                            b,
                                            null
                                        )
                                    );
                                else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                            case 3:
                                color = overrides.getTertiaryColor();
                                if (color == null)
                                    overrides.setTertiaryColor(
                                        new sabre.SSAOverrideColor(
                                            r,
                                            g,
                                            b,
                                            null
                                        )
                                    );
                                else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                            case 4:
                                color = overrides.getQuaternaryColor();
                                if (color == null)
                                    overrides.setQuaternaryColor(
                                        new sabre.SSAOverrideColor(
                                            r,
                                            g,
                                            b,
                                            null
                                        )
                                    );
                                else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                        }
                    } else {
                        switch (color_index) {
                            case 1:
                                color = overrides.getPrimaryColor();
                                if (color != null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                            case 2:
                                color = overrides.getSecondaryColor();
                                if (color != null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                            case 3:
                                color = overrides.getTertiaryColor();
                                if (color != null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                            case 4:
                                color = overrides.getQuaternaryColor();
                                if (color != null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                        }
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fa([xy])/,
                /**
                 * Handles shearing.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var factor = parseFloat(parameters[1]);
                    if (isNaN(factor)) return;
                    if (parameters[0] == "x") {
                        // x outline width
                        overrides.setShearX(factor);
                    } else {
                        // y outline width
                        overrides.setShearY(factor);
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fe/,
                /**
                 * Handles encoding.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var encoding = parseInt(parameters[0], 10);
                    overrides.setEncoding(encoding);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fn/,
                /**
                 * Handles switching fonts.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var fontName = parameters[0];
                    this._loadFont.call(null, fontName);
                    overrides.setFont(fontName);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fr([xyz])?/,
                /**
                 * Handles rotation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var rotation_axis = "z";
                    if (
                        typeof parameters[0] != "undefined" &&
                        parameters[0] != ""
                    )
                        rotation_axis = parameters[0];
                    var value = parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    switch (rotation_axis) {
                        case "x":
                            overrides.addRotation(value, 0, 0);
                            break;
                        case "y":
                            overrides.addRotation(0, value, 0);
                            break;
                        default:
                            overrides.addRotation(0, 0, value);
                            break;
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fs([+-])?/,
                /**
                 * Increases or decreases font size, or sets font size.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    if (
                        typeof parameters[0] != "undefined" &&
                        parameters[0] != ""
                    ) {
                        var add_to = parameters[0] == "+";
                        var font_size_modifier = parseFloat(parameters[1]);
                        if (add_to)
                            overrides.increaseFontSizeModifier(
                                font_size_modifier
                            );
                        else
                            overrides.decreaseFontSizeModifier(
                                font_size_modifier
                            );
                    } else {
                        var font_size = parseFloat(parameters[1]);
                        overrides.resetFontSizeModifier();
                        overrides.setFontSize(font_size);
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fsc([xy])/,
                /**
                 * Handles font scaling.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var is_x = parameters[0] == "x";
                    var value = parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    if (is_x) overrides.setScaleX(value);
                    else overrides.setScaleY(value);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^fsp/,
                /**
                 * Handles font spacing.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var value = parseFloat(parameters[0]);
                    if (isNaN(value)) return;
                    overrides.setSpacing(value);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^i/,
                /**
                 * Handles italicization.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var value = parameters[0] == "1";
                    if (parameters[0] != "0" && !value) return;
                    overrides.setItalic(value);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^([kK][fo]?)/,
                /**
                 * Handles karaoke.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var karaoke_tag = parameters[0];
                    var param = parseFloat(parameters[1]);
                    if (isNaN(param)) return;
                    var kstart = overrides.getKaraokeEnd();
                    var kend = kstart + param * 10;
                    var mode = 0;
                    switch (karaoke_tag) {
                        case "k":
                            mode = 1;
                            break;
                        case "K":
                        case "kf":
                            mode = 2;
                            break;
                        case "ko":
                            mode = 3;
                            break;
                        default:
                            break;
                    }
                    overrides.setKaraokeMode(mode);
                    overrides.setKaraokeStart(kstart);
                    overrides.setKaraokeEnd(kend);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^p/,
                /**
                 * Handles setting draw mode.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var drawScale = parseFloat(parameters[0]);
                    if (isNaN(drawScale)) return;
                    if (drawScale > 0) {
                        overrides.setDrawingMode(true);
                        overrides.setDrawingScale(drawScale);
                    } else {
                        overrides.setDrawingMode(false);
                    }
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^pbo/,
                /**
                 * Handles Baseline offset.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var baselineOffset = parseFloat(parameters[0]);
                    if (isNaN(baselineOffset)) return;
                    overrides.setBaselineOffset(baselineOffset);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^q/,
                /**
                 * Handles wrapping style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var wrapStyle = parseInt(parameters[0], 10);
                    if (isNaN(wrapStyle) || wrapStyle < 0 || wrapStyle > 3)
                        return;
                    overrides.setWrapStyle(wrapStyle);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^r/,
                /**
                 * Handles changing or resetting styling.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    overrides.reset();
                    var styleName = parameters[0];
                    if (typeof styleName != "undefined" && styleName != "")
                        setStyle(this._getStyle(styleName));
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^([xy])?shad/,
                /**
                 * Handles drop shadow.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var setting = parameters[0];
                    if (typeof setting == "undefined" || setting == "")
                        setting = null;
                    var value = parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    switch (setting) {
                        case "x":
                            overrides.setShadowX(value);
                            break;
                        case "y":
                            overrides.setShadowY(value);
                        default:
                        case null:
                            overrides.setShadow(value);
                    }
                }
            },
            {
                ignore_exterior: true,
                regular_expression: /^t/,
                /**
                 * Handles transitions.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                function(timeInfo, setStyle, overrides, parameters) {
                    var idx = parameters.length;
                    var lparameters = parameters;
                    if (idx > 4) {
                        var final_param = lparameters.slice(4).join(",");
                        lparameters = lparameters.slice(0, 4);
                        lparameters.push(final_param);
                        idx = 4;
                    }
                    gassert(INVALID_T_FUNCTION_TAG, idx > 0);
                    var transitionStart = 0;
                    var transitionEnd = timeInfo.end - timeInfo.start;
                    var acceleration = 1;

                    switch (idx) {
                        case 4:
                            acceleration = parseFloat(lparameters[3]);
                        case 3:
                            transitionStart = parseFloat(lparameters[1]);
                            transitionEnd = parseFloat(lparameters[2]);
                            break;
                        case 2:
                            acceleration = parseFloat(lparameters[1]);
                            break;
                        default:
                            break;
                    }

                    overrides.setTransition([
                        transitionStart,
                        transitionEnd,
                        acceleration
                    ]);
                }
            },
            {
                ignore_exterior: false,
                regular_expression: /^u/,
                /**
                 * Handles underline.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {Array<?string>} parameters
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    parameters
                ) {
                    var value = parameters[1] == "1";
                    if (
                        typeof parameters[0] == "undefined" ||
                        (parameters[0] != "0" && !value)
                    )
                        return;
                    overrides.setUnderline(value);
                }
            }
        ]),
        writable: false
    },

    _parseOverrides: {
        value: function (timeInfo, setStyle, old_overrides, tags) {
            const override_regex = /\\([^}{\\()]+)(?:\((.*?)\))?([^\\}{\\()]+)?/g;
            var overrides = old_overrides.clone();
            var pre_params = null;
            var params = null;
            var post_params = null;
            var code;
            while ((pre_params = override_regex.exec(tags)) !== null) {
                params = pre_params[2] || "";
                post_params = pre_params[3] || "";
                pre_params = pre_params[1];
                code = pre_params[0];
                var found = false;
                for (var i = this._overrideTags.length - 1; i >= 0; i--) {
                    var regex = this._overrideTags[i].regular_expression;
                    if (regex.test(pre_params)) {
                        found = true;
                        var match = regex.match(pre_params);
                        if (!this._overrideTags[i].ignore_exterior) {
                            pre_params = pre_params.slice(match[0].length);
                            if (pre_params != "")
                                pre_params = pre_params.split(",");
                            else pre_params = [];
                            if (post_params != "")
                                post_params = post_params.split(",");
                            else post_params = [];
                            if (params != "") params = params.split(",");
                            else params = [];
                            params = Array.prototype.slice
                                .call(match, 1)
                                .concat(params, pre_params, post_params);
                        } else {
                            if (params != "") params = params.split(",");
                            else params = [];
                        }
                        params = params.map((str) => str.trim());
                        var result = this._overrideTags.tag_handlers[i].call(
                            this,
                            timeInfo,
                            setStyle,
                            overrides,
                            params
                        );
                        if (typeof result !== "undefined") overrides = result;
                        break;
                    }
                }
                if (!found) console.error("Unrecognized Override Tag: " + code);
            }
            return overrides;
        },
        writable: false
    },

    _parseDialogue: {
        value: function (values, config) {
            var event = new sabre.SSASubtitleEvent();
            var style = this._getStyle("Default");
            event.setStyle(style);
            var event_overrides = new sabre.SSAStyleOverride();
            var tmp;
            for (var i = 0; i < values.length; i++) {
                var key = config.parser.event_format[i];
                var value = values[i];
                switch (key) {
                    case "Style":
                        style = this._getStyle(value);
                        event.setStyle(style);
                        break;
                    case "Layer":
                        event.setLayer(parseInt(value, 10));
                        break;
                    case "Start":
                        tmp = this._parseTime(value);
                        event.setStart(tmp);
                        event_overrides.setKaraokeStart(tmp);
                        event_overrides.setKaraokeEnd(tmp);
                        break;
                    case "End":
                        event.setEnd(this._parseTime(value));
                        break;
                    case "Text":
                        event.setText(value.replace(/\\h/g, "\u00A0"));
                        break;
                    case "Effect":
                        event_overrides.setEffect(value);
                        break;
                    case "MarginL":
                        event_overrides.setMarginLeft(parseInt(value, 10));
                        break;
                    case "MarginR":
                        event_overrides.setMarginRight(parseInt(value, 10));
                        break;
                    case "MarginV":
                        event_overrides.setMarginVertical(parseInt(value, 10));
                        break;
                    case "Name":
                    case "Actor":
                    case "Marked":
                    default:
                        break;
                }
            }
            event.setOverrides(event_overrides);
            var events = [event];
            events = this._parseDialogueText(events);
            config.renderer.events = config.renderer.events.concat(events);
        },
        writable: false
    },

    _parseFontName: {
        value: function (internalName) {
            var fontNameData = /^(.*)_(B?)(I?)([0-9]+)\.(ttf|otf|woff|woff2)$/.exec(
                internalName
            );
            if (fontNameData == null) {
                fontNameData = /^(.*)\.(ttf|otf|woff|woff2)$/.exec(
                    internalName
                );
                if (fontNameData == null)
                    return {
                        fontName: internalName,
                        isBold: false,
                        isItalic: false,
                        fontEncoding: 1,
                        fontFormat: "ttf"
                    };
                return {
                    fontName: fontNameData[1],
                    isBold: false,
                    isItalic: false,
                    fontEncoding: 1,
                    fontFormat: fontNameData[2]
                };
            }
            return {
                fontName: fontNameData[1],
                isBold: fontNameData[2] === "B",
                isItalic: fontNameData[3] === "I",
                fontEncoding: parseInt(fontNameData[4], 10),
                fontFormat: fontNameData[5]
            };
        },
        writable: false
    },

    _parse: {
        value: function (line) {
            if (line[0] == "[" && line[line.length - 1] == "]") {
                this._heading = line.slice(1, line.length - 1);
                return;
            }
            if (line[0] == ";") return; // this means it's a comment so we just ignore it.
            var keypair = this._splitOnce(line, ":");
            if (keypair.length > 1) {
                if (gassert(FOUND_DEPRICATED_COMMENT, keypair[0] !== "!"))
                    return; //depricated comment
                try {
                    if (typeof this._parser[this._heading] !== "undefined")
                        this._parser[this._heading].call(
                            this,
                            keypair,
                            this._config
                        );
                    else throw "Unknown Heading Error";
                } catch (e) {
                    throw "[" + this._heading + "] Error:" + e;
                }
            }
        },
        writable: false
    },

    init: {
        value: function (loadFont) {
            this._renderer = new sabre.Renderer();
            this._loadFont = loadFont;
            this._loadFont.call(null, "Open Sans");
        },
        writable: false
    },

    updateViewport: {
        value: function (width, height) {
            this._renderer.updateViewport(width, height);
        },
        writable: false
    },

    frame: {
        value: function (time) {
            this._renderer.frame(time);
            return this._renderer.getDisplayUri();
        },
        writable: false
    },

    load: {
        value: function (subs_text) {
            this._config = { info: {}, parser: {}, renderer: {} };
            if (subs_text.indexOf("\xEF\xBB\xBF") === 0) {
                subs_text = subs_text.replace("\xEF\xBB\xBF", ""); //ignore BOM
            }
            var subs = subs_text.split(/(?:\r?\n)|(?:\n\r?)/);
            console.info("Parsing Sub Station Alpha subtitle file...");
            if (subs[0].trim() != "[Script Info]") {
                throw "Invalid Sub Station Alpha script";
            }
            for (var i = 0; i < subs.length; i++) {
                this._parse(subs[i]);
            }
            this._renderer.load(this._config);
        },
        writable: false
    }
});

external["SABRERenderer"] = function (loadFont) {
    var renderer = global.Object.create(main_prototype);
    renderer.init(loadFont);
    return Object.freeze({
        "loadSubtitles": function (ass) {
            renderer.load(ass);
        },
        "setViewport": function (width, height) {
            renderer.updateViewport(width, height);
        },
        "getFrame": function (time) {
            return renderer.frame(time);
        }
    });
};
