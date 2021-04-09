var global = window;

window = null;

global.sabre = {};

var external = global.sabre;

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

var sabre = {};
sabre.$ = null;
