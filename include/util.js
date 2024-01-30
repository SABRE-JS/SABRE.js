/**
 * Creates a new Complaint(one shot warning).
 * @constructor
 * @param {string} warning The warning to display.
 */
sabre.Complaint = function (warning) {};
/**
 * Call this to grumble.
 */
sabre.Complaint.prototype.grumble = function () {};
/**
 * Rest the Complaint.
 */
sabre.Complaint.prototype.reset = function () {};
/**
 * Reset all Complaint states.
 */
sabre.Complaint.resetAll = function () {};

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
sabre.performTransition = function (
    curtime,
    originalValue,
    transitionValue,
    start,
    end,
    acceleration
) {
    return 1;
};

/**
 * Clone a SSASubtitleEvent, but leave the text uncloned, don't copy newline state.
 * @param {SSASubtitleEvent} event
 * @return {SSASubtitleEvent} the clone.
 */
sabre.cloneEventWithoutText = function (event) {
    return new sabre.SSASubtitleEvent();
};

/**
 * Freezes an object and all of its own child properties.
 * @param {!Object} obj the object to freeze.
 * @return {!Object} the frozen object.
 */
sabre.totalObjectFreeze = function (obj) {
    return {};
}

/**
 * Hashes an object or array.
 * @private
 * @param {(!Object|!Array<*>)} obj Object or Array to hash.
 * @return {number} The hash of the object or array.
 */
sabre.hashObject = function (obj) {
    return 0;
};

/**
 * Round number n to p places.
 * @param {number} n Number to round.
 * @param {number} p Number of places.
 * @return {number} Rounded result.
 */
sabre.roundTo = function (n, p) {
    return 0;
};

/**
 * Compare two strings for equality ignoring case.
 * @param {string} a String 1 in comparison.
 * @param {string} b string 2 in comparison.
 * @return {boolean} Equal or not.
 */
sabre.stringEqualsCaseInsensitive = function (a, b) {
    return true;
};

/**
 * Get Device pixel ratio.
 * @return {number} Device Pixel Ratio.
 */
sabre.getPixelRatio = function(){
    return 1;
};

/**
 * Get Backing pixel ratio for a canvas context.
 * @param {CanvasRenderingContext2D} context the target context.
 * @return {number} Backing Pixel Ratio.
 */
sabre.getBackingRatio = function (context) {
    return 1;
};
