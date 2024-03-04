/**
 * @typedef {{
 *      load:function(RendererData):void,
 *      setColorSpace:function(number):void,
 *      updateViewport:function(number,number):void,
 *      canRender:function():boolean,
 *      frame:function(number):void,
 *      getDisplayUri:function(function(string):void):void,
 *      getDisplayBitmap:function():?ImageBitmap,
 *      copyToCanvas:function((HTMLCanvasElement|OffscreenCanvas),boolean):void
 * }}
 */
let SSARenderer;

/**
 * @type {function(new:SSARenderer)}
 */
sabre.Renderer = function () {};
