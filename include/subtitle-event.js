/**
 * @typedef {!{
 *              toJSON:function():string,
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
 *              getOverrides:function():SSAStyleOverride
 *          }}
 */
var SSASubtitleEvent;

/**
 * @type {function(new:SSASubtitleEvent)}
 */
sabre.SSASubtitleEvent = function(){};