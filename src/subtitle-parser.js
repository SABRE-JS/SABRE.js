/*
 |   subtitle-parser.js
 |----------------
 |  subtitle-parser.js is copyright Patrick Rhodes Martin 2020,2021.
 |
 |-
 */
//@include [util.js]
//@include [global-constants.js]
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
//@include [renderer-main.js]
sabre.import("util");
sabre.import("global-constants");
sabre.import("color");
sabre.import("style");
sabre.import("style-override");
sabre.import("subtitle-event");
sabre.import("renderer-main");

/**
 * @fileoverview subtitle parser code for Substation Alpha and Advanced Substation Alpha.
 */

/**
 * @private
 * @typedef {!{info:Object,parser:Object,renderer:{events:Array<SSASubtitleEvent>}}}
 */
var RendererData;

/**
 * Assert using grumbles.
 * @param {sabre.Complaint} complaint
 * @param {boolean} test
 * @private
 */
const gassert = function (complaint, test) {
    if (!test) complaint.grumble();
    return test;
};
//ONE TIME WARN DECLARATIONS
const FOUND_DEPRICATED_COMMENT = new sabre.Complaint(
    "Encountered a comment in the old depricated style."
);
const INVALID_T_FUNCTION_TAG = new sabre.Complaint(
    "Encountered a parameterless or tagless \\t function tag, ignoring."
);
const MOVE_ENDS_BEFORE_IT_STARTS = new sabre.Complaint(
    "Encountered a move tag where the animation ends before it starts, ignoring."
);
const UNKNOWN_HEADING = new sabre.Complaint(
    "Encounterd a heading which is non-standard, ignoring."
);
const WRONG_CASE_IN_HEADING = new sabre.Complaint(
    "Encountered a heading which does not have its case consistent with the standard."
);
const INVALID_WRAP_STYLE = new sabre.Complaint(
    "Default Wrap style was invalid. Defaulting to SMART (mode 0)."
);

//Default style and dialogue formats
const default_ssa_style_format = global.Object.freeze([
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
]);
const default_ass_style_format = global.Object.freeze([
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
]);
const default_ssa_event_format = global.Object.freeze([
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
]);
const default_ass_event_format = global.Object.freeze([
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
]);

