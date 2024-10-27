/*
 |   sabre-util.js
 |----------------
 |  sabre-util.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]
/**
 * @fileoverview utility code and polyfills.
 */
//ONE TIME WARN CODE
(function (global, exterior) {
    const ComplaintPrototype = {
        "grumble": {
            value: function grumble () {
                if (!this._grumbled) {
                    console.warn(this._issue + "\tgrumble... grumble...");
                    this._grumbled = true;
                }
            },
            writable: false
        },
        "reset": {
            value: function reset () {
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
    const Complaint = function Complaint (warning) {
        warning = warning.trim().replace(/\.+$/, "").trim() + ".";
        let newComplaint = global.Object.seal(
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
    Complaint["resetAll"] = function resetAll () {
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

(function (global) {
    global.requestAnimationFrame = (function (global) {
        return (
            global.requestAnimationFrame ??
            global.webkitRequestAnimationFrame ??
            global.mozRequestAnimationFrame ??
            global.msRequestAnimationFrame ??
            global.oRequestAnimationFrame ??
            function (callback) {
                return global.setTimeout(callback, 1000 / 60);
            }
        );
    })(global);

    global.cancelAnimationFrame = (function (global) {
        return (
            global.cancelAnimationFrame ??
            global.webkitCancelAnimationFrame ??
            global.mozCancelAnimationFrame ??
            global.msCancelAnimationFrame ??
            global.oCancelAnimationFrame ??
            function (id) {
                global.clearTimeout(id);
            }
        );
    })(global);
})(global);

(function (global) {
    const frameIdCount = 1024;

    let shownTimeAlert = false;
    let animationFrameId = null;
    let currentFrameId = 0;

    const repaintTimes = [0, 0, 0];

    const callbackRanges = [];
    const callbacks = [];

    const videoList = [];
    const lastVideoMetrics = {};


    function getMetricForVideo (video) {
        let metric = video.mozPresentedFrames ?? null;
        if (
            typeof video.getVideoPlaybackQuality === "undefined" ||
            metric !== null
        ) {
            return metric;
        } else {
            let quality = video.getVideoPlaybackQuality();
            if(quality) return quality.totalVideoFrames - quality.droppedVideoFrames;
            else return video.currentTime;
        }
    }

    /**
     * Checks if the video has updated.
     * @modifies callbackRanges
     * @param {number} currentTime high res time.
     */
    function checkForNewVideoFrame (currentTime) {
        if (currentTime >= Number.MAX_SAFE_INTEGER && !shownTimeAlert) {
            shownTimeAlert = true;
            if (
                global.confirm(
                    "Warning:\n\tThis webpage has been open for a long time" +
                        " and may begin to have issues as a result.\n\t" +
                        "Please press ok to refresh the page to fix this or" +
                        " cancel so that you may backup any work.\n\tAfter doing" +
                        " so please refresh the page."
                )
            ) {
                global.location.reload();
            }
        }

        const avgRepaintTime =
            (repaintTimes[0] + repaintTimes[1] + repaintTimes[2]) / 3;
        const videosChanged = {};
        
        let rangeIndex = -1;
        let newFrameId = false;

        while(++rangeIndex < callbackRanges.length){
            if(callbackRanges[rangeIndex].frameId.value !== currentFrameId) continue;
            const currentCallbackRange = callbackRanges[rangeIndex];
            let shouldRemoveCurrentRange = false;
            currentCallbackRange.frameId.noEdit = true;
            const currentCallbacksEnd = currentCallbackRange.callbacksStart + currentCallbackRange.callbacksCount;
            for (let i = currentCallbackRange.callbacksStart; i < currentCallbacksEnd; i++) {
                if (callbacks[i] === null){
                    if(currentCallbackRange.callbacksStart === i){
                        currentCallbackRange.callbacksStart++;
                    }    
                    continue;
                }
                const videoid = callbacks[i].videoid;
                const video = videoList[callbacks[i].videoid];
                const callback = callbacks[i].callback;
                const metric = getMetricForVideo(video);
                let isNewFrame = videosChanged[videoid] ?? true;
                if (!videosChanged[videoid]) {
                    const currentMetric = metric ?? NaN;
                    const lastMetric = lastVideoMetrics[videoid] ?? NaN;
                    lastVideoMetrics[videoid] = currentMetric;
                    isNewFrame = currentMetric !== lastMetric;
                }
                videosChanged[videoid] = isNewFrame;
                if (isNewFrame) {
                    newFrameId = true;
                    if (--currentCallbackRange.callbacksCount === 0) {
                        shouldRemoveCurrentRange = true;
                    } else if(currentCallbackRange.callbacksStart === i)
                        currentCallbackRange.callbacksStart++;
                    else currentCallbackRange.callbacksCount++;
                    callbacks[i] = null;
                    let presentTime = currentTime + avgRepaintTime;
                    callback.call(video, currentTime, {
                        "presentationTime": currentTime,
                        "expectedDisplayTime": presentTime,
                        "width": video.videoWidth ?? video.width,
                        "height": video.videoHeight ?? video.height,
                        "mediaTime":
                            video.currentTime +
                            (performance.now() - presentTime) / 1000,
                        "presentedFrames": metric ?? -1,
                        "processingDuration": video.mozFrameDelay ?? 0
                    });
                }
            }
            if (shouldRemoveCurrentRange){
                callbackRanges.shift();
                rangeIndex--;
            }
        }

        if (newFrameId && ++currentFrameId >= frameIdCount) {
            currentFrameId = 0;
        }

        if (callbackRanges.length > 0) {
            animationFrameId = global.requestAnimationFrame(
                checkForNewVideoFrame
            );
        } else {
            animationFrameId = null;
        }
        repaintTimes[0] = repaintTimes[1];
        repaintTimes[1] = repaintTimes[2];
        repaintTimes[2] = performance.now() - currentTime;
    }

    global.HTMLVideoElement.prototype["requestVideoFrameCallback"] = (function (
        global
    ) {
        return (
            global.HTMLVideoElement.prototype["requestVideoFrameCallback"] ??
            global.HTMLVideoElement.prototype[
                "webkitRequestVideoFrameCallback"
            ] ??
            global.HTMLVideoElement.prototype["mozRequestVideoFrameCallback"] ??
            global.HTMLVideoElement.prototype["msRequestVideoFrameCallback"] ??
            global.HTMLVideoElement.prototype["oRequestVideoFrameCallback"] ??
            function (cb) {
                let vid = this;
                const lastCallbackRangeIndex = callbackRanges.length - 1;
                const earliestAvailableUnusedIndex = (function () {
                    let earliest = 0;
                    const processingNextFrame = callbackRanges.length > 0;
                    let i = 0;
                    if (processingNextFrame){
                        do {
                            const rangeEnd = callbackRanges[i].callbacksStart + callbackRanges[i].callbacksCount;
                            if(callbackRanges[i].callbacksStart <= earliest && rangeEnd - 1 >= earliest){
                                earliest = rangeEnd;
                            }
                        } while(callbackRanges[i].frameId.noEdit && ++i <= lastCallbackRangeIndex);
                    }
                    if(i <= lastCallbackRangeIndex){
                        return callbacks.indexOf(null, earliest);
                    }else return callbacks.length;
                })();
                const earliestAvailableNullCallbackIndexFromEnd = (function () {
                    let earliestIndex = callbacks.length;
                    let i;
                    for (i = lastCallbackRangeIndex; i >= 0; i--) {
                        const currentRange = callbackRanges[i];
                        if(currentRange.frameId.noEdit || currentRange.frameId.value !== callbackRanges[0].frameId.value) break;
                        if (currentRange.callbacksStart < earliestIndex) {
                            earliestIndex = currentRange.callbacksStart;
                            break;
                        }
                    }
                    if(i >= 0) {
                        return callbacks.indexOf(null,earliestIndex);
                    } else return callbacks.length;
                })();
                let id = ((earliestAvailableUnusedIndex >= 0 && earliestAvailableUnusedIndex < earliestAvailableNullCallbackIndexFromEnd) ? earliestAvailableUnusedIndex : earliestAvailableNullCallbackIndexFromEnd);
                let videoId = videoList.indexOf(vid);
                if(videoId === -1){
                    videoId = videoList.push(vid) - 1;
                }
                callbacks[id] = { video: vid, callback: cb, videoid: videoId};
                let callbackRange = lastCallbackRangeIndex >= 0 ? callbackRanges[lastCallbackRangeIndex] : null;
                const localLastFrameId = callbackRange ? callbackRange.frameId : { value: -1, noEdit: true };
                {
                    let newRange = !callbackRange;
                    if (callbackRange && !callbackRange.frameId.noEdit) {
                        if(id < callbackRange.callbacksStart){
                            let clearBetween = true;
                            for(let i = callbackRange.callbacksStart-1; i > id && i > 0; i--){
                                if(callbacks[i] !== null){
                                    clearBetween = false;
                                    break;
                                }
                            }
                            if(clearBetween){
                                callbackRange.callbacksCount += callbackRange.callbacksStart - id;
                                callbackRange.callbacksStart = id;

                            } else newRange = true;
                        }else if (id >= callbackRange.callbacksStart + callbackRange.callbacksCount) {
                            let clearBetween = true;
                            for(let i = callbackRange.callbacksStart + callbackRange.callbacksCount; i < id && i < callbacks.length; i++){
                                if(callbacks[i] !== null){
                                    clearBetween = false;
                                    break;
                                }
                            }
                            if(clearBetween){
                                callbackRange.callbacksCount = id - callbackRange.callbacksStart + 1;
                            } else newRange = true;
                        }
                        // we don't do anything if it's already in the range, as it's already scheduled.
                    } else newRange = true;
                    if(newRange){
                        const potentialNewFrameId = ( !localLastFrameId.noEdit ? localLastFrameId : { value: (localLastFrameId.value < frameIdCount-1 ? localLastFrameId.value + 1 : 0), noEdit: false });
                        callbackRange = {
                            frameId: potentialNewFrameId,
                            callbacksStart: id,
                            callbacksCount: 1,
                        }
                        callbackRanges.push(callbackRange);
                    }
                }
                if (animationFrameId === null) {
                    animationFrameId = global.requestAnimationFrame(
                        checkForNewVideoFrame
                    );
                }
                return id;
            }
        );
    })(global);

    global.HTMLVideoElement.prototype["cancelVideoFrameCallback"] = (function (
        global
    ) {
        return (
            global.HTMLVideoElement.prototype["cancelVideoFrameCallback"] ??
            global.HTMLVideoElement.prototype[
                "webkitCancelVideoFrameCallback"
            ] ??
            global.HTMLVideoElement.prototype["mozCancelVideoFrameCallback"] ??
            global.HTMLVideoElement.prototype["msCancelVideoFrameCallback"] ??
            global.HTMLVideoElement.prototype["oCancelVideoFrameCallback"] ??
            function (id) {
                if (callbacks[id] && callbacks[id].video === this) {
                    const parentCallbackRangeIndex = (function(){
                        for(let i = 0; i < callbackRanges.length; i++){
                            const callbacksStart = callbackRanges[i].callbacksStart;
                            const callbacksEnd = callbacksStart + callbackRanges[i].callbacksCount;
                            if(callbacksStart <= id && id < callbacksEnd){
                                return i;
                            }
                        }
                        return NaN;
                    })();
                    const parentCallbackRange = callbackRanges[parentCallbackRangeIndex];
                    // We can edit in this case even if the noEdit flag is set, because we're removing a callback.
                    if (parentCallbackRange.callbacksStart === id) {
                        parentCallbackRange.callbacksStart++;
                        parentCallbackRange.callbacksCount--;
                    } else if(parentCallbackRange.callbacksStart + parentCallbackRange.callbacksCount === id - 1){
                        parentCallbackRange.callbacksCount--;
                    }
                    // We can remove the range if it's empty and not a noEdit flagged frame.
                    if (parentCallbackRange.callbacksCount <= 0 && !parentCallbackRange.frameId.noEdit) {
                        callbackRanges.splice(parentCallbackRangeIndex, 1);
                    }
                    callbacks[id] = null;
                }
            }
        );
    })(global);
})(global);

/**
 * Sets groups of values in an Arrayish object with a stride and offset.
 * @param {!Int8Array|!Uint8Array|!Uint8ClampedArray|!Int16Array|!Uint16Array|!Uint32Array|!BigInt64Array|!BigUint64Array|!Float32Array|!Float64Array|!Array<?>|!string} dest The target sequence.
 * @param {!Int8Array|!Uint8Array|!Uint8ClampedArray|!Int16Array|!Uint16Array|!Uint32Array|!BigInt64Array|!BigUint64Array|!Float32Array|!Float64Array|!Array<?>|!string} src The source sequence.
 * @param {number} stride The number of elements to skip between each group.
 * @param {number} gsize The number of elements in each group.
 * @param {number} offset The starting index in the target sequence.
 */
sabre["setArrayishWithStride"] = function setArrayishWithStride (
    dest,
    src,
    stride,
    gsize,
    offset
) {
    for(let i = 0; i < (src.length/gsize)|0; i++) {
        for (let j = 0; j < gsize; j++) {
            const groupIndex = i*gsize;
            const strideIndex = i*stride;
            dest[offset+strideIndex+j] = src[groupIndex+j];
        }
    }
};

/**
 * Performs a transition between two numbers given current time, start, end, and acceleration.
 * @param {number} curtime current time relative to event start.
 * @param {number} originalValue the original value.
 * @param {?number} transitionValue the target value.
 * @param {number} start start time of transition.
 * @param {number} end end time of transition.
 * @param {number} acceleration the acceleration value.
 * @return {number} the result of the transition.
 */
sabre["performTransition"] = function performTransition (
    curtime,
    originalValue,
    transitionValue,
    start,
    end,
    acceleration
) {
    if (transitionValue === null || curtime < start) return originalValue;
    if (curtime >= end || end <= start) return transitionValue;
    let percent = Math.max(
        0,
        Math.min(Math.pow((curtime - start) / (end - start), acceleration), 1)
    );
    return originalValue * (1 - percent) + transitionValue * percent;
};

/**
 * Clone a SSASubtitleEvent, but leave the text uncloned, don't copy newline state.
 * @param {SSASubtitleEvent} event
 * @return {SSASubtitleEvent} the clone.
 */
sabre["cloneEventWithoutText"] = function cloneEventWithoutText (event) {
    let new_event = new sabre.SSASubtitleEvent();
    new_event.setId(event.getId());
    new_event.setStart(event.getStart());
    new_event.setEnd(event.getEnd());
    new_event.setLayer(event.getLayer());
    new_event.setStyle(event.getStyle());
    new_event.setOverrides(event.getOverrides());
    new_event.setLineOverrides(event.getLineOverrides());
    new_event.setLineTransitionTargetOverrides(
        event.getLineTransitionTargetOverrides()
    );
    new_event.setNewLine(false);
    return new_event;
};

const lehex = function (value) {
    let result = [];
    for (let bytes = 4; bytes > 0; bytes--) {
        result.push(String.fromCharCode(value & 255));
        value >>= 8;
    }
    return result.join("");
};

//implement toBlob on systems that don't support it in a manner that avoids using costly dataurls
const canvasToBlobPolyfill = function canvasToBlobPolyfill(callback /*, type, quality*/) {
    let tempCanvas = null;
    if (typeof global.OffscreenCanvas === "undefined") {
        tempCanvas = global.document.createElement("canvas");
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
    } else {
        tempCanvas = new global.OffscreenCanvas(this.width, this.height);
    }
    let ctx = tempCanvas.getContext("2d");
    ctx.drawImage(this, 0, 0);
    let imgdata = ctx.getImageData(0, 0, this.width, this.height);
    let header =
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
    let i;
    for (i = 0; i < 0x24; i++) header += "\x00";
    header += "\x00\x00\x00\x00" + "\x00\x00\x00\x00" + "\x00\x00\x00\x00";
    let arr = new ArrayBuffer(
        (imgdata.data.length || 4 * this.width * this.height) +
            header.length +
            4 -
            (header.length % 4)
    );
    let bytes = new Uint8Array(arr);
    let longs = new Uint32Array(arr);
    for (i = 0; i < header.length; i++) {
        bytes[i] = header.charCodeAt(i);
    }
    let k = Math.ceil(header.length / 4);
    for (let j = 0; j < (imgdata.width || this.width); j++) {
        for (let l = 0; l < (imgdata.height || this.height); l++) {
            i = (imgdata.width || this.width) * l + j;
            let n =
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

if (typeof global.HTMLCanvasElement !== "undefined") {
    global.HTMLCanvasElement.prototype["toBlob"] =
        global.HTMLCanvasElement.prototype["toBlob"] ?? canvasToBlobPolyfill;
    global.HTMLCanvasElement.prototype["toBlobHD"] =
        global.HTMLCanvasElement.prototype["toBlobHD"] ??
        global.HTMLCanvasElement.prototype["toBlob"];
}

if (typeof global.OffscreenCanvas !== "undefined") {
    global.OffscreenCanvas.prototype["toBlob"] =
        global.OffscreenCanvas.prototype["toBlob"] ??
        (typeof global.OffscreenCanvas.prototype.convertToBlob !== "undefined"
            ? function offscreenCanvasToBlob(callback, type, quality) {
                  this.convertToBlob({ "type": type, "quality": quality }).then(
                      callback
                  );
              }
            : null) ??
            canvasToBlobPolyfill;
    global.OffscreenCanvas.prototype["toBlobHD"] =
        global.OffscreenCanvas.prototype["toBlobHD"] ??
        global.OffscreenCanvas.prototype["toBlob"];
}

if (typeof global.CanvasRenderingContext2D !== "undefined") {
    /**
     * Polyfill for CanvasRenderingContext2D.resetTransform
     * @return {void}
     */
    global.CanvasRenderingContext2D.prototype["resetTransform"] =
        global.CanvasRenderingContext2D.prototype["resetTransform"] ??
        function () {
            this.setTransform(1, 0, 0, 1, 0, 0);
        };
}

/**
 * Freezes an object and all of its own child properties.
 * @param {!Object} obj the object to freeze.
 * @return {!Object} the frozen object.
 */
sabre["totalObjectFreeze"] = function totalObjectFreeze (obj) {
    let queue = [obj];
    do{
        let cur = queue.shift();
        let keys = Object.getOwnPropertyNames(cur);
        for (let i = 0; i < keys.length; i++){
            if(typeof(cur[keys[i]]) === "object" && cur[keys[i]] !== null){
                queue.push(cur[keys[i]] = Object.freeze(cur[keys[i]]));
            }
        }
    }while (queue.length > 0);

    return Object.freeze(obj);
};

/**
 * Fixes JSON that is being hashed.
 * @private
 * @param {string} key the key of the field of the object.
 * @param {*} value the value of the field of the object.
 * @return {*}
 */
const hashJSONFixHelper = function hashJSONFixHelper(key, value) {
    if (value === null) return "null";
    else if (typeof value === "number" && global.isNaN(value)) return "NaN";
    return value;
};

/**
 * Hashes an object or array.
 * @param {(!Object|!Array<*>)} obj Object or Array to hash.
 * @return {number} The hash of the object or array.
 */
sabre["hashObject"] = function hashObject (obj) {
    let str_rep = JSON.stringify(obj, hashJSONFixHelper);
    let hash = 0,
        i,
        chr;
    if (str_rep.length === 0) return hash;
    for (i = 0; i < str_rep.length; i++) {
        chr = str_rep.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

/**
 * Compare two strings for equality ignoring case.
 * @param {string} a String 1 in comparison.
 * @param {string} b string 2 in comparison.
 * @return {boolean} Equal or not.
 */
sabre["stringEqualsCaseInsensitive"] = function stringEqualsCaseInsensitive (a, b) {
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
sabre["roundTo"] = function roundTo (n, p) {
    let value = +n.toFixed(p);
    let q = +(n - value + this.pow(10, -(p + 2))).toFixed(p + 1);
    let test = q >= this.pow(10, -(p + 1)) * 5;
    value += test ? this.pow(10, -p) : 0;
    return value;
};

sabre["getPixelRatio"] = function getPixelRatio () {
    return global.devicePixelRatio ?? 1;
};
/**
 * Get Backing pixel ratio for a canvas context.
 * @param {CanvasRenderingContext2D} context the target context.
 * @return {number} Backing Pixel Ratio.
 */
sabre["getBackingRatio"] = function getBackingRatio (context) {
    return (
        context.backingStorePixelRatio ??
        context.webkitBackingStorePixelRatio ??
        context.mozBackingStorePixelRatio ??
        context.msBackingStorePixelRatio ??
        context.oBackingStorePixelRatio ??
        1
    );
};
