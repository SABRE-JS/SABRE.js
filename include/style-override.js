/**
 * @typedef {!{
 *      toJSON:function():string,
 *      clone:function():SSAStyleOverride,   
 *      getMargins:function():?Array<number>,
 *      getEffect:function():?string,
 *      
 * }}
 */
var SSAStyleOverride;

/**
 * @type {function(new:SSAStyleOverride)}
 */
sabre.SSAStyleOverride = function(){};