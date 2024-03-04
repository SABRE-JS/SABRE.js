/**
 * @typedef {!{getFontsAndInfo:function(string):Array<{
 *              font:Font,
 *              ascent:number,
 *              descent:number,
 *              strikethroughSize:number,
 *              strikethroughPosition:number,
 *              underlineThickness:number,
 *              underlinePosition:number,
 *              weight:number,
 *              selection:number
 *          }>}}
 */
let FontServer;
/**
 * @type {function(new:FontServer,RendererData)}
 */
sabre.FontServer = function(a){};