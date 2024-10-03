/*
 |   color.js
 |----------------
 |  color.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */

/**
 * Convert n-bit arbitrarily-ordered color to a Object containing floating point representations of it's components.
 * @param {number} color the n-bit color.
 * @param {number=} bitDepth the bit depth of the color components (defaults to 8).
 * @param {Array<string>=} componentOrder the order of the color components (defaults to ABGR).
 * @param {Array<boolean>=} invertChannel whether to invert the coresponding channel (defaults to [true,false,false,false]).
 * @return {Object<string,number>} the resulting color data.
 * @private
 */
function colorToArray (color, bitDepth, componentOrder, invertChannel) {
    let components = ["r", "g", "b", "a"];
    if(typeof componentOrder === "object" && Array.isArray(componentOrder)) {
        components = componentOrder.slice().reverse();
    }
    invertChannel = invertChannel ?? [true, false, false, false];
    if(invertChannel.length !== components.length)
        throw new Error("invertChannel must be the same length as componentOrder.");
    bitDepth = bitDepth ?? 8;
    if(bitDepth < 1 || bitDepth > 32)
        throw new Error("bitDepth must be between 1 and 32 (inclusive).");
    if(components.length * bitDepth > 32)
        throw new Error("Unable to represent color with more than 32 bits.");
    const result = {};
    let i;
    const mask = (1 << bitDepth) - 1;
    for (i = 0; i < components.length; i++) {
        result[components[i]] = (color & mask) / mask;
        color = color >>> bitDepth;
    }
    for (i = 0; i < invertChannel.length; i++){
        result[components[i]] = 1 - result[components[i]];
    }
    return result;
}

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
    
sabre["SSAColor"] = function SSAColor (r, g, b, a, bitDepth) {
    const obj = {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    };
    
    if (typeof r === "number") {
        if(typeof g !== "number") {
            Object.assign(obj, colorToArray(r, bitDepth ?? 8));
        } else {
            if(typeof bitDepth !== "number") {
                obj.r = r;
                obj.g = g;
                obj.b = b;
                obj.a = a;
            }else{
                obj.r = r / ((1 << bitDepth) - 1);
                obj.g = g / ((1 << bitDepth) - 1);
                obj.b = b / ((1 << bitDepth) - 1);
                obj.a = a / ((1 << bitDepth) - 1);
            }
        }
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
        obj.r = r;
    }
    if (typeof g === "number") {
        obj.g = g;
    }
    if (typeof b === "number") {
        obj.b = b;
    }
    if (typeof a === "number") {
        obj.a = a;
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
