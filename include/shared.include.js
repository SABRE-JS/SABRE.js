/**
 * @type {Window}
 */
var global;

global.sabre = {};

var sabre = global.sabre;

var external = global.sabre;

/**
 * @type {(undefined|function(string):Object)}
 */
var require = function (a) {
    return {};
};

global.module = {};

global.module.exports = {};

var module = global.module;

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
/** @type {number|undefined} */
global.HTMLVideoElement.prototype.mozFrameDelay = 0;
/** @type {number|undefined} */
global.HTMLVideoElement.prototype.mozPresentedFrames = 0;

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

/**
 * @typedef{{x1:number,y1:number,x2:number,y2:number}}
 */
var BoundingBox;

/**
 * @typedef {{fill:?string,stroke:?string,draw:function(CanvasRenderingContext2D):void}}
 */
var Path;

/**
 * @typedef {{advanceWidth:number,getBoundingBox:function():BoundingBox,getPath:function(number, number, number):Path}}
 */
var Glyph;

/**
 * @typedef {{unitsPerEm:number,ascender:number,descender:number,tables:{post:{underlineThickness:number,underlinePosition:number},os2:{yStrikeoutSize:number,yStrikeoutPosition:number,usWeightClass:number,fsSelection:number,usWinAscent:number,usWinDescent:number,sTypoAscent:number,sTypoDescent:number},name:{unicode:?{fullName:{en:string},fontFamily:{en:string},fontSubfamily:{en:string}},macintosh:?{fullName:{en:string},fontFamily:{en:string},fontSubfamily:{en:string}},windows:?{fullName:{en:string},fontFamily:{en:string},fontSubfamily:{en:string}}}},stringToGlyphs:function(string):Array<Glyph>,getKerningValue:function(Glyph,Glyph):number}}
 */
var Font;
