/**
 * @typedef {!{
 *      toJSON:function():string,
 *      clone:function():SSAStyleOverride,   
 *      getMargins:function():?Array<num>,
 *      getEffect:function():?string,
 *      
 * }}
 */
var SSAStyleOverride;

/**
 * @type {function(new:SSAStyleOverride)}
 */
sabre.SSAStyleOverride = function(){};