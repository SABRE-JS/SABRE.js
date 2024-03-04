/*
 |   subtitle-parser.js
 |----------------
 |  subtitle-parser.js is copyright Patrick Rhodes Martin 2020,2021.
 |
 |-
 */
//@include [global-constants]
//@include [util]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-tags]
//@include [subtitle-event]
//@include [renderer-main]
//@include [text-server]

/**
 * @fileoverview subtitle parser code for Substation Alpha and Advanced Substation Alpha.
 */

/**
 * @private
 * @typedef {!{info:Object,parser:Object,fontserver:Array<Font>,renderer:{events:Array<SSASubtitleEvent>}}}
 */
let RendererData;

/**
 * Assert using grumbles.
 * @param {sabre.Complaint} complaint
 * @param {boolean} test
 * @private
 */
const gassert = function gassert (complaint, test) {
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

    _fileLineCounter: {
        /**
         * Counts the current line of the file.
         * @private
         */
        value: 1,
        writable: true
    },

    _fileEncoding: {
        /**
         * The encoding of the file.
         * @private
         */
        value: sabre.CodePages.ANSI,
        writable: true
    },

    // _splitOnce: {
    //     /**
    //      * Splits a string once.
    //      * @param {string} string the string to split.
    //      * @param {string} separator the separator to split on.
    //      * @private
    //      */
    //     value: function _splitOnce (string, separator) {
    //         let j = string.indexOf(separator);
    //         if (j === -1) return [string.trim()];
    //         return [string.slice(0, j), string.slice(j + 1).trim()];
    //     },
    //     writable: false
    // },

    _mapEncoding: {
        /**
         * Maps an encoding constant to the codepage number.
         * @param {number} encoding the encoding constant.
         * @return {number} the codepage number.
         */
        value: function _mapEncoding (encoding) {
            switch(encoding){
                case sabre.CodePageIds.ANSI:
                    return sabre.CodePages.ANSI;
                case sabre.CodePageIds.UTF8:
                    return sabre.CodePages.UTF8;
                case sabre.CodePageIds.CUSTOM:
                    return sabre.CodePages.CUSTOM;
                case sabre.CodePageIds.MAC:
                    return sabre.CodePages.MAC;
                case sabre.CodePageIds.SHIFT_JIS:
                    return sabre.CodePages.SHIFT_JIS;
                case sabre.CodePageIds.HANGUL:
                    return sabre.CodePages.HANGUL;
                case sabre.CodePageIds.JOHAB:
                    return sabre.CodePages.JOHAB;
                case sabre.CodePageIds.GB2312:
                    return sabre.CodePages.GB2312;
                case sabre.CodePageIds.BIG5:
                    return sabre.CodePages.BIG5;
                case sabre.CodePageIds.GREEK:
                    return sabre.CodePages.GREEK;
                case sabre.CodePageIds.TURKISH:
                    return sabre.CodePages.TURKISH;
                case sabre.CodePageIds.VIETNAMESE:
                    return sabre.CodePages.VIETNAMESE;
                case sabre.CodePageIds.HEBREW:
                    return sabre.CodePages.HEBREW;
                case sabre.CodePageIds.ARABIC:
                    return sabre.CodePages.ARABIC;
                case sabre.CodePageIds.BALTIC:
                    return sabre.CodePages.BALTIC;
                case sabre.CodePageIds.RUSSIAN:
                    return sabre.CodePages.RUSSIAN;
                case sabre.CodePageIds.THAI:
                    return sabre.CodePages.THAI;
                case sabre.CodePageIds.EASTERN_EUROPE:
                    return sabre.CodePages.EASTERN_EUROPE;
                case sabre.CodePageIds.OEM:
                    return sabre.CodePages.OEM;
                default:
                    throw "Unrecognized code page.";
            }
        },
        writable: false
    },

    _parser: {
        /**
         * Contains parsing methods for root entries.
         * @private
         * @dict
         * @type {Object<string,function(string,TextServer,Object):void>}
         */
        value: Object.freeze({
            "Script Info": function (
                /** string */ key,
                /** TextServer */ file,
                /** Object */ config
            ) {
                const value = file.next(this._fileEncoding,["\r\n","\n\r","\n","\r"]).trim();
                switch (key) {
                    case "Title":
                        config["info"]["title"] = value;
                        return;
                    case "Original Script":
                        config["info"]["author"] = value;
                        return;
                    case "Original Translation":
                        config["info"]["translator"] = value;
                        return;
                    case "Original Editing":
                        config["info"]["editor"] = value;
                        return;
                    case "Original Timing":
                        config["info"]["timing"] = value;
                        return;
                    case "Synch Point":
                        config["renderer"]["sync_offset"] = this._parseTime(
                            value
                        );
                        return;
                    case "Script Updated By":
                        config["info"]["updater"] = value;
                        return;
                    case "Update Details":
                        config["info"]["update_description"] = value;
                        return;
                    case "ScriptType": {
                        let version = value.match(
                            /v([0-9]+(?:\.[0-9]+)?)(\++)?/
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
                        config["info"]["is_ass"] = !!version[2];
                        config["info"]["ass_version"] = version[2].length;
                        console.info(
                            "Advanced Sub Station Alpha: " +
                                config["info"]["is_ass"] + "\tVersion:" + config["info"]["ass_version"]
                        );
                        return;
                    }
                    case "Collisions": {
                        let collisionMode = value.toLowerCase();
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
                            value,
                            10
                        );
                        return;
                    case "PlayResX":
                        config["renderer"]["resolution_x"] = global.parseInt(
                            value,
                            10
                        );
                        return;
                    case "YCbCr Matrix":
                        {
                            let colorspace_name = value.toLowerCase();
                            switch (colorspace_name) {
                                case "none":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.NONE;
                                    break;
                                default:
                                    console.warn("Warning: Unrecognized color space, defaulting to BT.601.");
                                case "tv.601":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT601_TV;
                                    break;
                                case "pc.601":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT601_PC;
                                    break;
                                case "tv.709":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT709_TV;
                                    break;
                                case "pc.709":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT709_PC;
                                    break;
                                case "tv.2020":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT2020_TV;
                                    break;
                                case "pc.2020":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT2020_PC;
                                    break;
                                case "tv.2020.cl":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT2020_CL_TV;
                                    break;
                                case "pc.2020.cl":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT2020_CL_PC;
                                    break;
                                //TODO: Implement HDR stuff.
                                /*
                                case "tv.2100.pq":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT2100_PQ;
                                    break;
                                case "tv.2100.hlg":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.BT2100_HLG;
                                    break;
                                */
                                case "tv.240m":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.SMPTE240M_TV;
                                    break;
                                case "pc.240m":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.SMPTE240M_PC;
                                    break;
                                case "tv.fcc":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.FCC_TV;
                                    break;
                                case "pc.fcc":
                                    config["renderer"]["color_mangling_mode"] = sabre.ColorManglingModes.FCC_PC;
                                    break;
                            }
                        }
                        return;
                    case "PlayDepth":
                        config["renderer"]["bit_depth"] = global.parseInt(
                            value,
                            10
                        );
                        return;
                    case "Timer":
                        config["renderer"]["playback_speed"] =
                            global.parseFloat(value);
                        return;
                    case "WrapStyle":
                        {
                            let wrap_style = global.parseInt(value, 10);
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
                    case "ScaledBorderAndShadow":
                        {
                            const scaledBorderAndShadow = value.toLowerCase();
                            if(scaledBorderAndShadow === "yes"){
                                config["renderer"]["scaled_border_and_shadow"] = true;
                            }else{
                                config["renderer"]["scaled_border_and_shadow"] = false;
                            }
                        }
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                key +
                                '" for heading "Script Info"; Ignoring.'
                        );
                        return;
                }
            },
            "v4 Styles": function (
                /** string */ key,
                /** TextServer */ file,
                /** Object */ config
            ) {
                if (config["info"]["version"] < 4) {
                    console.warn(
                        'Warning: The "v4 Styles" heading is only available in SSA v4 and Higher and will be ignored as the script version is: SSA v' +
                            Math.floor(config["info"]["version"])
                    );
                    return;
                }
                if (config["info"]["is_ass"])
                    throw 'Depricated: The "v4 Styles" heading is unsupported in Advanced Substation Alpha Subtitles.';
                config["parser"]["style_format"] =
                    config["parser"]["style_format"] ??
                    default_ssa_style_format;
                let arr = file.next(this._fileEncoding,["\r\n","\n\r","\n","\r"]).split(",").map(function (a) {
                    return a.trim();
                });
                switch (key) {
                    case "Format":
                        config["parser"]["style_format"] = arr;
                        return;
                    case "Style":
                        this._parseOldStyle(arr, config);
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                key +
                                '" for heading "v4 Styles"; Ignoring.'
                        );
                        return;
                }
            },
            "v4+ Styles": function (
                /** string */ key,
                /** TextServer */ file,
                /** Object */ config
            ) {
                if (config["info"]["version"] < 4) {
                    console.warn(
                        'Warning: The "v4+ Styles" heading is only available in ASS v1 and Higher and will be ignored as the script version is: SSA v' +
                            Math.floor(config["info"]["version"])
                    );
                    return;
                }
                if (!config["info"]["is_ass"])
                    throw 'Error: The "v4+ Styles" heading is unsupported in Substation Alpha Subtitles.';
                config["parser"]["style_format"] =
                    config["parser"]["style_format"] ||
                    default_ass_style_format;
                let arr = file.next(this._fileEncoding,["\r\n","\n\r","\n","\r"]).split(",").map(function (a) {
                    return a.trim();
                });
                switch (key) {
                    case "Format":
                        config["parser"]["style_format"] = arr;
                        return;
                    case "Style":
                        this._parseStyle(arr, config);
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                key +
                                '" for heading "v4+ Styles"; Ignoring.'
                        );
                        return;
                }
            },
            "Events": function (
                /** string */ key,
                /** TextServer */ file,
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
                const arr = [];
                while(arr.length < config["parser"]["event_format"].length-1){
                    arr.push(file.next(this._fileEncoding,[",","\r\n","\n\r","\n","\r"]));
                }
                for (let i = 0; i < arr.length; i++) arr[i] = arr[i].trim();
                switch (key) {
                    case "Format":
                        arr.push(file.next(this._fileEncoding,["\r\n","\n\r","\n","\r"]).trim());
                        if (arr[arr.length - 1] !== "Text") {
                            throw "Invalid event tag format";
                        } else config["parser"]["event_format"] = arr;
                        return;
                    case "Dialogue":
                        this._parseDialogue(arr, file, config);
                        return;
                    default:
                        console.warn(
                            'Warning: Unrecognized key "' +
                                key +
                                '" for heading "Events"; Ignoring.'
                        );
                    case "Comment":
                        file.next(this._fileEncoding,["\r\n","\n\r","\n","\r"]);
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
        value: function _parseTime (timestring) {
            let array = timestring.split(":");
            let sign = 1;
            let time = 0;
            for (let i = 1; i < array.length; i++) {
                let ltime = 0;
                if (i !== array.length - 1) {
                    ltime = global.parseInt(array[i], 10);
                    if(i === 0){
                        sign = global.Math.sign(ltime)
                    }else{
                        ltime *= sign;
                    }
                    time += ltime;
                    time *= 60;
                } else {
                    ltime = global.parseFloat(array[i]);
                    if(i === 0){
                        sign = global.Math.sign(ltime)
                    }else{
                        ltime *= sign; 
                    }
                    time += ltime;
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
        value: function _parseColor (style, color, colornum) {
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
        value: function _parseOldStyle (values, config) {
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
        value: function _parseStyle (values, config) {
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
         * @param {TextServer} file
         * @return {Array<SSASubtitleEvent>}
         */
        value: function _parseDialogueText (events, file) {
            let event;
            let match;
            for (let i = 0; i < events.length; i++) {
                event = events[i];
                event.setOrder(i);
                const encoding = this._mapEncoding(event.getOverrides().getEncoding()??event.getStyle().getEncoding());
                let text = event.getText();
                let override = false;
                if (!text){
                    text = file.next(encoding,["\r\n","\n\r","\n","\r"]).replace(/\\h/g, "\u00A0");
                    const first = text.indexOf("{");
                    const second = text.indexOf("}");
                    if(first !== -1 && second !== -1 && first < second){
                        file.rewind();
                        text = file.next(encoding,["}"]).replace(/\\h/g, "\u00A0");
                        override = true;
                    }
                    event.setText(text);
                }
                
                match = /^([^{}]*?)\\([nN])(.*)$/.exec(text);
                if (match !== null) {
                    let new_event = sabre.cloneEventWithoutText(event);
                    event.setText(match[1]);
                    new_event.setText(match[3]);
                    new_event.setNewLine(match[2] === "N");
                    events.splice(i + 1, 0, new_event);
                }
                if(override){
                    match = /^([^{}]*?)\{(.*?)$/.exec(text); //\}(.*?)$
                    if (match !== null) {
                        let new_event = sabre.cloneEventWithoutText(event);
                        event.setText(match[1]);
                        //new_event.setText(match[3]);
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
                        events.splice(i + 1, 0, new_event);
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
        value: function _parseOverrides (
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
         * @param {Array<string>} values
         * @param {TextServer} file
         * @param {Object} config
         */
        value: function _parseDialogue (values, file, config) {
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
            let events = this._parseDialogueText([event], file);
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
         * @return {ArrayBuffer}
         */
        value: function _decodeEmbeddedFile (data) {
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
            return function _handleEmbeddedFont (line) {
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
                        opentype.parse(this._decodeEmbeddedFile(data))
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
        value: function _parseEmbeddedFontName (internalName) {
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
         * @param {TextServer} file
         * @private
         */
        value: function _parse (file) {
            let line = file.next(this._fileEncoding,["\r\n","\n\r","\n","\r"]).trim();
            if (this._heading === "Fonts") {
                if (this._handleEmbeddedFont(line)) return line;
            }
            /*if (this._heading === "Graphics"){
                if(this._handleEmbeddedGraphics(line))
                    return line;
            }*/
            if (line[0] === "[" && line[line.length - 1] === "]") {
                //If it's a heading line.
                this._heading = line.slice(1, line.length - 1); //Set the current heading.
            }
            if (line[0] === ";") return line; // this means the current line is just a comment so we just ignore it.
            let bytes = file.rewind();
            let key = file.next(this._fileEncoding,[":","\r\n","\n\r","\n","\r"]); //Get the key of the line.
            // ignore keys with no value.
            if (key.length < line.length-1) {
                //Check for the depricated comment style.
                if (!gassert(FOUND_DEPRICATED_COMMENT, key !== "!")){
                    file.fastforward(bytes);
                    return line; //Ignore depricated comments.
                }try {
                    //Check to see if we can parse this heading.
                    if (typeof this._parser[this._heading] !== "undefined"){
                        this._parser[this._heading].call(
                            // Parse the heading.
                            this,
                            key,
                            file,
                            this._config
                        );
                        return "";
                    } else {
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
                                    key,
                                    file,
                                    this._config
                                );
                                return "";
                            }
                        }
                        if(gassert(UNKNOWN_HEADING, i !== headings.length)){
                            file.fastforward(bytes);
                            return line;
                        }
                    }
                } catch (e) {
                    throw (
                        "[" +
                        this._heading +
                        "] Error:" +
                        e +
                        "\n\t" +
                        "On Line: " +
                        this._fileLineCounter
                    );
                }
            }
            file.fastforward(bytes);
            return line;
        },
        writable: false
    },

    init: {
        /**
         * Perform initialization of the library and all it's components.
         */
        value: function init () {
            this._overrideTags = sabre.getOverrideTags();
        },
        writable: false
    },

    "load": {
        /**
         * Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.
         * @param {ArrayBuffer} subs the passed subtitle file contents.
         * @param {Array<Font>} fonts fonts necessary for this subtitle file.
         * @param {function(RendererData):void} callback what we pass the results of the parsing to.
         * @return {void}
         */
        value: function load (subs, fonts, callback) {
            //Create new default style.
            let defaultStyle = new sabre.SSAStyleDefinition();
            defaultStyle.setName("Default");
            this._styles = { "Default": defaultStyle };
            this._config = /** @type {RendererData} */ ({
                "info": {},
                "parser": {},
                "fontserver": fonts.slice(),
                "renderer": {
                    "resolution_x": 640,
                    "resolution_y": 480,
                    "default_wrap_style": sabre.WrapStyleModes.SMART,
                    "default_collision_mode": sabre.CollisionModes.NORMAL,
                    "color_mangling_mode": sabre.ColorManglingModes.DEFAULT,
                    "scaled_border_and_shadow": false
                }
            });
            let text = new sabre.TextServer(subs);
            let bomtest = text.getBytes(3);
            if (bomtest[0] !== 0xEF || bomtest[1] !== 0xBB || bomtest[2] !== 0xBF) {
                text.rewind();
                this._fileEncoding = sabre.CodePages.ANSI;
            } else this._fileEncoding = sabre.CodePages.UTF8; 
            console.info("Parsing Sub Station Alpha subtitle file...");
            let started = false;
            this._lineCounter = 0;
            this._fileLineCounter = 1;
            do{
                const line = this._parse(text);
                if(line.trim() === "[Script Info]"){
                    started = true;
                }else if (!started && !text.hasNext()) {
                    throw "Invalid Sub Station Alpha script";
                }
            }while (text.hasNext());
            callback(this._config); //pass the config to the renderer
        },
        writable: false
    }
});

/**
 * Constructor for the parser
 * @param {ArrayBuffer} buff the subtitle file's contents.
 */
sabre["Parser"] = function Parser (buff) {
    let parser = global.Object.create(parser_prototype);
    parser.init(buff);
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
 * Note: In the options object resolution is the resolution the video is displayed at (in CSS pixels),
 * nativeResolution is the native resolution of the video (in regular pixels).
 * Note: if you use the options parameter is recommended you set colorSpace to either AUTOMATIC (for studio-swing)
 * or AUTOMATIC_PC (for full-swing) and set the nativeResolution option unless you know the video's colorspace.
 * @public
 * @param {!{fonts:(!Array<Font>|undefined),subtitles:(!string|undefined),colorSpace:(!number|undefined),resolution:(!Array<number>|undefined),nativeResolution:(!Array<number>|undefined)}=} options Initialization options as a shortcut to using the configuration functions (the functions still need to be used if the viewport changes, the subtitle file needs to be changed, the colorspace need to be changed or to request a frame).
 */

external["SABRERenderer"] = function SABRERenderer (options) {
    const parser = new sabre["Parser"]();
    const renderer = new sabre.Renderer();
    const delegate = Object.freeze({
        /**
         * Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.
         * @public
         * @param {ArrayBuffer} subtitles the subtitle file's contents.
         * @param {Array<Font>} fonts preloaded fonts necessary for this subtitle file (one of these MUST be Arial).
         * @return {void}
         */
        "loadSubtitles": function loadSubtitles (subtitles, fonts) {
            parser["load"](subtitles, fonts, (config) => renderer.load(config));
        },
        /**
         * Configures the output colorspace to the set value (or guesses when automatic is specified based on resolution).
         * Note: AUTOMATIC always assumes studio-swing (color values between 16-240), if you need full-swing (color values between 0-255)
         * that must be set by selecting AUTOMATIC_PC. AUTOMATIC and AUTOMATIC_PC are also incapable of determining if the
         * video is HDR, so you need to manually set either BT.2100_PQ or BT.2100_HLG if it is.
         * Note: HDR support is stubbed and unimplemented currently.
         * @public
         * @param {number} colorSpace the colorspace to use for output.
         * @param {number=} width the x component of the video's resolution in regular pixels (only required when colorSpace is AUTOMATIC).
         * @param {number=} height the y component of the video's resolution in regular pixels (only required when colorSpace is AUTOMATIC).
         * @return {void}
         */
        "setColorSpace": function setColorSpace (colorSpace,width,height){
            if(colorSpace === external.VideoColorSpaces.AUTOMATIC){
                if(typeof width === "undefined" || typeof height === "undefined"){
                    console.warn("Color Space set to AUTOMATIC, but resolution not provided, defaulting to BT.601 (studio-swing).");
                    colorSpace = sabre.ColorSpaces.BT601_TV;
                }else{
                    const pixels = width * height;
                    if(pixels <= 604800){
                        colorSpace = sabre.ColorSpaces.BT601_TV;
                    }else if(pixels <= 2073600){
                        colorSpace = sabre.ColorSpaces.BT709_TV;
                    }else{
                        //This is technically only likely for 4k and 8K video but nobody has a 16K display yet so we'll ignore that.
                        //Also, there's no way to tell if the video is HDR or not so we'll just assume it's not.
                        //If is HDR that's up to the developer using this library to set the color space to BT.2100_PQ or BT.2100_HLG.
                        colorSpace = sabre.ColorSpaces.BT2020_TV;
                    }
                }
            }else if(colorSpace === external.VideoColorSpaces.AUTOMATIC_PC){
                if(typeof width === "undefined" || typeof height === "undefined"){
                    console.warn("Color Space set to AUTOMATIC_PC, but resolution not provided, defaulting to BT.601 (full-swing).");
                    colorSpace = sabre.ColorSpaces.BT601_PC;
                }else{
                    const pixels = width * height;
                    if(pixels <= 604800){
                        colorSpace = sabre.ColorSpaces.BT601_PC;
                    }else if(pixels <= 2073600){
                        colorSpace = sabre.ColorSpaces.BT709_PC;
                    }else{
                        //This is technically only likely for 4k and 8K video but nobody has a 16K display yet so we'll ignore that.
                        //Also, there's no way to tell if the video is HDR or not so we'll just assume it's not.
                        //If is HDR that's up to the developer using this library to set the color space to BT.2100_PQ or BT.2100_HLG.
                        colorSpace = sabre.ColorSpaces.BT2020_PC;
                    }
                }
            }else if(Object.values(sabre.ColorSpaces).indexOf(colorSpace) === -1){
                console.warn("Invalid Color Space " + colorSpace + " defaulting to BT.601 (studio-swing).");
                colorSpace = sabre.ColorSpaces.BT601_TV;
            }
            renderer.setColorSpace(colorSpace);
        },
        /**
         * Updates the resolution (in CSS pixels) at which the subtitles are rendered (if the player is resized, for example).
         * @public
         * @param {number} width the desired width of the resolution (in CSS pixels).
         * @param {number} height the desired height of the resolution (in CSS pixels).
         * @return {void}
         */
        "setViewport": function setViewport (width, height) {
            renderer.updateViewport(width, height);
        },
        /**
         * Checks if the renderer is ready to render a frame.
         * @public
         * @return {boolean} is the renderer ready?
         */
        "checkReadyToRender": function checkReadyToRender () {
            return renderer.canRender();
        },
        /**
         * Fetches a rendered frame of subtitles as an ImageBitmap, returns null if ImageBitmap is unsupported.
         * @public
         * @param {number} time the time at which to draw subtitles.
         * @return {?ImageBitmap}
         */
        "getFrame": function getFrame (time) {
            if (!bitmapSupported) return null;
            renderer.frame(time);
            return renderer.getDisplayBitmap();
        },
        /**
         * Fetches a rendered frame of subtitles as an object uri.
         * @public
         * @param {number} time the time at which to draw subtitles.
         * @param {function(string):void} callback a callback that provides the URI for the image generated.
         * @return {void}
         */
        "getFrameAsUri": function getFrameAsUri (time, callback) {
            renderer.frame(time);
            renderer.getDisplayUri(callback);
        },
        /**
         * Fetches a rendered frame of subtitles to a canvas.
         * @public
         * @param {number} time the time at which to draw subtitles.
         * @param {HTMLCanvasElement|OffscreenCanvas} canvas the target canvas
         * @param {string=} contextType the context type to use (must be one of "bitmap" or "2d"), defaults to "bitmap" unless unsupported by the browser, in which case "2d" is the default.
         * @return {void}
         */
        "drawFrame": function drawFrame (time, canvas, contextType) {
            let bitmapUsed =
                bitmapSupported &&
                (typeof contextType === "undefined" || contextType !== "2d");
            renderer.frame(time);
            renderer.copyToCanvas(canvas, bitmapUsed);
        }
    });
    if(options){
        const fonts = options["fonts"];
        const subtitles = options["subtitles"];
        const colorSpace = options["colorSpace"];
        const resolution = options["resolution"];
        const nativeRes = options["nativeResolution"];
        if(fonts && subtitles){
            delegate["loadSubtitles"](subtitles,fonts);
        }
        if(resolution && resolution.length === 2){
            delegate["setViewport"](resolution[0],resolution[1]);
        }
        if(typeof(colorSpace) === "number"){
            if(nativeRes && resolution.length === 2){
                delegate["setColorSpace"](colorSpace,nativeRes[0],nativeRes[1]);
            }else{
                delegate["setColorSpace"](colorSpace);
            }
        }
    }
    return delegate;
};