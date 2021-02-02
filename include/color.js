/**
 * @typedef {!{
 *              toJSON:function():string,
 *              getRGBA:function():Array<number>,
 *              getRGB:function():Array<number>,
 *              getR:function():number,
 *              getG:function():number,
 *              getB:function():number,
 *              getA:function():number,
 *              getYUVA:function():Array<number>,
 *              getYUV:function():Array<number>,
 *              getYCbCrA:function():Array<number>,
 *              getYCbCr:function():Array<number>
 * }}
 */
var SSAColor;

/**
 * @type {function(new:SSAColor,number=,number=,number=,number=)}
 */
sabre.SSAColor = function (r, g, b, a) {};

/**
 * @typedef {!{
 *              toJSON:function():string,
 *              clone:function():SSAOverrideColor,
 *              applyOverride:function(SSAColor):SSAColor,
 *              getR:function():number,
 *              setR:function(?number):void,
 *              getG:function():number,
 *              setG:function(?number):void,
 *              getB:function():number,
 *              setB:function(?number):void,
 *              getA:function():number,
 *              setA:function(?number):void,
 * }}
 */
var SSAOverrideColor;

/**
 * @type {function(new:SSAOverrideColor,?number=,?number=,?number=,?number=)}
 */
sabre.SSAOverrideColor = function (r, g, b, a) {};