const parser_prototype = global.Object.create(global.Object, {
    _config: {
        /**
         * Config for the renderer.
         * @type {?RendererData}
         * @private
         */
        value: null,
        writable: true
    },

    _loadFont: {
        /**
         * Function to load fonts.
         * @private
         */
        value: null,
        writable: true
    },

    _styles: {
        /**
         * Map of styles.
         * @private
         */
        value: null,
        writable: true
    },

    _lineCounter: {
        /**
         * Counter for generating lineIds.
         * @private
         */
        value: 0,
        writable: true
    },

    _splitOnce: {
        /**
         * Splits a string once.
         * @param {string} string the string to split.
         * @param {string} separator the separator to split on.
         * @private
         */
        value: function (string, separator) {
            let j = string.indexOf(separator);
            if (j === -1) return [string.trim()];
            return [string.slice(0, j), string.slice(j + 1).trim()];
        },
        writable: false
    },

    _cleanRawColor: {
        /**
         * Cleanup a raw color string.
         * @param {string} raw the raw string.
         * @returns {string} the cleaned string.
         * @private
         */
        value: function (raw) {
            return raw.replace(
                /^[&H]*(?:0x)?((?:[0-9a-fA-F][0-9a-fA-F])+)[&H]*/,
                "$1"
            );
        },
        writable: false
    },

    _parser: {
        /**
         * Contains parsing methods for root entries.
         * @private
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
                        config["info"]["title"] = keypair[1];
                        return;
                    case "Original Script":
                        config["info"]["author"] = keypair[1];
                        return;
                    case "Original Translation":
                        config["info"]["translator"] = keypair[1];
                        return;
                    case "Original Editing":
                        config["info"]["editor"] = keypair[1];
                        return;
                    case "Original Timing":
                        config["info"]["timing"] = keypair[1];
                        return;
                    case "Synch Point":
                        config["renderer"]["sync_offset"] = this._parseTime(
                            keypair[1]
                        );
                        return;
                    case "Script Updated By":
                        config["info"]["updater"] = keypair[1];
                        return;
                    case "Update Details":
                        config["info"]["update_description"] = keypair[1];
                        return;
                    case "ScriptType": {
                        let version = keypair[1].match(
                            /v([0-9]+(?:\.[0-9]+)?)(\+)?/
                        );
                        if (version === null) throw "Malformed SSA version";
                        console.info(
                            "Sub Station Alpha Version: " + version[0]
                        );
                        config["info"]["version"] = parseFloat(version[1]);
                        if (config["info"]["version"] < 4) {
                            console.warn(
                                "Warning: Support for SSA versions prior to SSA v4 is not garunteed."
                            );
                        } else if (config["info"]["version"] > 4)
                            console.warn(
                                "Warning: Some subtitle features may not be supported"
                            );
                        config["info"]["is_ass"] = version[2] === "+";
                        console.info(
                            "Advanced Sub Station Alpha: " +
                                config["info"]["is_ass"]
                        );
                        return;
                    }
                    case "Collisions": {
                        let collisionMode = keypair[1].toLowerCase();
                        if (collisionMode === "normal") {
                            config["renderer"]["default_collision_mode"] =
                                sabre.CollisionModes.NORMAL;
                            return;
                        }
                        if (collisionMode === "reverse") {
                            config["renderer"]["default_collision_mode"] =
                                sabre.CollisionModes.REVERSE;
                            return;
                        }
                        console.warn(
                            "Warning: Unrecognized collision mode, defaulting to normal collisions."
                        );
                        config["renderer"]["default_collision_mode"] =
                            sabre.CollisionModes.NORMAL;
                        return;
                    }
                    case "PlayResY":
                        config["renderer"]["resolution_y"] = global.parseInt(
                            keypair[1],
                            10
                        );
                        return;
                    case "PlayResX":
                        config["renderer"]["resolution_x"] = global.parseInt(
                            keypair[1],
                            10
                        );
                        return;
                    case "PlayDepth":
                        config["renderer"]["bit_depth"] = global.parseInt(
                            keypair[1],
                            10
                        );
                        return;
                    case "Timer":
                        config["renderer"]["playback_speed"] = parseFloat(
                            keypair[1]
                        );
                        return;
                    case "WrapStyle":
                        {
                            let wrap_style = global.parseInt(keypair[1], 10);
                            if (
                                !gassert(
                                    INVALID_WRAP_STYLE,
                                    wrap_style >= sabre.WrapStyleModes.SMART &&
                                        wrap_style <=
                                            sabre.WrapStyleModes.SMART_INVERSE
                                )
                            ) {
                                wrap_style = sabre.WrapStyleModes.SMART;
                            }
                            config["renderer"]["default_wrap_style"] =
                                wrap_style;
                        }
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
            "v4 Styles": function (
                /** Array<string> */ keypair,
                /** Object */ config
            ) {
                if (config["info"]["version"] < 4) {
                    console.warn(
                        'Warning: The "v4 Styles" heading is only available in SSA v4 and Higher and will be ignored as the script version is: ' +
                            (config["info"]["is_ass"] ? "ASS" : "SSA") +
                            " v" +
                            Math.floor(config["info"]["version"])
                    );
                    return;
                }
                if (config["info"]["is_ass"])
                    throw 'Depricated: The "v4 Styles" heading is unsupported in Advanced Substation Alpha Subtitles.';
                config["parser"]["style_format"] =
                    config["parser"]["style_format"] ||
                    default_ssa_style_format;
                let arr = keypair[1].split(",").map(function (a) {
                    return a.trim();
                });
                switch (keypair[0]) {
                    case "Format":
                        config["parser"]["style_format"] = arr;
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
            "v4+ Styles": function (
                /** Array<string> */ keypair,
                /** Object */ config
            ) {
                if (config["info"]["version"] < 4) {
                    console.warn(
                        'Warning: The "v4+ Styles" heading is only available in ASS v4 and Higher and will be ignored as the script version is: ' +
                            (config["info"]["is_ass"] ? "ASS" : "SSA") +
                            " v" +
                            Math.floor(config["info"]["version"])
                    );
                    return;
                }
                if (!config["info"]["is_ass"])
                    throw 'Error: The "v4+ Styles" heading is unsupported in Substation Alpha Subtitles.';
                config["parser"]["style_format"] =
                    config["parser"]["style_format"] ||
                    default_ass_style_format;
                let arr = keypair[1].split(",").map(function (a) {
                    return a.trim();
                });
                switch (keypair[0]) {
                    case "Format":
                        config["parser"]["style_format"] = arr;
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
            "Events": function (
                /** Array<string> */ keypair,
                /** Object */ config
            ) {
                if (config["info"]["is_ass"])
                    config["parser"]["event_format"] =
                        config["parser"]["event_format"] ||
                        default_ass_event_format;
                else
                    config["parser"]["event_format"] =
                        config["parser"]["event_format"] ||
                        default_ssa_event_format;
                let arr = keypair[1].split(",");
                let str = "";
                if (arr.length > config["parser"]["event_format"].length) {
                    str = arr.pop() + str;
                    while (
                        arr.length > config["parser"]["event_format"].length
                    ) {
                        str = arr.pop() + "," + str;
                    }
                    arr[arr.length - 1] = arr[arr.length - 1] + "," + str;
                }
                for (let i = 0; i < arr.length; i++) arr[i] = arr[i].trim();
                switch (keypair[0]) {
                    case "Format":
                        if (arr[arr.length - 1] !== "Text") {
                            throw "Invalid event tag format";
                        } else config["parser"]["event_format"] = arr;
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

    _parseTime: {
        /**
         * Parses a string into a time
         * @param {string} timestring the string containing the time.
         * @returns {number} time in seconds.
         */
        value: function (timestring) {
            let array = timestring.split(":");
            let time = 0;
            for (let i = 0; i < array.length; i++) {
                if (i !== array.length - 1) {
                    time += global.parseInt(array[i], 10);
                    time *= 60;
                } else {
                    time += parseFloat(array[i]);
                }
            }
            return time;
        },
        writable: false
    },

    _parseColor: {
        /**
         * Parses colors for styles.
         * @param {SSAStyleDefinition} style
         * @param {string} color
         * @param {number} colornum
         * @private
         */
        value: function (style, color, colornum) {
            let tmp = global.parseInt(this._cleanRawColor(color), 16);
            if (global.isNaN(tmp)) throw "Invalid color in style.";
            let r = (tmp & 0xff) / 255;
            tmp = tmp >> 8;
            let g = (tmp & 0xff) / 255;
            tmp = tmp >> 8;
            let b = (tmp & 0xff) / 255;
            tmp = tmp >> 8;
            let a = (255 - (tmp & 0xff)) / 255;
            let colorObj = new sabre.SSAColor(r, g, b, a);
            switch (colornum) {
                case 1:
                    style.setPrimaryColor(colorObj);
                    break;
                case 2:
                    style.setSecondaryColor(colorObj);
                    break;
                case 3:
                    style.setTertiaryColor(colorObj);
                    break;
                case 4:
                    style.setQuaternaryColor(colorObj);
                    break;
            }
        },
        writable: false
    },

    _parseOldStyle: {
        /**
         * Parses Substation Alpha Subtitles Style lines.
         * @private
         * @param {Array<string>} values Values of style line.
         * @param {Object} config Renderer config object.
         */
        value: function (values, config) {
            let style = new sabre.SSAStyleDefinition();
            let tmp, tmp2, tmp3, tmp4;
            for (
                let i = 0;
                i < values.length &&
                i < config["parser"]["style_format"].length;
                i++
            ) {
                let key = config["parser"]["style_format"][i];
                let value = values[i];
                switch (key) {
                    case "Name":
                        style.setName(value);
                        break;
                    case "Fontname":
                        this._loadFont.call(null, value);
                        style.setFontName(value);
                        break;
                    case "Fontsize":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setFontSize(tmp);
                        else throw "Invalid font size in style.";
                        break;
                    case "PrimaryColour":
                        this._parseColor(style, value, 1);
                        break;
                    case "SecondaryColour":
                        this._parseColor(style, value, 2);
                        break;
                    case "OutlineColour":
                        this._parseColor(style, value, 3);
                        break;
                    case "BackColour":
                        this._parseColor(style, value, 4);
                        break;
                    case "Bold":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) {
                            if (tmp === 1 || tmp === -1) {
                                style.setWeight(700);
                            } else if (tmp <= 0) {
                                style.setWeight(400);
                            } else {
                                style.setWeight(tmp);
                            }
                        } else throw "Invalid font weight in style.";
                        break;
                    case "Italic":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setItalic(tmp > 0);
                        else throw "Invalid italic setting in style.";
                    case "BorderStyle":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setBorderStyle(tmp);
                        else throw "Invalid border type in style.";
                        break;
                    case "Outline":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setOutline(tmp);
                        else throw "Invalid outline width in style.";
                        break;
                    case "Shadow":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp))
                            style.setShadow(tmp / global.Math.sqrt(2));
                        else throw "Invalid shadow distance in style.";
                        break;
                    case "Alignment":
                        tmp = global.parseInt(value, 10);
                        if (isNaN(tmp) || tmp > 11)
                            throw "Invalid alignment type in style.";
                        tmp2 = tmp & 0x03;
                        tmp3 = (tmp >>> 2) & 0x03;
                        tmp4 = tmp2;
                        switch (tmp3) {
                            case 1:
                                tmp4 += 3;
                            case 2:
                                tmp4 += 3;
                                style.setAlignment(tmp4);
                                break;
                            case 0:
                                style.setAlignment(tmp4);
                                break;
                            default:
                                throw "Invalid alignment type in style.";
                        }
                        break;
                    case "MarginL":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setMarginLeft(tmp);
                        else throw "Invalid left margin in style.";
                        break;
                    case "MarginR":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setMarginRight(tmp);
                        else throw "Invalid left margin in style.";
                        break;
                    case "MarginV":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setMarginVertical(tmp);
                        else throw "Invalid vertical margin in style.";
                        break;
                    case "AlphaLevel":
                        //UNUSED: SSA has this style entry, but does not use it.
                        break;
                    case "Encoding":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setEncoding(tmp);
                        else throw "Invalid encoding in style.";
                        break;
                    default:
                        throw 'Unrecognized Style Entry "' + key + '"';
                }
            }
            this._styles[style.getName()] = style;
        },
        writable: false
    },

    _parseStyle: {
        /**
         * Parses Advanced Substation Alpha Subtitles Style lines.
         * @private
         * @param {Array<string>} values Values of style line.
         * @param {Object} config Renderer config object.
         */
        value: function (values, config) {
            let style = new sabre.SSAStyleDefinition();
            let tmp;
            for (
                let i = 0;
                i < values.length &&
                i < config["parser"]["style_format"].length;
                i++
            ) {
                let key = config["parser"]["style_format"][i];
                let value = values[i];
                switch (key) {
                    case "Name":
                        style.setName(value);
                        break;
                    case "Fontname":
                        this._loadFont.call(null, value);
                        style.setFontName(value);
                        break;
                    case "Fontsize":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setFontSize(tmp);
                        else throw "Invalid font size in style.";
                        break;
                    case "PrimaryColour":
                        this._parseColor(style, value, 1);
                        break;
                    case "SecondaryColour":
                        this._parseColor(style, value, 2);
                        break;
                    case "OutlineColour":
                        this._parseColor(style, value, 3);
                        break;
                    case "BackColour":
                        this._parseColor(style, value, 4);
                        break;
                    case "Bold":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) {
                            if (tmp === 1 || tmp === -1) {
                                style.setWeight(700);
                            } else if (tmp <= 0) {
                                style.setWeight(400);
                            } else {
                                style.setWeight(tmp);
                            }
                        } else throw "Invalid font weight in style.";
                        break;
                    case "Italic":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setItalic(tmp > 0);
                        else throw "Invalid italic setting in style.";
                    case "Underline":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setUnderline(tmp > 0);
                        else throw "Invalid underline setting in style.";
                    case "StrikeOut":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setStrikeout(tmp > 0);
                        else
                            throw "Invalid Strikeout/Strikethrough setting in style.";
                    case "ScaleX":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setScaleX(tmp);
                        else throw "Invalid x scale multiplier in style.";
                        break;
                    case "ScaleY":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setScaleY(tmp);
                        else throw "Invalid y scale multiplier in style.";
                        break;
                    case "Spacing":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setSpacing(tmp);
                        else throw "Invalid relative kerning value in style.";
                        break;
                    case "Angle":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setAngle(tmp);
                        else throw "Invalid angle in style.";
                        break;
                    case "BorderStyle":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setBorderStyle(tmp);
                        else throw "Invalid border type in style.";
                        break;
                    case "Outline":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp)) style.setOutline(tmp);
                        else throw "Invalid outline width in style.";
                        break;
                    case "Shadow":
                        tmp = global.parseFloat(value);
                        if (!global.isNaN(tmp))
                            style.setShadow(tmp / global.Math.sqrt(2));
                        else throw "Invalid shadow distance in style.";
                        break;
                    case "Alignment":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setAlignment(tmp);
                        else throw "Invalid alignment type in style.";
                        break;
                    case "MarginL":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setMarginLeft(tmp);
                        else throw "Invalid left margin in style.";
                        break;
                    case "MarginR":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setMarginRight(tmp);
                        else throw "Invalid right margin in style.";
                        break;
                    case "MarginV":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setMarginVertical(tmp);
                        else throw "Invalid vertical margin in style.";
                        break;
                    case "Encoding":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setEncoding(tmp);
                        else throw "Invalid encoding in style.";
                        break;
                    default:
                        throw 'Unrecognized Style Entry "' + key + '"';
                }
            }
            this._styles[style.getName()] = style;
        },
        writable: false
    },

    _parseDialogueText: {
        /**
         * Handles parsing of override tags and other things in the actual text of the subtitle.
         * @private
         * @param {Array<SSASubtitleEvent>} events
         * @returns {Array<SSASubtitleEvent>}
         */
        value: function (events) {
            let event;
            let match;
            for (let i = 0; i < events.length; i++) {
                event = events[i];
                event.setOrder(i);
                match = /^([^{}]*?)\\([nN])(.*)$/.exec(event.getText());
                if (match !== null) {
                    let new_event = sabre.cloneEventWithoutText(event);
                    event.setText(match[1]);
                    new_event.setText(match[3]);
                    new_event.setNewLine(match[2] === "N");
                    events.splice(i + 1, 0, new_event);
                }
                match = /^([^{}]*?)\{(.*?)\}(.*)$/.exec(event.getText());
                if (match !== null) {
                    let new_event = sabre.cloneEventWithoutText(event);
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
                            event.getLineOverrides(),
                            function (lineTransitionTargetOverrides) {
                                event.addLineTransitionTargetOverrides(
                                    lineTransitionTargetOverrides
                                );
                            },
                            match[2],
                            this._config["info"]["is_ass"]
                        )
                    );
                    new_event.setText(match[3]);
                    events.splice(i + 1, 0, new_event);
                }
            }
            return events;
        },
        writable: false
    },

    _overrideTags: {
        /**
         * Contains parsing methods for override tags.
         * @private
         */
        value: Object.freeze([
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^([1-4])?a(?:lpha)?/,
                /**
                 * Sets the alpha component of the specified color.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let color_index = 1;
                    if (
                        typeof parameters[0] !== "undefined" &&
                        parameters[0] !== null &&
                        parameters[0] !== ""
                    )
                        color_index = global.parseInt(parameters[0], 10);
                    let a = null;
                    if (
                        typeof parameters[1] !== "undefined" &&
                        parameters[1] !== null &&
                        parameters[1] !== ""
                    ) {
                        a = global.parseInt(
                            this._cleanRawColor(parameters[1]),
                            16
                        );
                        if (isNaN(a)) return;
                        a = (a & 0xff) / 255;
                    }
                    let color;
                    switch (color_index) {
                        case 1:
                            if (a !== null) {
                                color = !isInTransition
                                    ? overrides.getPrimaryColor()
                                    : transitionTargetOverrides.getPrimaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setPrimaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setPrimaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    }
                                } else {
                                    color.setA(a);
                                }
                            }
                            break;
                        case 2:
                            if (a !== null) {
                                color = !isInTransition
                                    ? overrides.getSecondaryColor()
                                    : transitionTargetOverrides.getSecondaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setSecondaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setSecondaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    }
                                } else {
                                    color.setA(a);
                                }
                            }
                            break;
                        case 3:
                            if (a !== null) {
                                color = !isInTransition
                                    ? overrides.getTertiaryColor()
                                    : transitionTargetOverrides.getTertiaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setTertiaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setTertiaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    }
                                } else {
                                    color.setA(a);
                                }
                            }
                            break;
                        case 4:
                            if (a !== null) {
                                color = !isInTransition
                                    ? overrides.getQuaternaryColor()
                                    : transitionTargetOverrides.getQuaternaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setQuaternaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setQuaternaryColor(
                                            new sabre.SSAOverrideColor(
                                                null,
                                                null,
                                                null,
                                                a
                                            )
                                        );
                                    }
                                } else {
                                    color.setA(a);
                                }
                            }
                            break;
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^a/,
                /**
                 * Sets the alignment of the event using the old style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let depricated_align = global.parseInt(parameters[0], 10);
                    if (isNaN(depricated_align)) return;
                    if (depricated_align > 11) {
                        console.error("Invalid Alignment in legacy \\a tag.");
                        return;
                    }
                    let horizontal_align = depricated_align & 0x03;
                    let vertical_align = (depricated_align >>> 2) & 0x03;
                    let align = horizontal_align;
                    switch (vertical_align) {
                        case 1:
                            align += 3;
                        case 2:
                            align += 3;
                            overrides.setAlignment(align);
                            break;
                        case 0:
                            overrides.setAlignment(align);
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
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^an/,
                /**
                 * Sets the alignment of the event using the new style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    if (
                        typeof parameters[0] === "undefined" ||
                        parameters[0] === null ||
                        parameters[0] === ""
                    ) {
                        overrides.setAlignment(null);
                    } else {
                        let alignment_value = global.parseInt(
                            parameters[0],
                            10
                        );
                        if (isNaN(alignment_value)) return;
                        overrides.setAlignment(alignment_value);
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^b/,
                /**
                 * Handles boldface for text.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let weight = global.parseInt(parameters[1], 10);
                    if (isNaN(weight)) return;
                    if (weight === 0) {
                        overrides.setWeight(400);
                    } else if (weight === 1) {
                        overrides.setWeight(700);
                    } else {
                        overrides.setWeight(weight);
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^be/,
                /**
                 * Handles edge blur for text and shapes.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let blur_iterations = global.parseInt(parameters[0], 10);
                    if (isNaN(blur_iterations)) return;
                    if (!isInTransition) {
                        overrides.setEdgeBlur(blur_iterations);
                    } else {
                        transitionTargetOverrides.setEdgeBlur(blur_iterations);
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^blur/,
                /**
                 * Handles gaussian edge blur for text and shapes.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let blur_value = parseFloat(parameters[0]);
                    if (isNaN(blur_value)) return;
                    if (!isInTransition) {
                        overrides.setGaussianEdgeBlur(blur_value);
                    } else {
                        transitionTargetOverrides.setGaussianEdgeBlur(
                            blur_value
                        );
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^([xy])?bord/,
                /**
                 * Handles outline widths.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let outline_width = parseFloat(parameters[1]);
                    let overrideContainer = !isInTransition
                        ? overrides
                        : transitionTargetOverrides;
                    if (isNaN(outline_width)) return;
                    if (parameters[0] === null) {
                        // x and y outline width
                        overrideContainer.setOutline(outline_width);
                    } else if (parameters[0] === "x") {
                        // x outline width
                        overrideContainer.setOutlineX(outline_width);
                    } else {
                        // y outline width
                        overrideContainer.setOutlineY(outline_width);
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^([1-4])?c/,
                /**
                 * Handles color settings.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let color_index = 1;
                    if (
                        typeof parameters[0] !== "undefined" &&
                        parameters[0] !== null &&
                        parameters[0] !== ""
                    )
                        color_index = global.parseInt(parameters[0], 10);
                    let color;
                    if (
                        typeof parameters[1] !== "undefined" &&
                        parameters[1] !== null &&
                        parameters[1] !== ""
                    ) {
                        let pcolor = global.parseInt(
                            this._cleanRawColor(parameters[1]),
                            16
                        );
                        if (isNaN(pcolor)) return;
                        let r = (pcolor & 0xff) / 255;
                        pcolor = pcolor >> 8;
                        let g = (pcolor & 0xff) / 255;
                        pcolor = pcolor >> 8;
                        let b = (pcolor & 0xff) / 255;
                        switch (color_index) {
                            case 1:
                                color = !isInTransition
                                    ? overrides.getPrimaryColor()
                                    : transitionTargetOverrides.getPrimaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setPrimaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setPrimaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    }
                                } else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                            case 2:
                                color = !isInTransition
                                    ? overrides.getSecondaryColor()
                                    : transitionTargetOverrides.getSecondaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setSecondaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setSecondaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    }
                                } else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                            case 3:
                                color = !isInTransition
                                    ? overrides.getTertiaryColor()
                                    : transitionTargetOverrides.getTertiaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setTertiaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setTertiaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    }
                                } else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                            case 4:
                                color = !isInTransition
                                    ? overrides.getQuaternaryColor()
                                    : transitionTargetOverrides.getQuaternaryColor();
                                if (color === null) {
                                    if (!isInTransition) {
                                        overrides.setQuaternaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    } else {
                                        transitionTargetOverrides.setQuaternaryColor(
                                            new sabre.SSAOverrideColor(
                                                r,
                                                g,
                                                b,
                                                null
                                            )
                                        );
                                    }
                                } else {
                                    color.setR(r);
                                    color.setG(g);
                                    color.setB(b);
                                }
                                break;
                        }
                    } else {
                        switch (color_index) {
                            case 1:
                                color = !isInTransition
                                    ? overrides.getPrimaryColor()
                                    : transitionTargetOverrides.getPrimaryColor();
                                if (color !== null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                            case 2:
                                color = !isInTransition
                                    ? overrides.getSecondaryColor()
                                    : transitionTargetOverrides.getSecondaryColor();
                                if (color !== null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                            case 3:
                                color = !isInTransition
                                    ? overrides.getTertiaryColor()
                                    : transitionTargetOverrides.getTertiaryColor();
                                if (color !== null) {
                                    color.setR(null);
                                    color.setG(null);
                                    color.setB(null);
                                }
                                break;
                            case 4:
                                color = !isInTransition
                                    ? overrides.getQuaternaryColor()
                                    : transitionTargetOverrides.getQuaternaryColor();
                                if (color !== null) {
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
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^clip/,
                /**
                 * Handles text/drawing clipping.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    if (parameters.length === 0) return;
                    var p1 = global.parseInt(parameters[0], 10);
                    var p2 = global.parseInt(parameters[1], 10);
                    if (global.isNaN(p1) || global.isNaN(p2)) {
                        var scale = 1;
                        if (!global.isNaN(p1)) {
                            scale = p1;
                        }
                        var drawString = parameters[1];
                        if (drawString === null) return;
                        lineGlobalOverrides.setClip(
                            scale,
                            /** @type {string} */ (drawString)
                        );
                    } else {
                        var x1 = p1;
                        var y1 = p2;
                        var x2 = global.parseInt(parameters[2], 10);
                        var y2 = global.parseInt(parameters[3], 10);

                        if (!isInTransition) {
                            lineGlobalOverrides.setClip(x1, y1, x2, y2);
                        } else {
                            lineGlobalTransitionTargetOverrides.setClip(
                                x1,
                                y1,
                                x2,
                                y2
                            );
                        }
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^fade/,
                /**
                 * Handles advanced fade animation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let a1 = global.parseInt(parameters[0], 10);
                    let a2 = global.parseInt(parameters[1], 10);
                    let a3 = global.parseInt(parameters[2], 10);
                    let t1 = global.parseInt(parameters[3], 10);
                    let t2 = global.parseInt(parameters[4], 10);
                    let t3 = global.parseInt(parameters[5], 10);
                    let t4 = global.parseInt(parameters[6], 10);
                    if (
                        isNaN(a1) ||
                        isNaN(a2) ||
                        isNaN(a3) ||
                        isNaN(t1) ||
                        isNaN(t2) ||
                        isNaN(t3) ||
                        isNaN(t4)
                    )
                        return;
                    t1 = timeInfo.start + t1 / 1000;
                    t2 = timeInfo.start + t2 / 1000;
                    t3 = timeInfo.end - t3 / 1000;
                    t4 = timeInfo.end - t4 / 1000;
                    lineGlobalOverrides.setFade(
                        1 - (a1 & 0xff) / 255,
                        1 - (a2 & 0xff) / 255,
                        1 - (a3 & 0xff) / 255,
                        t1,
                        t2,
                        t3,
                        t4
                    );
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^fad/,
                /**
                 * Handles basic fade animation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let t1 = global.parseInt(parameters[0], 10);
                    let t2 = global.parseInt(parameters[1], 10);
                    if (isNaN(t1) || isNaN(t2)) return;
                    t1 = timeInfo.start + t1 / 1000;
                    t2 = timeInfo.end - t2 / 1000;
                    lineGlobalOverrides.setFade(
                        0,
                        1,
                        0,
                        timeInfo.start,
                        t1,
                        t2,
                        timeInfo.end
                    );
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^fa([xy])/,
                /**
                 * Handles shearing.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let factor = parseFloat(parameters[1]);
                    let overrideContainer = !isInTransition
                        ? overrides
                        : transitionTargetOverrides;
                    if (isNaN(factor)) return;
                    if (parameters[0] === "x") {
                        // x outline width
                        overrideContainer.setShearX(factor);
                    } else {
                        // y outline width
                        overrideContainer.setShearY(factor);
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^fe/,
                /**
                 * Handles encoding.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let encoding = global.parseInt(parameters[0], 10);
                    overrides.setEncoding(encoding);
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^fn/,
                /**
                 * Handles switching fonts.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let fontName = parameters[0];
                    if (fontName === null) return;
                    this._loadFont.call(null, fontName);
                    overrides.setFontName(/** string */ fontName);
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^fr([xyz])?/,
                /**
                 * Handles rotation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let rotation_axis = "z";
                    if (parameters[0] !== null) rotation_axis = parameters[0];
                    let value = parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    if (!isInTransition) {
                        switch (rotation_axis) {
                            case "x":
                                overrides.setRotation(value, null, null);
                                break;
                            case "y":
                                overrides.setRotation(null, value, null);
                                break;
                            default:
                                overrides.setRotation(null, null, value);
                                break;
                        }
                    } else {
                        switch (rotation_axis) {
                            case "x":
                                transitionTargetOverrides.setRotation(
                                    value,
                                    null,
                                    null
                                );
                                break;
                            case "y":
                                transitionTargetOverrides.setRotation(
                                    null,
                                    value,
                                    null
                                );
                                break;
                            default:
                                transitionTargetOverrides.setRotation(
                                    null,
                                    null,
                                    value
                                );
                                break;
                        }
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^fs([+-])?/,
                /**
                 * Increases or decreases font size, or sets font size.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    if (parameters[0] !== null) {
                        let add_to = parameters[0] === "+";
                        let font_size_modifier = parseFloat(parameters[1]);
                        if (add_to)
                            overrides.increaseFontSizeMod(font_size_modifier);
                        else overrides.decreaseFontSizeMod(font_size_modifier);
                    } else {
                        let font_size = parseFloat(parameters[1]);
                        if (!isInTransition) {
                            overrides.resetFontSizeMod();
                            overrides.setFontSize(font_size);
                        } else {
                            transitionTargetOverrides.setFontSize(font_size);
                        }
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^fsc([xy])/,
                /**
                 * Handles font scaling.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let is_x = parameters[0] === "x";
                    let value = parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    if (!isInTransition) {
                        if (is_x) overrides.setScaleX(value);
                        else overrides.setScaleY(value);
                    } else {
                        if (is_x) transitionTargetOverrides.setScaleX(value);
                        else transitionTargetOverrides.setScaleY(value);
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^fsp/,
                /**
                 * Handles font spacing.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let value = parseFloat(parameters[0]);
                    if (isNaN(value)) return;
                    if (!isInTransition) {
                        overrides.setSpacing(value);
                    } else {
                        transitionTargetOverrides.setSpacing(value);
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^i/,
                /**
                 * Handles italicization.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let value = parameters[0] === "1";
                    if (parameters[0] !== "0" && !value) return;
                    overrides.setItalic(value);
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^iclip/,
                /**
                 * Handles inverse text/drawing clipping.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    lineGlobalOverrides.setClipInverted(true);
                    if (parameters.length === 0) return;
                    var p1 = global.parseInt(parameters[0], 10);
                    var p2 = global.parseInt(parameters[1], 10);
                    if (global.isNaN(p1) || global.isNaN(p2)) {
                        var scale = 1;
                        if (!global.isNaN(p1)) {
                            scale = p1;
                        }
                        var drawString = parameters[1];
                        if (drawString === null) return;
                        lineGlobalOverrides.setClip(
                            scale,
                            /** @type {string} */ (drawString)
                        );
                    } else {
                        var x1 = p1;
                        var y1 = p2;
                        var x2 = global.parseInt(parameters[2], 10);
                        var y2 = global.parseInt(parameters[3], 10);

                        if (!isInTransition) {
                            lineGlobalOverrides.setClip(x1, y1, x2, y2);
                        } else {
                            lineGlobalTransitionTargetOverrides.setClip(
                                x1,
                                y1,
                                x2,
                                y2
                            );
                        }
                    }
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^([kK][fot]?)/,
                /**
                 * Handles karaoke.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let karaoke_tag = parameters[0];
                    let param = parseFloat(parameters[1]);
                    if (isNaN(param)) return;
                    param = param / 100; //Convert from centiseconds (why?) to seconds.
                    let kstart = overrides.getKaraokeEnd();
                    let kend = kstart + param;
                    switch (karaoke_tag) {
                        case "k":
                            overrides.setKaraokeMode(
                                sabre.KaraokeModes.COLOR_SWAP
                            );
                            break;
                        case "K":
                        case "kf":
                            overrides.setKaraokeMode(
                                sabre.KaraokeModes.COLOR_SWEEP
                            );
                            break;
                        case "ko":
                            overrides.setKaraokeMode(
                                sabre.KaraokeModes.OUTLINE_TOGGLE
                            );
                            break;
                        case "kt":
                            kstart = timeInfo.start + param;
                            kend = kstart;
                            break;
                        default:
                            return;
                    }
                    overrides.setKaraokeStart(kstart);
                    overrides.setKaraokeEnd(kend);
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^move/,
                /**
                 * Handles motion animation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let x1 = global.parseInt(parameters[0], 10);
                    let y1 = global.parseInt(parameters[1], 10);
                    let x2 = global.parseInt(parameters[2], 10);
                    let y2 = global.parseInt(parameters[3], 10);
                    if (isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2))
                        return;
                    let t1 = global.parseInt(parameters[4], 10);
                    let t2 = global.parseInt(parameters[5], 10);
                    if (isNaN(t1) || isNaN(t2)) {
                        t1 = timeInfo.start;
                        t2 = timeInfo.end;
                    } else {
                        t1 = t1 / 1000 + timeInfo.start;
                        t2 = t2 / 1000 + timeInfo.start;
                    }
                    if (!gassert(MOVE_ENDS_BEFORE_IT_STARTS, t2 >= t1)) return;
                    lineGlobalOverrides.setMovement(x1, y1, x2, y2, t1, t2);
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^org/,
                /**
                 * Handles setting rotation origin.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let x = global.parseInt(parameters[0], 10);
                    let y = global.parseInt(parameters[1], 10);
                    lineGlobalOverrides.setRotationOrigin(x, y);
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^p/,
                /**
                 * Handles setting draw mode.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let drawScale = parseFloat(parameters[0]);
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
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let baselineOffset = parseFloat(parameters[0]);
                    if (isNaN(baselineOffset)) return;
                    overrides.setBaselineOffset(baselineOffset);
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^pos/,
                /**
                 * Handles setting the position.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let x = global.parseInt(parameters[0], 10);
                    let y = global.parseInt(parameters[1], 10);
                    if (isNaN(x) || isNaN(y)) return;
                    lineGlobalOverrides.setPosition(x, y);
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^q/,
                /**
                 * Handles wrapping style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let wrapStyle = global.parseInt(parameters[0], 10);
                    if (isNaN(wrapStyle) || wrapStyle < 0 || wrapStyle > 3)
                        return;
                    overrides.setWrapStyle(wrapStyle);
                }
            },
            {
                ass_only: false,
                ignore_exterior: false,
                regular_expression: /^r/,
                /**
                 * Handles changing or resetting styling.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    overrides.reset();
                    let styleName = parameters[0];
                    if (
                        typeof styleName !== "undefined" &&
                        styleName !== null &&
                        styleName !== ""
                    )
                        setStyle(
                            this._styles[styleName] ?? this._styles["Default"]
                        );
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^s/,
                /**
                 * Handles strikethrough.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let value = global.parseInt(parameters[0], 10);
                    overrides.setStrikeout(value > 0);
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^([xy])?shad/,
                /**
                 * Handles drop shadow.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let setting = parameters[0];
                    let value = parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    if (!isInTransition) {
                        switch (setting) {
                            case "x":
                                overrides.setShadowX(value);
                                break;
                            case "y":
                                overrides.setShadowY(value);
                            default:
                            case null:
                                if (value < 0) return;
                                overrides.setShadow(value);
                        }
                    } else {
                        switch (setting) {
                            case "x":
                                transitionTargetOverrides.setShadowX(value);
                                break;
                            case "y":
                                transitionTargetOverrides.setShadowY(value);
                            default:
                            case null:
                                if (value < 0) return;
                                transitionTargetOverrides.setShadow(value);
                        }
                    }
                }
            },
            {
                ass_only: true,
                ignore_exterior: true,
                regular_expression: /^t/,
                /**
                 * Handles transitions.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let lparameters = parameters;
                    let final_param;
                    let transitionStart = 0;
                    let transitionEnd = timeInfo.end - timeInfo.start;
                    let acceleration = 1;

                    let temp = parseFloat(lparameters[0]);
                    let temp2;
                    if (global.isNaN(temp)) {
                        final_param = lparameters.join(",");
                        if (
                            !gassert(INVALID_T_FUNCTION_TAG, final_param !== "")
                        )
                            return;
                    } else {
                        temp2 = parseFloat(lparameters[1]);
                        if (!global.isNaN(temp2)) {
                            transitionStart = temp / 1000;
                            transitionEnd = temp2 / 1000;
                            temp = parseFloat(lparameters[2]);
                            if (!global.isNaN(temp)) {
                                acceleration = temp;
                                final_param = lparameters.slice(3).join(",");
                            } else final_param = lparameters.slice(2).join(",");
                            if (
                                !gassert(
                                    INVALID_T_FUNCTION_TAG,
                                    final_param !== ""
                                )
                            )
                                return;
                        } else {
                            acceleration = temp;
                            final_param = lparameters.slice(1).join(",");
                            if (
                                !gassert(
                                    INVALID_T_FUNCTION_TAG,
                                    final_param !== ""
                                )
                            )
                                return;
                        }
                    }

                    //TODO: Implement transition tag parsing.
                    final_param = this._parseTransitionTags(
                        timeInfo,
                        setStyle,
                        overrides,
                        lineGlobalOverrides,
                        addLineTransitionTargetOverrides,
                        final_param
                    );

                    final_param[0].setTransitionStart(
                        transitionStart + timeInfo.start
                    );
                    final_param[0].setTransitionEnd(
                        transitionEnd + timeInfo.start
                    );
                    final_param[0].setTransitionAcceleration(acceleration);

                    final_param[1].setTransitionStart(
                        transitionStart + timeInfo.start
                    );
                    final_param[1].setTransitionEnd(
                        transitionEnd + timeInfo.start
                    );
                    final_param[1].setTransitionAcceleration(acceleration);

                    overrides.addTransition(final_param[0]);
                    addLineTransitionTargetOverrides(final_param[1]);
                }
            },
            {
                ass_only: true,
                ignore_exterior: false,
                regular_expression: /^u/,
                /**
                 * Handles underline.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(SSAStyleDefinition):void} setStyle
                 * @param {SSAStyleOverride} overrides
                 * @param {SSALineStyleOverride} lineGlobalOverrides
                 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
                 * @param {Array<?string>} parameters
                 * @param {boolean} isInTransition
                 * @param {SSATransitionTargetOverride} transitionTargetOverrides
                 * @param {SSALineTransitionTargetOverride} lineGlobalTransitionTargetOverrides
                 * @private
                 */
                tag_handler: function (
                    timeInfo,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let value = parameters[0] === "1";
                    if (
                        typeof parameters[0] === "undefined" ||
                        parameters[0] === null ||
                        (parameters[0] !== "0" && !value)
                    )
                        return;
                    overrides.setUnderline(value);
                }
            }
        ]),
        writable: false
    },

    _parseOverrides: {
        /**
         * Does initial parsing of override tags for tag handling.
         * @private
         * @param {{start:number,end:number}} timeInfo
         * @param {function(SSAStyleDefinition):void} setStyle
         * @param {SSAStyleOverride} old_overrides
         * @param {SSALineStyleOverride} line_overrides
         * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
         * @param {string} tags
         * @param {boolean} isAdvancedSubstation
         */
        value: function (
            timeInfo,
            setStyle,
            old_overrides,
            line_overrides,
            addLineTransitionTargetOverrides,
            tags,
            isAdvancedSubstation
        ) {
            //Regex for separating override tags.
            const override_regex = /\\([^\\()]+)(?:\(([^)]*)\)?)?([^\\()]+)?/g;
            //clone the old overrides so we can change them without affecting the prior tag.
            let overrides = old_overrides.clone();
            let lineGlobalOverrides = line_overrides;
            let pre_params = null;
            let params = null;
            let post_params = null;
            let code;
            //For each override tag
            while ((pre_params = override_regex.exec(tags)) !== null) {
                code = pre_params[0];
                params = pre_params[2] ?? "";
                post_params = pre_params[3] ?? "";
                pre_params = pre_params[1];
                let found = false;
                //Search for a coresponding override tag supported by the parser.
                for (let i = this._overrideTags.length - 1; i >= 0; i--) {
                    //ignore Advanced Substation Alpha specific tags if we're parsing SSA.
                    if (this._overrideTags[i].ass_only && !isAdvancedSubstation)
                        continue;
                    let regex = this._overrideTags[i].regular_expression;
                    //Test for matching tag.
                    if (regex.test(pre_params)) {
                        found = true;
                        let match = pre_params.match(regex);
                        //Does the tag ignore parameters that are outside parenthesis?
                        if (!this._overrideTags[i].ignore_exterior) {
                            //No it does not ignore them.
                            pre_params = pre_params.slice(match[0].length);
                            if (pre_params !== "")
                                pre_params = pre_params.split(",");
                            else pre_params = [];
                            if (post_params !== "")
                                post_params = post_params.split(",");
                            else post_params = [];
                            if (params !== "") params = params.split(",");
                            else params = [];
                            params = params.concat(pre_params, post_params);
                        } else {
                            //Yes it does ignore them.
                            if (params !== "") params = params.split(",");
                            else params = [];
                        }
                        for (let n = match.length - 1; n > 0; n--) {
                            params.unshift(match[n] ?? null);
                        }
                        //Remove whitespace from beginning and end of all parameters.
                        params = params.map((str) =>
                            str === null ? null : str.trim()
                        );
                        //Handle the override tag.
                        this._overrideTags[i].tag_handler.call(
                            this,
                            timeInfo,
                            setStyle,
                            overrides,
                            lineGlobalOverrides,
                            addLineTransitionTargetOverrides,
                            params,
                            false,
                            null,
                            null
                        );
                        break;
                    }
                }
                //Error if we didn't find a matching tag.
                if (!found) console.error("Unrecognized Override Tag: " + code);
            }
            return overrides;
        },
        writable: false
    },

    _parseTransitionTags: {
        /**
         * Parse override tags in a transition tag.
         * @private
         * @param {{start:number,end:number}} timeInfo
         * @param {function(SSAStyleDefinition):void} setStyle
         * @param {SSAStyleOverride} current_overrides
         * @param {SSALineStyleOverride} line_overrides
         * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
         * @param {string} tags
         */
        value: function (
            timeInfo,
            setStyle,
            current_overrides,
            line_overrides,
            addLineTransitionTargetOverrides,
            tags
        ) {
            //Regex for separating override tags.
            const override_regex = /\\([^\\()]+)(?:\(([^)]*)\)?)?([^\\()]+)?/g;
            let overrides = current_overrides;
            let lineGlobalOverrides = line_overrides;
            let pre_params = null;
            let params = null;
            let post_params = null;
            let code;
            let transitionTarget = new sabre.SSATransitionTargetOverride();
            let lineTransitionTarget =
                new sabre.SSALineTransitionTargetOverride();
            //For each override tag
            while ((pre_params = override_regex.exec(tags)) !== null) {
                code = pre_params[0];
                params = pre_params[2] ?? "";
                post_params = pre_params[3] ?? "";
                pre_params = pre_params[1];
                let found = false;
                //Search for a coresponding override tag supported by the parser.
                for (let i = this._overrideTags.length - 1; i >= 0; i--) {
                    let regex = this._overrideTags[i].regular_expression;
                    //Test for matching tag.
                    if (regex.test(pre_params)) {
                        found = true;
                        let match = pre_params.match(regex);
                        //Does the tag ignore parameters that are outside parenthesis?
                        if (!this._overrideTags[i].ignore_exterior) {
                            //No it does not ignore them.
                            pre_params = pre_params.slice(match[0].length);
                            if (pre_params !== "")
                                pre_params = pre_params.split(",");
                            else pre_params = [];
                            if (post_params !== "")
                                post_params = post_params.split(",");
                            else post_params = [];
                            if (params !== "") params = params.split(",");
                            else params = [];
                            params = params.concat(pre_params, post_params);
                        } else {
                            //Yes it does ignore them.
                            if (params !== "") params = params.split(",");
                            else params = [];
                        }
                        for (let n = match.length - 1; n > 0; n--) {
                            params.unshift(match[n] ?? null);
                        }
                        //Remove whitespace from beginning and end of all parameters.
                        params = params.map((str) =>
                            str === null ? null : str.trim()
                        );
                        //Handle the override tag.
                        this._overrideTags[i].tag_handler.call(
                            this,
                            timeInfo,
                            setStyle,
                            overrides,
                            lineGlobalOverrides,
                            addLineTransitionTargetOverrides,
                            params,
                            true,
                            transitionTarget,
                            lineTransitionTarget
                        );
                        break;
                    }
                }
                //Error if we didn't find a matching tag.
                if (!found) console.error("Unrecognized Override Tag: " + code);
            }
            return [transitionTarget, lineTransitionTarget];
        },
        writable: false
    },

    _parseDialogue: {
        /**
         * Parse dialog lines.
         * @private
         * @param {string} values
         * @param {Object} config
         */
        value: function (values, config) {
            //Create a new event for the line.
            let event = new sabre.SSASubtitleEvent();
            event.setId(this._lineCounter++);
            //Preload the default style into the event.
            let style = this._styles["Default"];
            //Create a new style override for the event.
            let line_overrides = new sabre.SSALineStyleOverride();
            let event_overrides = new sabre.SSAStyleOverride();
            let tmp;
            for (let i = 0; i < values.length; i++) {
                //Handle each key's value.
                let key = config["parser"]["event_format"][i];
                let value = values[i];
                switch (key) {
                    case "Style":
                        //Set the style to the specified one, or the default if it doesn't exist.
                        style = this._styles[value] ?? this._styles["Default"];
                        break;
                    case "Layer":
                        //Set the layer.
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) event.setLayer(tmp);
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
                        //event_overrides.setEffect(value); //TODO: How does this get handled...
                        break;
                    case "MarginL":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp))
                            event_overrides.setMarginLeft(tmp);
                        break;
                    case "MarginR":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp))
                            event_overrides.setMarginRight(tmp);
                        break;
                    case "MarginV":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp))
                            event_overrides.setMarginVertical(tmp);
                        break;
                    case "Name":
                    case "Actor":
                    case "Marked":
                    //These aren't needed and so are ignored, they're just for people who are editing subtitles.
                    default:
                        break;
                }
            }
            //Set the event's style and style override properties.
            event.setStyle(style);
            event.setOverrides(event_overrides);
            event.setLineOverrides(line_overrides);
            let events = [event];
            //Split the event into sub-events for the various style override tags.
            events = this._parseDialogueText(events);
            //concatinate the resulting events.
            config["renderer"]["events"] =
                typeof config["renderer"]["events"] === "undefined" ||
                config["renderer"]["events"] === null
                    ? events
                    : config["renderer"]["events"].concat(events);
        },
        writable: false
    },

    _parseFontName: {
        /**
         * Handles font typing for embedded fonts.
         * @private
         * @param {string} internalName filename for encoded font.
         * @returns {Object} Info on the font.
         */
        value: function (internalName) {
            let fontNameData =
                /^(.*)_(B?)(I?)([0-9]+)\.(ttf|otf|woff|woff2)$/.exec(
                    internalName
                );
            if (fontNameData === null) {
                fontNameData = /^(.*)\.(ttf|otf|woff|woff2)$/.exec(
                    internalName
                );
                if (fontNameData === null)
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
                fontEncoding: global.parseInt(fontNameData[4], 10),
                fontFormat: fontNameData[5]
            };
        },
        writable: false
    },

    _parse: {
        /**
         * Performs parsing of each line of text, delegating to the specific parsers for each type of line.
         * @param {string} line
         * @private
         */
        value: function (line) {
            if (line[0] === "[" && line[line.length - 1] === "]") {
                //If it's a heading line.
                this._heading = line.slice(1, line.length - 1); //Set the current heading.
                return;
            }
            if (line[0] === ";") return; // this means the current line is just a comment so we just ignore it.
            let keypair = this._splitOnce(line, ":"); //Split line into it's key and value.
            if (keypair.length > 1) {
                // ignore keys with no value.
                if (!gassert(FOUND_DEPRICATED_COMMENT, keypair[0] !== "!"))
                    //Check for the depricated comment style.
                    return; //Ignore depricated comments.
                try {
                    //Check to see if we can parse this heading.
                    if (typeof this._parser[this._heading] !== "undefined")
                        this._parser[this._heading].call(
                            // Parse the heading.
                            this,
                            keypair,
                            this._config
                        );
                    else {
                        //try to fix the heading case
                        let headings = Object.keys(this._parser);
                        let i = 0;
                        for (; i < headings.length; i++) {
                            if (
                                sabre.stringEqualsCaseInsensitive(
                                    this._heading,
                                    headings[i]
                                )
                            ) {
                                this._heading = headings[i];
                                WRONG_CASE_IN_HEADING.grumble();
                                this._parser[this._heading].call(
                                    // Parse the heading.
                                    this,
                                    keypair,
                                    this._config
                                );
                                break;
                            }
                        }
                        gassert(UNKNOWN_HEADING, i !== headings.length);
                    }
                } catch (e) {
                    throw (
                        "[" +
                        this._heading +
                        "] Error:" +
                        e +
                        "\n\t" +
                        "On Line: " +
                        line
                    );
                }
            }
        },
        writable: false
    },

    init: {
        /**
         * Perform initialization of the library and all it's components. Load default fonts.
         * @param {function(string):void} loadFont
         */
        value: function (loadFont) {
            this._loadFont = loadFont;
            this._loadFont.call(null, "Arial");
            this._loadFont.call(null, "Open Sans");
        },
        writable: false
    },

    "load": {
        /**
         * Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.
         * @param {string} subsText the passed subtitle file contents.
         * @param {function(RendererData):void} callback what we pass the results of the parsing to.
         * @returns {void}
         */
        value: function (subsText, callback) {
            //Create new default style.
            let defaultStyle = new sabre.SSAStyleDefinition();
            defaultStyle.setName("Default");
            this._styles = { "Default": defaultStyle };
            this._config = /** @type {RendererData} */ ({
                "info": {},
                "parser": {},
                "renderer": {}
            });
            if (subsText.indexOf("\xEF\xBB\xBF") === 0) {
                //check for BOM
                subsText = subsText.replace("\xEF\xBB\xBF", ""); //ignore BOM, we're on the web, everything is big endian.
            }
            let subs = subsText.split(/(?:\r?\n)|(?:\n\r?)/); //Split up all lines.
            console.info("Parsing Sub Station Alpha subtitle file...");
            if (subs[0].trim() !== "[Script Info]") {
                throw "Invalid Sub Station Alpha script";
            }
            this._lineCounter = 0;
            for (let i = 0; i < subs.length; i++) {
                this._parse(subs[i]); //Parse individual lines of the file.
            }
            callback(this._config); //pass the config to the renderer
        },
        writable: false
    }
});

