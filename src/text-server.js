/*
 |   text-server.js
 |-----------------
 |  text-server.js is copyright Patrick Rhodes Martin et. al 2024.
 |
 |-
 */
//@include [global-constants]
//@include [util]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]


const text_server_prototype = Object.create(Object, {

    _buffer: {
        /**
         * The buffer for the text server.
         * @type {Uint8Array}
         */
        value: null,
        writable: true
    },

    _position: {
        /**
         * The current position in the buffer.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _lastPosition: {
        /**
         * The last position in the buffer.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    "hasNext": {
        /**
         * Returns true if the text server has more data.
         * @return {boolean} True if the text server has more data.
         */
        value: function hasNext() {
            return this._position < this._buffer.byteLength;
        },
        writable: false
    },

    "getBytes": {
        /**
         * Get the next number of bytes from the buffer.
         * @param {number} bytes The number of bytes to get.
         */
        value: function getBytes(bytes) {
            this._lastPosition = this._position;
            let result = this._buffer.subarray(this._position, this._position += bytes);
            return result;
        },
        writable: false
    },

    "next": {
        /**
         * Return string up to one of a specific set of strings in the buffer using the codepage specified (as provided by codepages package).
         * @param {number} codepage The codepage to use.
         * @param {Array<string>} delimiters The delimiters to use.
         * @return {string} The next string.
         */
        value: function next(codepage, delimiters) {
            let passthrough = false;
            if (this._position >= this._buffer.length)
                throw "End of buffer reached.";
            if(codepage === sabre.CodePages.CUSTOM){
                codepage = sabre.CodePages.ANSI;
                passthrough = true;
            }
            const delimiter_buffers = delimiters.map((delimiter) => {
                return global.cptable.utils.encode(codepage,delimiter);
            });

            for(let i = this._position; i < this._buffer.length; i++) {
                for(let j = 0; j < delimiter_buffers.length; j++) {
                    let delimiter = delimiter_buffers[j];
                    let found = true;
                    for(let k = 0; k < delimiter.length; k++) {
                        if(this._buffer[i + k] !== delimiter[k]) {
                            found = false;
                            break;
                        }
                    }
                    if(found) {
                        let subarr = this._buffer.subarray(this._position, i);
                        let result;
                        if(!passthrough){
                            result = global.cptable.utils.decode(codepage, subarr);
                        } else {
                            result = global.String.fromCharCode.apply(String, subarr);
                        }
                        this._lastPosition = this._position;
                        this._position = i + delimiter.length;
                        return result;
                    }
                }
            }
            this._lastPosition = this._position;
            this._position = this._buffer.length;
            return global.cptable.utils.decode(codepage, this._buffer.subarray(this._lastPosition));
        },
        writable: false
    },

    "rewind": {
        /**
         * Rewind the text server to the last position.
         * @return {number}
         */
        value: function rewind() {
            let result = this._position;
            this._position = this._lastPosition;
            return result;
        },
        writable: false
    },

    "fastforward": {
        /**
         * Skip a number of bytes in the buffer.
         * @param {number} bytes The number of bytes to skip.
         * @return {void}
         */
        value: function fastforward(bytes) {
            this._lastPosition = this._position;
            this._position = bytes;
        },
        writable: false
    }
});

/**
 * @typedef {!{
 *    hasNext: function():boolean,
 *    getBytes: function(number):Uint8Array,
 *    next: function(number, Array<string>):string,
 *    rewind: function():number,
 *    fastforward: function(number):void
 * }}
 * @private
 */
let TextServer;

/**
 * TextServer is a class for reading text from a buffer.
 * @type {function(new:TextServer, ArrayBuffer)}
 */
sabre["TextServer"] = function TextServer(buffer) {
    let text_server = Object.create(text_server_prototype);
    text_server._buffer = new Uint8Array(buffer);
    text_server._position = 0;
    text_server._lastPosition = 0;
    return text_server;
}