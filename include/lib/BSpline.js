/**
 * @constructor
 */
sabre.BSpline = function (
    /** Array<number> */ points,
    /** number */ degree,
    /** boolean */ copy
) {};
sabre.BSpline.prototype.calcAt = /** @returns {Array<number>} */ function (
    /** number */ t
) {
    return [0, 0];
};
