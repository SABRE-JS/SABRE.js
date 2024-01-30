/*
 |   color.js
 |----------------
 |  color.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */

/**
 * Cleanup a raw color string.
 * @param {string} raw the raw string.
 * @return {string} the cleaned string.
 * @private
 */
sabre["cleanRawColor"] = function cleanRawColor (raw) {
    return raw.replace(
        /^[&H]*(?:0x)?((?:[0-9a-fA-F][0-9a-fA-F])+)[&H]*/,
        "$1"
    );
};
    
sabre["SSAColor"] = function SSAColor (r, g, b, a) {
    let obj = {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    };
    if (typeof r === "number") {
        if (r > 1.0 || r < 0) {
            if (typeof g === "undefined") {
                let n = r;
                r = (n & 0xff) / 255;
                n = n >>> 8;
                g = (n & 0xff) / 255;
                n = n >>> 8;
                b = (n & 0xff) / 255;
                n = n >>> 8;
                a = (255 - (n & 0xff)) / 255;
            } else {
                r = (r & 0xff) / 255;
                g = (g & 0xff) / 255;
                b = (b & 0xff) / 255;
                a = (a & 0xff) / 255;
            }
        }
        obj.r = r;
        obj.g = g;
        obj.b = b;
        obj.a = a;
    }

    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
                return [obj.r, obj.g, obj.b, obj.a];
            },
            writable: false
        },

        "getRGBA": {
            value: function getRGBA () {
                return [obj.r, obj.g, obj.b, obj.a];
            },
            writable: false
        },

        "getRGB": {
            value: function getRGB () {
                return [obj.r, obj.g, obj.b];
            },
            writable: false
        },

        "getR": {
            value: function getR () {
                return obj.r;
            },
            writable: false
        },

        "getG": {
            value: function getG () {
                return obj.g;
            },
            writable: false
        },

        "getB": {
            value: function getB () {
                return obj.b;
            },
            writable: false
        },

        "getA": {
            value: function getA () {
                return obj.a;
            },
            writable: false
        }
    });
};

sabre["SSAOverrideColor"] = function SSAOverrideColor (r, g, b, a) {
    let obj = {
        r: null,
        g: null,
        b: null,
        a: null
    };
    if (typeof r === "number") {
        if (r <= 1.0) obj.r = r;
        else obj.r = (r & 0xff) / 255;
    }
    if (typeof g === "number") {
        if (r <= 1.0) obj.g = g;
        else obj.g = (g & 0xff) / 255;
    }
    if (typeof b === "number") {
        if (r <= 1.0) obj.b = b;
        else obj.b = (b & 0xff) / 255;
    }
    if (typeof a === "number") {
        if (r <= 1.0) obj.a = a;
        else obj.a = (a & 0xff) / 255;
    }

    return Object.create(Object, {
        "toJSON": {
            value: function toJSON () {
                return [obj.r, obj.g, obj.b, obj.a];
            },
            writable: false
        },

        "clone": {
            value: function clone () {
                return new sabre["SSAOverrideColor"](
                    obj.r,
                    obj.g,
                    obj.b,
                    obj.a
                );
            },
            writable: false
        },

        "applyOverride": {
            value: function applyOverride (color) {
                let r = color["getR"]();
                let g = color["getG"]();
                let b = color["getB"]();
                let a = color["getA"]();

                if (obj.r !== null) r = obj.r;
                if (obj.g !== null) g = obj.g;
                if (obj.b !== null) b = obj.b;
                if (obj.a !== null) a = obj.a;
                return new sabre["SSAColor"](r, g, b, a);
            }
        },

        "getR": {
            value: function getR () {
                return obj.r;
            },
            writable: false
        },

        "setR": {
            value: function setR (r) {
                if (typeof r === "number") obj.r = r;
                else obj.r = null;
                return obj.r;
            },
            writable: false
        },

        "getG": {
            value: function getG () {
                return obj.g;
            },
            writable: false
        },

        "setG": {
            value: function setG (g) {
                if (typeof g === "number") obj.g = g;
                else obj.g = null;
                return obj.g;
            },
            writable: false
        },

        "getB": {
            value: function getB () {
                return obj.b;
            },
            writable: false
        },

        "setB": {
            value: function setB (b) {
                if (typeof b === "number") obj.b = b;
                else obj.b = null;
                return obj.b;
            },
            writable: false
        },

        "getA": {
            value: function getA () {
                return obj.a;
            },
            writable: false
        },

        "setA": {
            value: function setA (a) {
                if (typeof a === "number") obj.a = a;
                else obj.a = null;
                return obj.a;
            },
            writable: false
        }
    });
};
