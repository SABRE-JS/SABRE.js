/**
 * @typedef {{
 *      load:function({info:Object,parser:Object,renderer:Object,events:Array<SSASubtitleEvent>}):void,
 *      frame:function(number):void,
 *      getDisplayUri:function():string,
 *      updateViewport:function(number,number):void,
 * }}
 */
var SSARenderer;

/**
 * @type {function(new:SSARenderer)}
 */
sabre.Renderer = function () {};
