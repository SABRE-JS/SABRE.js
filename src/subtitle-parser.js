/*
 |   subtitle-parser.js
 |----------------
 |  subtitle-parser.js is copyright Patrick Rhodes Martin 2020,2021.
 |
 |-
 */
//@include [util]
//@include [global-constants]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-tags]
//@include [subtitle-event]
//@include [renderer-main]

/**
 * @fileoverview subtitle parser code for Substation Alpha and Advanced Substation Alpha.
 */

/**
 * @private
 * @typedef {!{info:Object,parser:Object,fontserver:Array<Font>,renderer:{events:Array<SSASubtitleEvent>}}}
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

    _parseFont: {
        /**
         * Function to parse fonts.
         * @type {?function(ArrayBuffer):Font}
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
                        config["info"]["version"] = global.parseFloat(
                            version[1]
                        );
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
                        config["renderer"]["playback_speed"] =
                            global.parseFloat(keypair[1]);
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
         * @return {number} time in seconds.
         */
        value: function (timestring) {
            let array = timestring.split(":");
            let time = 0;
            for (let i = 0; i < array.length; i++) {
                if (i !== array.length - 1) {
                    time += global.parseInt(array[i], 10);
                    time *= 60;
                } else {
                    time += global.parseFloat(array[i]);
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
            let tmp = global.parseInt(sabre.cleanRawColor(color), 16);
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
                    case "TertiaryColour":
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
                        if (!global.isNaN(tmp)) style.setItalic(tmp !== 0);
                        else throw "Invalid italic setting in style.";
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
                        if (!global.isNaN(tmp)) style.setItalic(tmp !== 0);
                        else throw "Invalid italic setting in style.";
                        break;
                    case "Underline":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setUnderline(tmp !== 0);
                        else throw "Invalid underline setting in style.";
                        break;
                    case "StrikeOut":
                        tmp = global.parseInt(value, 10);
                        if (!global.isNaN(tmp)) style.setStrikeout(tmp !== 0);
                        else
                            throw "Invalid Strikeout/Strikethrough setting in style.";
                        break;
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
         * @return {Array<SSASubtitleEvent>}
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
                    const _this = this;
                    new_event.setOverrides(
                        this._parseOverrides(
                            {
                                start: event.getStart(),
                                end: event.getEnd()
                            },
                            function (style_name) {
                                return _this._styles[style_name];
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
        value: null,
        writable: true
    },

    _parseOverrides: {
        /**
         * Does initial parsing of override tags for tag handling.
         * @private
         * @param {{start:number,end:number}} timeInfo
         * @param {function(string):SSAStyleDefinition} getStyleByName
         * @param {function(SSAStyleDefinition):void} setStyle
         * @param {SSAStyleOverride} old_overrides
         * @param {SSALineStyleOverride} line_overrides
         * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
         * @param {string} tags
         * @param {boolean} isAdvancedSubstation
         */
        value: function (
            timeInfo,
            getStyleByName,
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
                            null,
                            timeInfo,
                            getStyleByName,
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

    _decodeEmbeddedFile: {
        /**
         * Decodes embedded files.
         * @param {string} data
         * @returns {ArrayBuffer}
         */
        value: function (data) {
            const bindata = [];
            for (let i = 0; i < data.length; i += 4) {
                let chardata = [];
                for (let j = 0; j < 4; j++) {
                    chardata.push(data.charCodeAt(i) - 33);
                }
                bindata.push(
                    ((chardata[0] & 0x3f) << 2) | ((chardata[1] & 0x30) >>> 4)
                );
                bindata.push(
                    ((chardata[1] & 0x0f) << 4) | ((chardata[2] & 0x3c) >>> 2)
                );
                bindata.push(
                    ((chardata[2] & 0x03) << 6) | (chardata[3] & 0x3f)
                );
            }
            const buffer = new ArrayBuffer(bindata.length);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < bindata.length; i++) {
                view[i] = bindata[i];
            }
            return buffer;
        },
        writable: false
    },

    _handleEmbeddedFont: {
        /**
         * Handles embedded font entries.
         * @private
         * @param {string} line a line of the subtitle file.
         */
        value: (function () {
            let data = "";
            let fontNameData = null;
            return function (line) {
                const foundFontname = line.indexOf("fontname:") === 0;
                const foundHeading =
                    line.indexOf("[") === 0 && line.indexOf("]") > 0;
                if (
                    data.length > 0 &&
                    fontNameData !== null &&
                    (line === "" ||
                        line.length < 80 ||
                        foundFontname ||
                        foundHeading)
                ) {
                    if (!foundFontname || !foundHeading) data += line;
                    this._config["renderer"]["fontserver"].push(
                        this._parseFont(this._decodeEmbeddedFile(data))
                    );
                    data = "";
                    if (foundHeading) return false;
                    return true;
                }
                if (foundHeading) {
                    return false;
                }
                data += line;
                return true;
            };
        })(),
        writable: false
    },

    _parseEmbeddedFontName: {
        /**
         * Handles font names for embedded fonts.
         * @private
         * @param {string} internalName filename for encoded font.
         * @return {Object} Info on the font.
         */
        value: function (internalName) {
            let fontNameData = /^(.*)_(B?)(I?)([0-9]+)\.(ttf|otf|woff)$/.exec(
                internalName
            );
            if (fontNameData === null) {
                fontNameData = /^(.*)\.(ttf|otf|woff)$/.exec(internalName);
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
            if (this._heading === "Fonts") {
                if (this._handleEmbeddedFont(line)) return;
            }
            /*if (this._heading === "Graphics"){
                if(this._handleEmbeddedGraphics(line))
                    return;
            }*/
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
         * Perform initialization of the library and all it's components.
         * @param {function(ArrayBuffer):Font} parseFont
         */
        value: function (parseFont) {
            this._parseFont = parseFont;
            this._overrideTags = sabre.getOverrideTags();
        },
        writable: false
    },

    "load": {
        /**
         * Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.
         * @param {string} subsText the passed subtitle file contents.
         * @param {Array<Font>} fonts fonts necessary for this subtitle file.
         * @param {function(RendererData):void} callback what we pass the results of the parsing to.
         * @return {void}
         */
        value: function (subsText, fonts, callback) {
            //Create new default style.
            let defaultStyle = new sabre.SSAStyleDefinition();
            defaultStyle.setName("Default");
            this._styles = { "Default": defaultStyle };
            this._config = /** @type {RendererData} */ ({
                "info": {},
                "parser": {},
                "fontserver": fonts.slice(),
                "renderer": {
                    "default_wrap_style": sabre.WrapStyleModes.SMART,
                    "default_collision_mode": sabre.CollisionModes.NORMAL
                }
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

/**
 * @param {function(ArrayBuffer):Font} parseFont
 */
sabre["Parser"] = function (parseFont) {
    let parser = global.Object.create(parser_prototype);
    parser.init(parseFont);
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
 * @param {function(ArrayBuffer):Font} parseFont a function that returns an opentype.js Font object when passed an ArrayBuffer.
 */

external["SABRERenderer"] = function (parseFont) {
    let parser = new sabre["Parser"](parseFont);
    let renderer = new sabre.Renderer();
    return Object.freeze({
        /**
         * Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.
         * @param {string} subsText the subtitle file's contents.
         * @param {Array<Font>} fonts preloaded fonts necessary for this subtitle file (one of these MUST be Arial).
         * @return {void}
         */
        "loadSubtitles": function (subsText, fonts) {
            parser["load"](subsText, fonts, (config) => renderer.load(config));
        },
        /**
         * Updates the resolution at which the subtitles are rendered (if the player is resized, for example).
         * @param {number} width the desired width of the resolution.
         * @param {number} height the desired height of the resolution.
         * @return {void}
         */
        "setViewport": function (width, height) {
            renderer.updateViewport(width, height);
        },
        /**
         * Checks if the renderer is ready to render a frame.
         * @return {boolean} is the renderer ready?
         */
        "checkReadyToRender": function () {
            return renderer.canRender();
        },
        /**
         * Fetches a rendered frame of subtitles as an ImageBitmap, returns null if ImageBitmap is unsupported.
         * @param {number} time the time at which to draw subtitles.
         * @return {?ImageBitmap}
         */
        "getFrame": function (time) {
            if (!bitmapSupported) return null;
            renderer.frame(time);
            return renderer.getDisplayBitmap();
        },
        /**
         * Fetches a rendered frame of subtitles as an object uri.
         * @param {number} time the time at which to draw subtitles.
         * @param {function(string):void} callback a callback that provides the URI for the image generated.
         * @return {void}
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
         * @return {void}
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