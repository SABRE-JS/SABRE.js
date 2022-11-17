/**
 * @typedef {!{info:Object,parser:Object,fontserver:Array<Font>,renderer:{events:Array<SSASubtitleEvent>}}}
 */
var RendererData;

/**
 * @typedef {{
 *      load:function(string,function(RendererData):void):void
 * }}
 */
var SSAParser;

/**
 * @type {function(new:SSAParser)}
 */
sabre.Parser = function () {};
