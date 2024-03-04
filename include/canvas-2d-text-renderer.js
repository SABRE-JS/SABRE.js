/**
 * @typedef {!{
*              calcBounds:function(number,SSASubtitleEvent):void,
*              startEventRender:function(number,SSASubtitleEvent,number,boolean):number,
*              nextGlyph:function():{prevGlyph:?Glyph,glyph:?Glyph,breakOut:boolean},
*              positionCachedGlyph:function({prevGlyph:?Glyph,glyph:?Glyph,breakOut:boolean}):void,
*              renderGlyph:function(number,SSASubtitleEvent,{prevGlyph:?Glyph,glyph:?Glyph,breakOut:boolean},number,boolean):boolean,
*              setRequestFont:function(!function(string,number,boolean):!{font:Font,foundItalic:boolean,foundWeight:number}):void,
*              setPixelScaleRatio:function(number,number):void,
*              setScaledOutlineAndShadowEnabled:function(boolean):void,
*              getOffset:function():Array<number>,
*              getOffsetExternal:function():Array<number>,
*              getDimensions:function():Array<number>,
*              getTextureDimensions:function():Array<number>,
*              getBounds:function():Array<number>,
*              getExtents:function():Array<number>,
*              getImage:function():(HTMLCanvasElement|OffscreenCanvas)
*          }}
*/
let Canvas2DTextRenderer;

/**
 * @type {function(new:Canvas2DTextRenderer)}
 */
sabre.Canvas2DTextRenderer = function () {};
