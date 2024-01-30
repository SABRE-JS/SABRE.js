/**
 * Defines collision modes.
 * @private
 * @enum {number}
 */
sabre.CollisionModes = {
    NORMAL: 0,
    REVERSE: 1
};

/**
 * Defines karaoke modes.
 * @private
 * @enum {number}
 */
sabre.KaraokeModes = {
    OFF: 0,
    COLOR_SWAP: 1,
    COLOR_SWEEP: 2,
    OUTLINE_TOGGLE: 3
};

/**
 * Defines different border style modes.
 * @private
 * @enum {number}
 */
sabre.BorderStyleModes = {
    NONE: 0,
    NORMAL: 1,
    UNKNOWN: 2,
    SRT_STYLE: 3,
    SRT_NO_OVERLAP: 4
};

/**
 * Defines passes.
 * @private
 * @enum {number}
 */
sabre.RenderPasses = {
    BACKGROUND: 0,
    OUTLINE: 1,
    FILL: 2
};

/**
 * Defines wrap style modes.
 * @private
 * @enum {number}
 */
sabre.WrapStyleModes = {
    SMART: 0,
    EOL: 1,
    NONE: 2,
    SMART_INVERSE: 3
};

/**
 * Defines the different color spaces internally.
 * @private
 * @enum {number}
 */
sabre.ColorSpaces = {
    RGB: 0,
    BT601_TV: 1,
    BT601_PC: 2,
    BT709_TV: 3,
    BT709_PC: 4,
    BT2020_TV: 5,
    BT2020_PC: 6,
    BT2020_CL_TV: 7,
    BT2020_CL_PC: 8,
    BT2100_PQ: 9,
    BT2100_HLG: 10,
    SMPTE240M_TV: 32,
    SMPTE240M_PC: 33,
    FCC_TV: 34,
    FCC_PC: 35,
    DISPLAY_P3: 36
}

/**
 * Defines all native display color spaces for the browser.
 * @private
 * @enum {number}
 */
sabre.NativeColorSpaces = {
    RGB: sabre.ColorSpaces.RGB,
    DISPLAY_P3: sabre.ColorSpaces.DISPLAY_P3,
    BT2100_PQ: sabre.ColorSpaces.BT2100_PQ, // For when browsers support this.
    BT2100_HLG: sabre.ColorSpaces.BT2100_HLG // For when browsers support this.
};

/**
 * Defines Color Mangling modes for different color spaces.
 * @private
 * @enum {number}
 */
sabre.ColorManglingModes = {
    DEFAULT: sabre.ColorSpaces.BT601_TV,
    NONE: -1,
    RGB: sabre.ColorSpaces.RGB,
    BT601_TV: sabre.ColorSpaces.BT601_TV,
    BT601_PC: sabre.ColorSpaces.BT601_PC,
    BT709_TV: sabre.ColorSpaces.BT709_TV,
    BT709_PC: sabre.ColorSpaces.BT709_PC,
    BT2020_TV: sabre.ColorSpaces.BT2020_TV,
    BT2020_PC: sabre.ColorSpaces.BT2020_PC,
    BT2020_CL_TV: sabre.ColorSpaces.BT2020_CL_TV,
    BT2020_CL_PC: sabre.ColorSpaces.BT2020_CL_PC,
    BT2100_PQ: sabre.ColorSpaces.BT2100_PQ,
    BT2100_HLG: sabre.ColorSpaces.BT2100_HLG,
    SMPTE240M_TV: sabre.ColorSpaces.SMPTE240M_TV,
    SMPTE240M_PC: sabre.ColorSpaces.SMPTE240M_PC,
    FCC_TV: sabre.ColorSpaces.FCC_TV,
    FCC_PC: sabre.ColorSpaces.FCC_PC,
    //Skip 36 as it is Display-P3 which video can't use.
};

/**
 * 
 */
/**
 * Defines the different color spaces externally.
 * @public
 * @enum {number}
 */
external.VideoColorSpaces = {
    AUTOMATIC: -1,
    AUTOMATIC_PC: -2,
    RGB: sabre.ColorSpaces.RGB,
    BT601_TV: sabre.ColorSpaces.BT601_TV,
    BT601_PC: sabre.ColorSpaces.BT601_PC,
    BT709_TV: sabre.ColorSpaces.BT709_TV,
    BT709_PC: sabre.ColorSpaces.BT709_PC,
    BT2020_TV: sabre.ColorSpaces.BT2020_TV,
    BT2020_PC: sabre.ColorSpaces.BT2020_PC,
    BT2100_PQ: sabre.ColorSpaces.BT2100_PQ,
    BT2100_HLG: sabre.ColorSpaces.BT2100_HLG,
    SMPTE240M_TV: sabre.ColorSpaces.SMPTE240M_TV,
    SMPTE240M_PC: sabre.ColorSpaces.SMPTE240M_PC,
    FCC_TV: sabre.ColorSpaces.FCC_TV,
    FCC_PC: sabre.ColorSpaces.FCC_PC
};

/**
 * Defines a list of types of color space conversions.
 * @private
 * @enum {number}
 */
sabre.ColorSpaceConversionTypes = {
    NON_CONSTANT_LUMINANCE: 0,
    CONSTANT_LUMINANCE: 1,
    PERCEPTUAL_QUANTIZATION: 2, //TODO: Implement this
    HYBRID_LOG_GAMMA: 3 //TODO: Implement this
};

/**
 * Defines a non-constant luminance color space conversion.
 * @typedef {!{type:number,offset:!Array<number>,toRGB:!Array<number>,toDisplayP3:!Array<number>,fromRGB:!Array<number>}}
 */
let NonConstantLuminanceColorSpaceConversion;

/**
 * Defines a constant luminance color space conversion.
 * @typedef {!{type:number,offset:!Array<number>,scale:!Array<number>,coefficients:!Array<number>,Nr:number,Nb:number,Pr:number,Pb:number}}
 */
let ConstantLuminanceColorSpaceConversion;

/**
 * Defines conversions between color spaces for the renderer.
 * @const {!Object<number,(ConstantLuminanceColorSpaceConversion|NonConstantLuminanceColorSpaceConversion)>}
 */
sabre.ColorSpaceConversionTable = {};