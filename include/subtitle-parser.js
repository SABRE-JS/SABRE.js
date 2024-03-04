/**
 * @typedef {!{info:Object,parser:Object,fontserver:Array<Font>,renderer:{events:Array<SSASubtitleEvent>}}}
 */
let RendererData;

/**
 * @typedef {!{
 *      load:function(string,function(RendererData):void):void
 * }}
 */
let SSAParser;

/**
 * @type {function(new:SSAParser)}
 */
sabre.Parser = function () {};
