/**
@license
Licence of this file:

The MIT License (MIT)

Copyright Tagussan (c) 2014 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/**
 * @constructor
 */
function BSpline(points, degree, copy) {
    if (copy) {
        this.points = [];
        for (var i = 0; i < points.length; i++) {
            this.points.push(points[i]);
        }
    } else {
        this.points = points;
    }
    this.degree = degree;
    this.dimension = points[0].length;
    if (degree == 2) {
        this.baseFunc = this.basisDeg2;
        this.baseFuncRangeInt = 2;
    } else if (degree == 3) {
        this.baseFunc = this.basisDeg3;
        this.baseFuncRangeInt = 2;
    } else if (degree == 4) {
        this.baseFunc = this.basisDeg4;
        this.baseFuncRangeInt = 3;
    } else if (degree == 5) {
        this.baseFunc = this.basisDeg5;
        this.baseFuncRangeInt = 3;
    }
}

BSpline.prototype.seqAt = function (dim) {
    var points = this.points;
    var margin = this.degree + 1;
    return function (n) {
        if (n < margin) {
            return points[0][dim];
        } else if (points.length + margin <= n) {
            return points[points.length - 1][dim];
        } else {
            return points[n - margin][dim];
        }
    };
};

BSpline.prototype.basisDeg2 = function (x) {
    if (-0.5 <= x && x < 0.5) {
        return 0.75 - x * x;
    } else if (0.5 <= x && x <= 1.5) {
        return 1.125 + (-1.5 + x / 2.0) * x;
    } else if (-1.5 <= x && x < -0.5) {
        return 1.125 + (1.5 + x / 2.0) * x;
    } else {
        return 0;
    }
};

BSpline.prototype.basisDeg3 = function (x) {
    if (-1 <= x && x < 0) {
        return 2.0 / 3.0 + (-1.0 - x / 2.0) * x * x;
    } else if (1 <= x && x <= 2) {
        return 4.0 / 3.0 + x * (-2.0 + (1.0 - x / 6.0) * x);
    } else if (-2 <= x && x < -1) {
        return 4.0 / 3.0 + x * (2.0 + (1.0 + x / 6.0) * x);
    } else if (0 <= x && x < 1) {
        return 2.0 / 3.0 + (-1.0 + x / 2.0) * x * x;
    } else {
        return 0;
    }
};

BSpline.prototype.basisDeg4 = function (x) {
    if (-1.5 <= x && x < -0.5) {
        return (
            55.0 / 96.0 +
            x *
                (-(5.0 / 24.0) +
                    x * (-(5.0 / 4.0) + (-(5.0 / 6.0) - x / 6.0) * x))
        );
    } else if (0.5 <= x && x < 1.5) {
        return (
            55.0 / 96.0 +
            x * (5.0 / 24.0 + x * (-(5.0 / 4.0) + (5.0 / 6.0 - x / 6.0) * x))
        );
    } else if (1.5 <= x && x <= 2.5) {
        return (
            625.0 / 384.0 +
            x *
                (-(125.0 / 48.0) +
                    x * (25.0 / 16.0 + (-(5.0 / 12.0) + x / 24.0) * x))
        );
    } else if (-2.5 <= x && x <= -1.5) {
        return (
            625.0 / 384.0 +
            x * (125.0 / 48.0 + x * (25.0 / 16.0 + (5.0 / 12.0 + x / 24.0) * x))
        );
    } else if (-1.5 <= x && x < 1.5) {
        return 115.0 / 192.0 + x * x * (-(5.0 / 8.0) + (x * x) / 4.0);
    } else {
        return 0;
    }
};

BSpline.prototype.basisDeg5 = function (x) {
    if (-2 <= x && x < -1) {
        return (
            17.0 / 40.0 +
            x *
                (-(5.0 / 8.0) +
                    x *
                        (-(7.0 / 4.0) +
                            x * (-(5.0 / 4.0) + (-(3.0 / 8.0) - x / 24.0) * x)))
        );
    } else if (0 <= x && x < 1) {
        return (
            11.0 / 20.0 +
            x * x * (-(1.0 / 2.0) + (1.0 / 4.0 - x / 12.0) * x * x)
        );
    } else if (2 <= x && x <= 3) {
        return (
            81.0 / 40.0 +
            x *
                (-(27.0 / 8.0) +
                    x *
                        (9.0 / 4.0 +
                            x * (-(3.0 / 4.0) + (1.0 / 8.0 - x / 120.0) * x)))
        );
    } else if (-3 <= x && x < -2) {
        return (
            81.0 / 40.0 +
            x *
                (27.0 / 8.0 +
                    x *
                        (9.0 / 4.0 +
                            x * (3.0 / 4.0 + (1.0 / 8.0 + x / 120.0) * x)))
        );
    } else if (1 <= x && x < 2) {
        return (
            17.0 / 40.0 +
            x *
                (5.0 / 8.0 +
                    x *
                        (-(7.0 / 4.0) +
                            x * (5.0 / 4.0 + (-(3.0 / 8.0) + x / 24.0) * x)))
        );
    } else if (-1 <= x && x < 0) {
        return (
            11.0 / 20.0 +
            x * x * (-(1.0 / 2.0) + (1.0 / 4.0 + x / 12.0) * x * x)
        );
    } else {
        return 0;
    }
};

BSpline.prototype.getInterpol = function (seq, t) {
    var f = this.baseFunc;
    var rangeInt = this.baseFuncRangeInt;
    var tInt = Math.floor(t);
    var result = 0;
    for (var i = tInt - rangeInt; i <= tInt + rangeInt; i++) {
        result += seq(i) * f.call(this, t - i);
    }
    return result;
};

BSpline.prototype["calcAt"] = function (t) {
    t = t * ((this.degree + 1) * 2 + this.points.length); //t must be in [0,1]
    if (this.dimension == 2) {
        return [
            this.getInterpol(this.seqAt(0), t),
            this.getInterpol(this.seqAt(1), t)
        ];
    } else if (this.dimension == 3) {
        return [
            this.getInterpol(this.seqAt(0), t),
            this.getInterpol(this.seqAt(1), t),
            this.getInterpol(this.seqAt(2), t)
        ];
    } else {
        var res = [];
        for (var i = 0; i < this.dimension; i++) {
            res.push(this.getInterpol(this.seqAt(i), t));
        }
        return res;
    }
};

sabre["BSpline"] = BSpline;
