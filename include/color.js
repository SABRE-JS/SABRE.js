/**
 * @typedef {!{
 *              toJSON:function():string,
 *              getRGBA:function():Array<num>,
 *              getRGB:function():Array<num>,
 *              getR:function():num,
 *              getG:function():num,
 *              getB:function():num,
 *              getA:function():num,
 *              getYUVA:function():Array<num>,
 *              getYUV:function():Array<num>,
 *              getYCbCrA:function():Array<num>,
 *              getYCbCr:function():Array<num>
 * }}
 */
var SSAColor;

/**
 * @type {function(new:SSAColor,num=,num=,num=,num=)}
 */
sabre.SSAColor = function(r,g,b,a){};

/**
 * @typedef {!{
 *              toJSON:function():string,
 *              clone:function():SSAOverrideColor,
 *              applyOverride:function(SSAColor):SSAColor,
 *              getR:function():num,
 *              setR:function(num):void,
 *              getG:function():num,
 *              setG:function(num):void,
 *              getB:function():num,
 *              setB:function(num):void,
 *              getA:function():num,
 *              setA:function(num):void,
 * }}
 */
var SSAOverrideColor;

/**
 * @type {function(new:SSAOverrideColor,?num=,?num=,?num=,?num=)}
 */
sabre.SSAOverrideColor = function(r,g,b,a){};