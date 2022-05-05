/**
 * @type {Window}
 */
var global;

global.sabre = {};

var external = global.sabre;

//support AMD
global.define = function (id, dependancies, factory) {
    return;
};

global.define.amd = {};
global.define.amd.multiversion = false;

//This is internal to the wrapper that is applied to the compiled output.
var sabre = {};
sabre.$ = null;

//These are definitions for APIs the closure compiler doesn't know by default.
global.CanvasRenderingContext2D.prototype.resetTransform = function () {};
/** @type {number} */
global.CanvasRenderingContext2D.prototype.webkitBackingStorePixelRatio = 1;
/** @type {number} */
global.CanvasRenderingContext2D.prototype.mozBackingStorePixelRatio = 1;
/** @type {number} */
global.CanvasRenderingContext2D.prototype.msBackingStorePixelRatio = 1;
/** @type {number} */
global.CanvasRenderingContext2D.prototype.oBackingStorePixelRatio = 1;
/** @type {number} */
global.CanvasRenderingContext2D.prototype.backingStorePixelRatio = 1;

/**
 * toBlob but HD.
 * @return {Blob} the result.
 */
global.HTMLCanvasElement.prototype.toBlobHD = function () {};

/**
 * toBlob but HD.
 * @return {Blob} the result.
 */
global.OffscreenCanvas.prototype.toBlobHD = function () {};
