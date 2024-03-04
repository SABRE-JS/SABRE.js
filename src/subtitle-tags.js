/*
 |   subtitle-tags.js
 |----------------
 |  subtitle-tags.js is copyright Patrick Rhodes Martin et. al 2023.
 |
 |-
 */
//@include [global-constants]
//@include [util]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]

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
const MOVE_ENDS_BEFORE_IT_STARTS = new sabre.Complaint(
    "Encountered a move tag where the animation ends before it starts, ignoring."
);
const INVALID_T_FUNCTION_TAG = new sabre.Complaint(
    "Encountered a parameterless or tagless \\t function tag, ignoring."
);

/**
 * @private
 * @typedef {!{
 *  "ass_only":boolean,
 *  "ignore_exterior":boolean,
 *  "regular_expression":RegExp,
 *  "tag_handler":function(
 *      {
 *          start:number,
 *          end:number
 *      },
 *      function(string):SSAStyleDefinition,
 *      function(SSAStyleDefinition):void,
 *      SSAStyleOverride,
 *      SSALineStyleOverride,
 *      function(SSALineTransitionTargetOverride):void,
 *      Array<?string>,
 *      boolean,
 *      SSATransitionTargetOverride,
 *      SSALineTransitionTargetOverride
 *  )
 * }}
 */

let OverrideTag;

/**
 * @type {?Array<OverrideTag>}
 * @private
 */
let override_tags = null;

/**
 * Parse override tags in a transition tag.
 * @private
 * @param {{start:number,end:number}} timeInfo
 * @param {function(string):SSAStyleDefinition} getStyleByName
 * @param {function(SSAStyleDefinition):void} setStyle
 * @param {SSAStyleOverride} current_overrides
 * @param {SSALineStyleOverride} line_overrides
 * @param {function(SSALineTransitionTargetOverride):void} addLineTransitionTargetOverrides
 * @param {string} tags
 */
