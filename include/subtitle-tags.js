/**
 * @private
 * @typedef {!{
 *  ass_only:boolean,
 *  ignore_exterior:boolean,
 *  regular_expression:RegExp,
 *  tag_handler:function(
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
 * @type {function():Array<OverrideTag>}
 */
sabre.getOverrideTags = function () {return null};
