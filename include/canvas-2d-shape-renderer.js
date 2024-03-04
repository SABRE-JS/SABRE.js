/**
 * @typedef {!{
 *              renderEvent:function(number,SSASubtitleEvent,number,boolean):void,
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
let Canvas2DShapeRenderer;

/**
 * @type {function(new:Canvas2DShapeRenderer)}
 */
sabre.Canvas2DShapeRenderer = function () {};
