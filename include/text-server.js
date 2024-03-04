/**
 * @typedef {!{
 *     hasNext: function():boolean,
 *     getBytes: function(number):Uint8Array,
 *     next: function(number, Array<string>):string,
 *     rewind: function():number,
 *     fastforward: function(number):void,
 * }}
 */
let TextServer;

/**
 * @type {function(new:TextServer, ArrayBuffer)}
 */
sabre.TextServer = function () {};