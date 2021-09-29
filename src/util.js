/*
 |   sabre-util.js
 |----------------
 |  sabre-util.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */
/**
 * @fileoverview utility code and polyfills.
 */
//ONE TIME WARN CODE
(function (global, exterior) {
    const ComplaintPrototype = {
        "grumble": {
            value: function () {
                if (!this._grumbled) {
                    console.warn(this._issue + "\tgrumble... grumble...");
                    this._grumbled = true;
                }
            },
            writable: false
        },
        "reset": {
            value: function () {
                this._grumbled = false;
            },
            writable: false
        }
    };
    const allComplaints = [];
    /**
     * Creates a new complaint.
     * @constructor
     * @param {string} warning the warning to display.
     */
    const Complaint = function (warning) {
        warning = warning.trim().replace(/\.+$/, "").trim() + ".";
        var newComplaint = global.Object.seal(
            global.Object.create(
                { _issue: warning, _grumbled: false },
                ComplaintPrototype
            )
        );
        allComplaints.push(newComplaint);
        return newComplaint;
    };
    /**
     * Reset all Complaint states.
     */
    Complaint["resetAll"] = function () {
        allComplaints.forEach(function (val) {
            val["reset"]();
        });
    };
    exterior["Complaint"] = global.Object.freeze(Complaint);
})(global, sabre);
//END ONE TIME WARN CODE

global.Math.trunc =
    global.Math.trunc ||
    function (a) {
        return a < 0 ? Math.ceil(a) : Math.floor(a);
    };
global.requestAnimationFrame = (function () {
    return (
        global.requestAnimationFrame ??
        global.webkitRequestAnimationFrame ??
        global.mozRequestAnimationFrame ??
        global.msRequestAnimationFrame ??
        global.oRequestAnimationFrame ??
        function (callback) {
            global.setTimeout(callback, 1000 / 60);
        }
    );
})();

const lehex = function (value) {
    var result = [];
    for (var bytes = 4; bytes > 0; bytes--) {
        result.push(String.fromCharCode(value & 255));
        value >>= 8;
    }
    return result.join("");
};

/**
 * Performs a transition between two numbers given current time, start, end, and acceleration.
 * @param {number} curtime current time relative to event start.
 * @param {number} originalValue the original value.
 * @param {?number} transitionValue the target value.
 * @param {number} start start time of transition.
 * @param {number} end end time of transition.
 * @param {number} acceleration the acceleration value.
 * @returns {number} the result of the transition.
 */
sabre["performTransition"] = function (
    curtime,
    originalValue,
    transitionValue,
    start,
    end,
    acceleration
) {
    if (transitionValue === null || curtime < start) return originalValue;
    if (curtime >= end) return transitionValue;
    var percent = Math.max(
        0,
        Math.min(Math.pow((curtime - start) / (end - start), acceleration), 1)
    );
    return originalValue / percent + transitionValue * percent;
};

