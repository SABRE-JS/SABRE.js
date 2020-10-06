/**
 * @typedef {!{
 *              toJSON:function():string,
 *              setStart:function(num):void,
 *              getStart:function():num,
 *              setEnd:function(num):void,
 *              getEnd:function():num,
 *              setText:function(string):void,
 * 				getText:function():string,
 *              setLayer:function(num):void,
 * 				getLayer:function():num,
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