/**
 * indexOf but regex.
 * @param {(string|RegExp)} searchValue value to search for.
 * @param {number=} fromIndex starting index.
 * @return {number} index.
 */
global.String.prototype.regexIndexOf = function (searchValue, fromIndex) {};
/**
 * lastIndexOf but regex.
 * @param {(string|RegExp)} searchValue value to search for.
 * @param {number=} fromIndex starting index.
 * @return {number} index.
 */
global.String.prototype.regexLastIndexOf = function (searchValue, fromIndex) {};
/**
 * perform all regex replaces in the object.
 * @param {Object<string,string>} obj replaces to perform.
 * @return {string} result.
 */
global.String.prototype.allReplace = function (obj) {};

/**
 * Get an Element's position.
 * @param {Element} element the element to locate.
 * @return {Array<number>} the x and y of the element;
 */
sabre.getElementPos = function (element) {};

/**
 * clones an object.
 * @param {Object} obj the object to clone
 * @return {Object} the cloned object.
 */
sabre.cloneObject = function (obj) {};
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

/**
 * On Animation Frame.
 */
sabre.onFrame = function () {};
