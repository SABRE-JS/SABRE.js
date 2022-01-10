/**
 * @typedef {!{
 *              toJSON:function():string,
 *              setId:function(number):void,
 *              getId:function():number,
 *              setOrder:function(number):void,
 *              getOrder:function():number,
 *              setNewLine:function(boolean):void,
 *              isNewLine:function():boolean,
 *              setStart:function(number):void,
 *              getStart:function():number,
 *              setEnd:function(number):void,
 *              getEnd:function():number,
 *              setText:function(string):void,
 * 				getText:function():string,
 *              setLayer:function(number):void,
 * 				getLayer:function():number,
 *              setStyle:function(SSAStyleDefinition):void,
 * 				getStyle:function():SSAStyleDefinition,
 *              setOverrides:function(SSAStyleOverride):void,
 *              getOverrides:function():SSAStyleOverride,
 *              setLineOverrides:function(SSALineStyleOverride):void,
 *              getLineOverrides:function():SSALineStyleOverride,
 *              addLineTransitionTargetOverrides:function(SSALineTransitionTargetOverride):void,
 *              setLineTransitionTargetOverrides:function(Array<SSALineTransitionTargetOverride>):void,
 *              getLineTransitionTargetOverrides:function():Array<SSALineTransitionTargetOverride>
 *          }}
 */
var SSASubtitleEvent;

/**
 * @type {function(new:SSASubtitleEvent)}
 */
sabre.SSASubtitleEvent = function () {};