sabre["Parser"] = function (loadFont) {
    let parser = global.Object.create(parser_prototype);
    parser.init(loadFont);
    return parser;
};

/**
 * Is Bitmap Rendering supported for canvas?
 * @type {boolean}
 * @private
 */
const bitmapSupported =
    typeof global.ImageBitmapRenderingContext !== "undefined" &&
    typeof global.ImageBitmap !== "undefined" &&
    typeof global.OffscreenCanvas !== "undefined";

/**
 * The entry point for the library; returns the delegate for controlling the library.
 * @param {function(string):void} loadFont This parameter is a function that loads a font using the CSSFontLoading API for use by the library.
 */

external["SABRERenderer"] = function (loadFont) {
    let parser = new sabre["Parser"](loadFont);
    let renderer = new sabre.Renderer();
    return Object.freeze({
        /**
         * Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.
         * @param {string} subsText
         * @returns {void}
         */
        "loadSubtitles": function (subsText) {
            parser["load"](subsText, (config) => renderer.load(config));
        },
        /**
         * Updates the resolution at which the subtitles are rendered (if the player is resized, for example).
         * @param {number} width the desired width of the resolution.
         * @param {number} height the desired height of the resolution.
         * @returns {void}
         */
        "setViewport": function (width, height) {
            renderer.updateViewport(width, height);
        },
        /**
         * Checks if the renderer is ready to render a frame.
         * @returns {boolean} is the renderer ready?
         */
        "checkReadyToRender": function () {
            return renderer.canRender();
        },
        /**
         * Fetches a rendered frame of subtitles as an ImageBitmap, returns null if ImageBitmap is unsupported.
         * @param {number} time the time at which to draw subtitles.
         * @returns {ImageBitmap}
         */
        "getFrame": function (time) {
            renderer.frame(time);
            return renderer.getDisplayBitmap();
        },
        /**
         * Fetches a rendered frame of subtitles as an object uri.
         * @param {number} time the time at which to draw subtitles.
         * @param {function(string):void} callback a callback that provides the URI for the image generated.
         * @returns {void}
         */
        "getFrameAsUri": function (time, callback) {
            renderer.frame(time);
            renderer.getDisplayUri(callback);
        },
        /**
         * Fetches a rendered frame of subtitles to a canvas.
         * @param {number} time the time at which to draw subtitles.
         * @param {HTMLCanvasElement|OffscreenCanvas} canvas the target canvas
         * @param {string=} contextType the context type to use (must be one of "bitmap" or "2d"), defaults to "bitmap" unless unsupported by the browser, in which case "2d" is the default.
         * @returns {void}
         */
        "drawFrame": function (time, canvas, contextType) {
            let bitmapUsed =
                bitmapSupported &&
                (typeof contextType === "undefined" || contextType !== "2d");
            renderer.frame(time);
            renderer.copyToCanvas(canvas, bitmapUsed);
        }
    });
};
