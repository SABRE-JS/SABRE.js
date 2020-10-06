/**
 * @typedef {!{
 *              load:function(!string,!string,num),
 *              updateOption:function(!string,(num|!Array<num>)):boolean,
 *              addOption:function(!string,(num|!Array<num>),!string):boolean,
 *              bindShader:function((!WebGLRenderingContext|!WebGL2RenderingContext)),
 *              getShader:function():WebGLProgram,
 *              compile:function((!WebGLRenderingContext|!WebGL2RenderingContext),Object=,function(),string=),
 *          }}
 */
var shaderManager;

/**
 * @type {shaderManager}
 */
sabre.ShaderPrototype;