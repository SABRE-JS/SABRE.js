/**
 * @typedef {!{
 *              load:function(!string,!string,number),
 *              updateOption:function(!string,(number|!Array<number>|!TypedArray)):boolean,
 *              addOption:function(!string,(number|!Array<number>|!TypedArray),!string):boolean,
 *              bindShader:function((!WebGLRenderingContext|!WebGL2RenderingContext)),
 *              getShader:function():WebGLProgram,
 *              getAttribute:function((!WebGLRenderingContext|!WebGL2RenderingContext),string):number,
 *              compile:function((!WebGLRenderingContext|!WebGL2RenderingContext),Object=,function(),string=),
 *          }}
 */
let Shader;

/**
 * @type {function(new:Shader)}
 */
sabre.Shader = function () {};

sabre.Shader.resetStateEngine = function () {};
