/**
 * Round number n to p places.
 * @param {number} n Number to round.
 * @param {number} p Number of places.
 * @return {number} Rounded result.
 */
Math.roundTo = function (n, p) {
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

sabre.kill = false;
sabre.pixelRatio = 1.0;
/**
 * Get Backing pixel ratio for a canvas context.
 * @param {CanvasRenderingContext2D} context the target context.
 * @return {number} Backing Pixel Ratio.
 */
sabre.getBackingRatio = function (context) {
    return 1;
};
