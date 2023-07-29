/**
 * @typedef {!{
 *              calcBounds:function(number,SSASubtitleEvent):void,
 *              startEventRender:function(number,SSASubtitleEvent,number,boolean):number,
 *              renderGlyph:function(number,SSASubtitleEvent,number,boolean):boolean,
 *              setRequestFont:function(!function(string):!{font:Font,foundItalic:boolean,foundWeight:number}):void,
 *              setPixelScaleRatio:function(number,number):void,
 *              getOffset:function():Array<number>,
 *              getOffsetExternal:function():Array<number>,
 *              getDimensions:function():Array<number>,
 *              getTextureDimensions:function():Array<number>,
 *              getBounds:function():Array<number>,
 *              getExtents:function():Array<number>,
 *              getImage:function():(HTMLCanvasElement|OffscreenCanvas)
 *          }}
 */
var Canvas2DTextRenderer;

/**
 * @type {function(new:Canvas2DTextRenderer)}
 */
sabre.Canvas2DTextRenderer = function () {};
