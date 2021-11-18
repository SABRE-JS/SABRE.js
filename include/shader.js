/**
 * @typedef {!{
 *              load:function(!string,!string,number),
 *              updateOption:function(!string,(number|!Array<number>)):boolean,
 *              addOption:function(!string,(number|!Array<number>),!string):boolean,
 *              bindShader:function((!WebGLRenderingContext|!WebGL2RenderingContext)),
 *              getShader:function():WebGLProgram,
 *              compile:function((!WebGLRenderingContext|!WebGL2RenderingContext),Object=,function(),string=),
 *          }}
 */
var Shader;

/**
 * @type {function(new:Shader)}
 */
sabre.Shader = function () {};

sabre.Shader.resetStateEngine = function () {};