const _parseTransitionTags = function (
    timeInfo,
    getStyleByName,
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
        for (let i = override_tags.length - 1; i >= 0; i--) {
            let regex = override_tags[i]["regular_expression"];
            //Test for matching tag.
            if (regex.test(pre_params)) {
                found = true;
                let match = pre_params.match(regex);
                //Does the tag ignore parameters that are outside parenthesis?
                if (!override_tags[i]["ignore_exterior"]) {
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
                override_tags[i]["tag_handler"].call(
                    null,
                    timeInfo,
                    getStyleByName,
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
};

/**
 * Contains parsing methods for override tags.
 * @private
 * @return {Array<OverrideTag>}
 */
sabre["getOverrideTags"] = function(){
    if(override_tags === null){
        override_tags = Object.freeze([
            {
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^([1-4])?a(?:lpha)?/,
                /**
                 * Sets the alpha component of the specified color.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                            sabre.cleanRawColor(/** @private @type {string} */ (parameters[1])),
                            16
                        );
                        if (isNaN(a)) return;
                        a = (255 - (a & 0xff)) / 255;
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^a(?=[0-9][0-9]?)/,
                /**
                 * Sets the alignment of the event using the old style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^an/,
                /**
                 * Sets the alignment of the event using the new style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^b/,
                /**
                 * Handles boldface for text.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let weight = global.parseInt(parameters[0], 10);
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^be/,
                /**
                 * Handles edge blur for text and shapes.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^blur/,
                /**
                 * Handles gaussian edge blur for text and shapes.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let blur_value = global.parseFloat(parameters[0]);
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^([xy])?bord/,
                /**
                 * Handles outline widths.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let outline_width = global.parseFloat(parameters[1]);
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^([1-4])?c/,
                /**
                 * Handles color settings.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                            sabre.cleanRawColor(/** @private @type {string} */ (parameters[1])),
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
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^clip/,
                /**
                 * Handles text/drawing clipping.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let p1 = global.parseInt(parameters[0], 10);
                    let p2 = global.parseInt(parameters[1], 10);
                    if (global.isNaN(p1) || global.isNaN(p2)) {
                        let scale = 1;
                        if (!global.isNaN(p1)) {
                            scale = p1;
                        }
                        let drawString = parameters[1] ?? parameters[0];
                        if (drawString === null) return;
                        lineGlobalOverrides.setClip(
                            scale,
                            /** @type {string} */ (drawString)
                        );
                    } else {
                        let x1 = p1;
                        let y1 = p2;
                        let x2 = global.parseInt(parameters[2], 10);
                        let y2 = global.parseInt(parameters[3], 10);

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
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^fad/,
                /**
                 * Handles basic fade animation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^fade/,
                /**
                 * Handles advanced fade animation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    t3 = timeInfo.start + t3 / 1000;
                    t4 = timeInfo.start + t4 / 1000;
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^fa([xy])/,
                /**
                 * Handles shearing.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let factor = global.parseFloat(parameters[1]);
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^fe/,
                /**
                 * Handles encoding.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^fn/,
                /**
                 * Handles switching fonts.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    overrides.setFontName(/** string */ fontName);
                }
            },
            {
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^fr([xyz])?/,
                /**
                 * Handles rotation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let value = global.parseFloat(parameters[1]);
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^fs([+-])?/,
                /**
                 * Increases or decreases font size, or sets font size.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                        let font_size_modifier = global.parseFloat(
                            parameters[1]
                        );
                        if (add_to)
                            overrides.increaseFontSizeMod(font_size_modifier);
                        else overrides.decreaseFontSizeMod(font_size_modifier);
                    } else {
                        let font_size = global.parseFloat(parameters[1]);
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^fsc([xy])/,
                /**
                 * Handles font scaling.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let value = global.parseFloat(parameters[1]);
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^fsp/,
                /**
                 * Handles font spacing.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let value = global.parseFloat(parameters[0]);
                    if (isNaN(value)) return;
                    if (!isInTransition) {
                        overrides.setSpacing(value);
                    } else {
                        transitionTargetOverrides.setSpacing(value);
                    }
                }
            },
            {
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^i/,
                /**
                 * Handles italicization.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    if (!value && value !== 0) return;
                    overrides.setItalic(value !== 0);
                }
            },
            {
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^iclip/,
                /**
                 * Handles inverse text/drawing clipping.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let p1 = global.parseInt(parameters[0], 10);
                    let p2 = global.parseInt(parameters[1], 10);
                    if (global.isNaN(p1) || global.isNaN(p2)) {
                        let scale = 1;
                        if (!global.isNaN(p1)) {
                            scale = p1;
                        }
                        let drawString = parameters[1] ?? parameters[0];
                        if (drawString === null) return;
                        lineGlobalOverrides.setClip(
                            scale,
                            /** @type {string} */ (drawString)
                        );
                    } else {
                        let x1 = p1;
                        let y1 = p2;
                        let x2 = global.parseInt(parameters[2], 10);
                        let y2 = global.parseInt(parameters[3], 10);

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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^([kK][fot]?)/,
                /**
                 * Handles karaoke.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let param = global.parseFloat(parameters[1]);
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
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^move/,
                /**
                 * Handles motion animation.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^org/,
                /**
                 * Handles setting rotation origin.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^p/,
                /**
                 * Handles setting draw mode.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let drawScale = global.parseFloat(parameters[0]);
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
                "ignore_exterior": false,
                "regular_expression": /^pbo/,
                /**
                 * Handles Baseline offset.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
                    setStyle,
                    overrides,
                    lineGlobalOverrides,
                    addLineTransitionTargetOverrides,
                    parameters,
                    isInTransition,
                    transitionTargetOverrides,
                    lineGlobalTransitionTargetOverrides
                ) {
                    let baselineOffset = global.parseFloat(parameters[0]);
                    if (isNaN(baselineOffset)) return;
                    overrides.setBaselineOffset(baselineOffset);
                }
            },
            {
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^pos/,
                /**
                 * Handles setting the position.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^q/,
                /**
                 * Handles wrapping style.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                "ass_only": false,
                "ignore_exterior": false,
                "regular_expression": /^r/,
                /**
                 * Handles changing or resetting styling.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let style_name = parameters[0];
                    if (
                        typeof style_name !== "undefined" &&
                        style_name !== null &&
                        style_name !== ""
                    )
                        setStyle(
                            getStyleByName(style_name) ?? getStyleByName("Default")
                        );
                }
            },
            {
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^s/,
                /**
                 * Handles strikethrough.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    if (!value && value !== 0) return;
                    overrides.setStrikeout(value !== 0);
                }
            },
            {
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^([xy])?shad/,
                /**
                 * Handles drop shadow.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    let value = global.parseFloat(parameters[1]);
                    if (isNaN(value)) return;
                    if (!isInTransition) {
                        switch (setting) {
                            case "x":
                                overrides.setShadowX(value);
                                break;
                            case "y":
                                overrides.setShadowY(value);
                                break;
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
                "ass_only": true,
                "ignore_exterior": true,
                "regular_expression": /^t/,
                /**
                 * Handles transitions.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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

                    let temp = global.parseFloat(lparameters[0]);
                    let temp2;
                    if (global.isNaN(temp)) {
                        final_param = lparameters.join(",");
                        if (
                            !gassert(INVALID_T_FUNCTION_TAG, final_param !== "")
                        )
                            return;
                    } else {
                        temp2 = global.parseFloat(lparameters[1]);
                        if (!global.isNaN(temp2)) {
                            transitionStart = temp / 1000;
                            transitionEnd = temp2 / 1000;
                            temp = global.parseFloat(lparameters[2]);
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

                    final_param = _parseTransitionTags(
                        timeInfo,
                        getStyleByName,
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
                "ass_only": true,
                "ignore_exterior": false,
                "regular_expression": /^u/,
                /**
                 * Handles underline.
                 * @param {{start:number,end:number}} timeInfo
                 * @param {function(string):SSAStyleDefinition} getStyleByName
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
                "tag_handler": function (
                    timeInfo,
                    getStyleByName,
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
                    if (!value && value !== 0) return;
                    overrides.setUnderline(value !== 0);
                }
            }
        ]);
    }
    return override_tags;
}