//implement toBlob on systems that don't support it in a manner that avoids using costly dataurls
const canvas2blob = function (callback /*, type, quality*/) {
    var tempCanvas = null;
    if (typeof global.OffscreenCanvas === "undefined") {
        tempCanvas = global.document.createElement("canvas");
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
    } else {
        tempCanvas = new global.OffscreenCanvas(this.width, this.height);
    }
    var ctx = tempCanvas.getContext("2d");
    ctx.drawImage(this, 0, 0);
    var imgdata = ctx.getImageData(0, 0, this.width, this.height);
    var header =
        "BM" +
        lehex(
            (imgdata.data.length || 4 * this.width * this.height) + 14 + 108
        ) +
        "\x00\x00" +
        "\x00\x00" +
        "\x7A\x00\x00\x00" +
        "\x6C\x00\x00\x00" +
        lehex(imgdata.width || this.width) +
        lehex(imgdata.height || this.height) +
        "\x01\x00" +
        "\x20\x00" +
        "\x03\x00\x00\x00" +
        lehex(imgdata.data.length || 4 * this.width * this.height) +
        "\x13\x0B\x00\x00" +
        "\x13\x0B\x00\x00" +
        "\x00\x00\x00\x00" +
        "\x00\x00\x00\x00" +
        "\x00\x00\xFF\x00" +
        "\x00\xFF\x00\x00" +
        "\xFF\x00\x00\x00" +
        "\x00\x00\x00\xFF" +
        "\x42\x47\x52\x73";
    var i;
    for (i = 0; i < 0x24; i++) header += "\x00";
    header += "\x00\x00\x00\x00" + "\x00\x00\x00\x00" + "\x00\x00\x00\x00";
    var arr = new ArrayBuffer(
        (imgdata.data.length || 4 * this.width * this.height) +
            header.length +
            4 -
            (header.length % 4)
    );
    var bytes = new Uint8Array(arr);
    var longs = new Uint32Array(arr);
    for (i = 0; i < header.length; i++) {
        bytes[i] = header.charCodeAt(i);
    }
    var k = Math.ceil(header.length / 4);
    for (var j = 0; j < (imgdata.width || this.width); j++) {
        for (var l = 0; l < (imgdata.height || this.height); l++) {
            i = (imgdata.width || this.width) * l + j;
            var n =
                (imgdata.width || this.width) *
                    ((imgdata.height || this.height) - l) -
                ((imgdata.width || this.width) - j) +
                k;
            if (imgdata.data.length === 0) {
                longs[n] = 0x00000000;
                continue;
            }
            longs[n] =
                (imgdata.data[i * 4 + 1] << 24) |
                    (imgdata.data[i * 4 + 2] << 16) |
                    (imgdata.data[i * 4 + 3] << 8) |
                    imgdata.data[i * 4 + 0] || 0;
        }
    }
    callback(new Blob([arr], { type: "image/bmp" }));
};

global.HTMLCanvasElement.prototype["toBlob"] =
    global.HTMLCanvasElement.prototype["toBlob"] ?? canvas2blob;
global.HTMLCanvasElement.prototype["toBlobHD"] =
    global.HTMLCanvasElement.prototype["toBlobHD"] ??
    global.HTMLCanvasElement.prototype["toBlob"];

if (typeof global.OffscreenCanvas !== "undefined") {
    global.OffscreenCanvas.prototype["toBlob"] =
        global.OffscreenCanvas.prototype["toBlob"] ?? canvas2blob;
    global.OffscreenCanvas.prototype["toBlobHD"] =
        global.OffscreenCanvas.prototype["toBlobHD"] ??
        global.OffscreenCanvas.prototype["toBlob"];
}

/**
 * Compare two strings for equality ignoring case.
 * @param {string} a String 1 in comparison.
 * @param {string} b string 2 in comparison.
 * @return {boolean} Equal or not.
 */
sabre["stringEqualsCaseInsensitive"] = function (a, b) {
    return typeof a === "string" && typeof b === "string"
        ? a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0
        : a === b;
};

/**
 * Round number n to p places.
 * @param {number} n Number to round.
 * @param {number} p Number of places.
 * @return {number} Rounded result.
 */
sabre["roundTo"] = function (n, p) {
    var value = +n.toFixed(p);
    var q = +(n - value + this.pow(10, -(p + 2))).toFixed(p + 1);
    var test = q >= this.pow(10, -(p + 1)) * 5;
    value += test ? this.pow(10, -p) : 0;
    return value;
};

sabre["pixelRatio"] = global.devicePixelRatio || 1;
/**
 * Get Backing pixel ratio for a canvas context.
 * @param {CanvasRenderingContext2D} context the target context.
 * @return {number} Backing Pixel Ratio.
 */
sabre["getBackingRatio"] = function (context) {
    return (
        context.webkitBackingStorePixelRatio ??
        context.mozBackingStorePixelRatio ??
        context.msBackingStorePixelRatio ??
        context.oBackingStorePixelRatio ??
        context.backingStorePixelRatio ??
        1
    );
};
