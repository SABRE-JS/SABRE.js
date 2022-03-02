/*
 |   global-constants.js
 |----------------
 |  global-constants.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */
/**
 * Defines collision modes.
 * @enum {number}
 */
sabre["CollisionModes"] = Object.freeze({
    "NORMAL": 0,
    "REVERSE": 1
});
/**
 * Defines karaoke modes.
 * @enum {number}
 */
sabre["KaraokeModes"] = Object.freeze({
    "OFF": 0,
    "COLOR_SWAP": 1,
    "COLOR_SWEEP": 2,
    "OUTLINE_TOGGLE": 3
});
/**
 * Defines different border style modes.
 * @enum {number}
 */
sabre["BorderStyleModes"] = Object.freeze({
    "NONE": 0,
    "NORMAL": 1,
    "UNKNOWN": 2,
    "SRT_STYLE": 3,
    "SRT_NO_OVERLAP": 4
});
/**
 * Defines passes.
 * @enum {number}
 */
sabre["RenderPasses"] = Object.freeze({
    "BACKGROUND": 0,
    "OUTLINE": 1,
    "FILL": 2
});
/**
 * Defines wrap style modes.
 * @enum {number}
 */
sabre["WrapStyleModes"] = Object.freeze({
    "SMART": 0,
    "EOL": 1,
    "NONE": 2,
    "SMART_INVERSE": 3
});
