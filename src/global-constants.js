/*
 |   global-constants.js
 |----------------
 |  global-constants.js is copyright Patrick Rhodes Martin 2020.
 |
 |-
 */
//@include [util]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]
/**
 * Defines collision modes.
 * @enum {number}
 */
sabre["CollisionModes"] = sabre.totalObjectFreeze({
    "NORMAL": 0,
    "REVERSE": 1
});

/**
 * Defines karaoke modes.
 * @enum {number}
 */
sabre["KaraokeModes"] = sabre.totalObjectFreeze({
    "OFF": 0,
    "COLOR_SWAP": 1,
    "COLOR_SWEEP": 2,
    "OUTLINE_TOGGLE": 3
});

/**
 * Defines different border style modes.
 * @enum {number}
 */
sabre["BorderStyleModes"] = sabre.totalObjectFreeze({
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
sabre["RenderPasses"] = sabre.totalObjectFreeze({
    "BACKGROUND": 0,
    "OUTLINE": 1,
    "FILL": 2
});

/**
 * Defines wrap style modes.
 * @enum {number}
 */
sabre["WrapStyleModes"] = sabre.totalObjectFreeze({
    "SMART": 0,
    "EOL": 1,
    "NONE": 2,
    "SMART_INVERSE": 3
});

/**
 * Defines the code pages supported by the renderer.
 * @private
 * @enum {number}
 */
sabre["CodePages"] = sabre.totalObjectFreeze({
    "ANSI": 1252,
    "UTF8": 65001,
    "CUSTOM": -1,
    "MAC": 10000,
    "SHIFT_JIS": 932,
    "HANGUL": 949,
    "JOHAB": 1361,
    "GB2312": 936,
    "BIG5": 950,
    "GREEK": 1253,
    "TURKISH": 1254,
    "VIETNAMESE": 1258,
    "HEBREW": 1255,
    "ARABIC": 1256,
    "BALTIC": 1257,
    "RUSSIAN": 1251,
    "THAI": 874,
    "EASTERN_EUROPE": 1250,
    "OEM": 850
});

/**
 * Defines the substation alpha IDs of the code pages supported by the renderer.
 * @private
 * @enum {number}
 */
sabre["CodePageIds"] = sabre.totalObjectFreeze({
    "ANSI": 0,
    "UTF8": 1,
    "CUSTOM": 2,
    "MAC": 77,
    "SHIFT_JIS": 128,
    "HANGUL": 129,
    "JOHAB": 130,
    "GB2312": 134,
    "BIG5": 136,
    "GREEK": 161,
    "TURKISH": 162,
    "VIETNAMESE": 163,
    "HEBREW": 177,
    "ARABIC": 178,
    "BALTIC": 186,
    "RUSSIAN": 204,
    "THAI": 222,
    "EASTERN_EUROPE": 238,
    "OEM": 255
});

/**
 * Defines the different color spaces internally.
 * @private
 * @enum {number}
 */
sabre["ColorSpaces"] = sabre.totalObjectFreeze({
    "RGB": 0, // sRGB
    "BT601_TV": 1,
    "BT601_PC": 2,
    "BT709_TV": 3,
    "BT709_PC": 4,
    "BT2020_TV": 5,
    "BT2020_PC": 6,
    "BT2020_CL_TV": 7,
    "BT2020_CL_PC": 8,
    "BT2100_PQ": 9,
    "BT2100_HLG": 10,
    "SMPTE240M_TV": 32,
    "SMPTE240M_PC": 33,
    "FCC_TV": 34,
    "FCC_PC": 35,
    "DISPLAY_P3": 36,
});

/**
 * Defines all native display color spaces for the browser.
 * @private
 * @enum {number}
 */
sabre["NativeColorSpaces"] = {
    "RGB": sabre["ColorSpaces"]["RGB"],
    "DISPLAY_P3": sabre["ColorSpaces"]["DISPLAY_P3"],
    "BT2100_PQ": sabre["ColorSpaces"]["BT2100_PQ"], // For when browsers support this.
    "BT2100_HLG": sabre["ColorSpaces"]["BT2100_HLG"] // For when browsers support this.
};

/**
 * Defines Color Mangling modes for different color spaces.
 * @private
 * @enum {number}
 */
sabre["ColorManglingModes"] = sabre.totalObjectFreeze({
    "DEFAULT": sabre["ColorSpaces"]["BT601_TV"],
    "NONE": -1,
    "RGB": sabre["ColorSpaces"]["RGB"],
    "BT601_TV": sabre["ColorSpaces"]["BT601_TV"],
    "BT601_PC": sabre["ColorSpaces"]["BT601_PC"],
    "BT709_TV": sabre["ColorSpaces"]["BT709_TV"],
    "BT709_PC": sabre["ColorSpaces"]["BT709_PC"],
    "BT2020_TV": sabre["ColorSpaces"]["BT2020_TV"],
    "BT2020_PC": sabre["ColorSpaces"]["BT2020_PC"],
    "BT2020_CL_TV": sabre["ColorSpaces"]["BT2020_CL_TV"],
    "BT2020_CL_PC": sabre["ColorSpaces"]["BT2020_CL_PC"],
    "BT2100_PQ": sabre["ColorSpaces"]["BT2100_PQ"],
    "BT2100_HLG": sabre["ColorSpaces"]["BT2100_HLG"],
    "SMPTE240M_TV": sabre["ColorSpaces"]["SMPTE240M_TV"],
    "SMPTE240M_PC": sabre["ColorSpaces"]["SMPTE240M_PC"],
    "FCC_TV": sabre["ColorSpaces"]["FCC_TV"],
    "FCC_PC": sabre["ColorSpaces"]["FCC_PC"],
    //Skip 36 as it is Display-P3 which video can't use.
});

/**
 * Defines the different color spaces externally.
 * @public
 * @enum {number}
 */
external["VideoColorSpaces"] = sabre.totalObjectFreeze({
    "AUTOMATIC": -1,
    "AUTOMATIC_PC": -2,
    "RGB": sabre["ColorSpaces"]["RGB"],
    "BT601_TV": sabre["ColorSpaces"]["BT601_TV"],
    "BT601_PC": sabre["ColorSpaces"]["BT601_PC"],
    "BT709_TV": sabre["ColorSpaces"]["BT709_TV"],
    "BT709_PC": sabre["ColorSpaces"]["BT709_PC"],
    "BT2020_TV": sabre["ColorSpaces"]["BT2020_TV"],
    "BT2020_PC": sabre["ColorSpaces"]["BT2020_PC"],
    "BT2100_PQ": sabre["ColorSpaces"]["BT2100_PQ"],
    "BT2100_HLG": sabre["ColorSpaces"]["BT2100_HLG"],
    "SMPTE240M_TV": sabre["ColorSpaces"]["SMPTE240M_TV"],
    "SMPTE240M_PC": sabre["ColorSpaces"]["SMPTE240M_PC"],
    "FCC_TV": sabre["ColorSpaces"]["FCC_TV"],
    "FCC_PC": sabre["ColorSpaces"]["FCC_PC"]
     //Skip 36 as it is Display-P3 which video can't use.
});

/**
 * Defines a list of types of color space conversions.
 * @private
 * @enum {number}
 */
sabre["ColorSpaceConversionTypes"] = sabre.totalObjectFreeze({
    "NON_CONSTANT_LUMINANCE": 0,
    "CONSTANT_LUMINANCE": 1,
    "PERCEPTUAL_QUANTIZATION": 2, //TODO: Implement this
    "HYBRID_LOG_GAMMA": 3 //TODO: Implement this
});
/**
 * Defines a non-constant luminance color space conversion.
 * @private
 * @typedef {!{type:number,offset:!Array<number>,toRGB:!Array<number>,toDisplayP3:!Array<number>,fromRGB:!Array<number>}}
 */
let NonConstantLuminanceColorSpaceConversion;

/**
 * Defines a constant luminance color space conversion.
 * @private
 * @typedef {!{type:number,offset:!Array<number>,scale:!Array<number>,coefficients:!Array<number>,Nr:number,Nb:number,Pr:number,Pb:number}}
 */
let ConstantLuminanceColorSpaceConversion;

/**
 * Defines conversions between color spaces for the renderer.
 * @const {!Object<number,(ConstantLuminanceColorSpaceConversion|NonConstantLuminanceColorSpaceConversion)>}
 */
sabre["ColorSpaceConversionTable"] = sabre.totalObjectFreeze({
    [sabre["ColorSpaces"]["RGB"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.000, 0.000, 0.000],
        // prettier-ignore
        "toRGB": [1.000, 0.000, 0.000,
                  0.000, 1.000, 0.000,
                  0.000, 0.000, 1.000],
        // prettier-ignore
        "toDisplayP3": [ 0.737906,  0.232591, 0.0148199
                        -0.0605656, 1.05716,  0.000246902
                        -0.0166685, 0.119825, 0.903059],
        // prettier-ignore
        "fromRGB": [1.000, 0.000, 0.000,
                    0.000, 1.000, 0.000,
                    0.000, 0.000, 1.000]
    },
    [sabre["ColorSpaces"]["BT601_TV"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.06274509803921569, 0.5019607843137255, 0.5019607843137255],
        // prettier-ignore
        "toRGB": [1.164383561643836, -3.214433182618712e-17,  1.596026785714286,
                  1.164383561643836, -0.3917622900949137,    -0.8129676472377709,
                  1.164383561643836,  2.017232142857143,     -1.650752479546251e-17],
        // prettier-ignore
        "toDisplayP3": [0.832602, 0.462069, 1.45856,
                        0.896484, -0.240744, -0.716998,
                        0.737031, 2.40336, 0.0177541],
        // prettier-ignore
        "fromRGB": [ 0.25678823529411765,  0.5041294117647058,   0.09790588235294118,
                    -0.1482229008985084,  -0.2909927853760014,   0.4392156862745098,
                     0.4392156862745098,  -0.36778831361360514, -0.07142737266090458]
        
    },
    [sabre["ColorSpaces"]["BT601_PC"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.000, 0.4392156862745098, 0.4392156862745098],
        // prettier-ignore
        "toRGB": [1.000,  3.19934e-17,  1.402,
                  1.000, -0.344136,    -0.714136,
                  1.000,  1.772,        2.31428e-17],
        // prettier-ignore
        "toDisplayP3": [0.714537,  0.400586,  1.28091,
                        0.770652, -0.216787, -0.630172,
                        0.630584,  2.10588,   0.0152574],
        // prettier-ignore
        "fromRGB": [ 0.299,                  0.587,                0.114,
                    -0.16873589164785552,   -0.3312641083521444,   0.500,
                     0.500,                 -0.41868758915834514, -0.08131241084165478]
    },
    [sabre["ColorSpaces"]["BT709_TV"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.06274509803921569, 0.5019607843137255, 0.5019607843137255],
        // prettier-ignore
        "toRGB": [1.164383561643836,  1.056992601789999e-17,   1.792741071428571,
                  1.164383561643836, -0.2132486142737296,     -0.5329093285594440,
                  1.164383561643836,  2.112401785714286,       5.589720587793818e-17],
        // prettier-ignore
        "toDisplayP3": [0.829323,  0.48564,    1.63621,
                        0.881004, -0.0184686, -0.464045,
                        0.731267,  2.50397,    0.0177776],
        // prettier-ignore
        "fromRGB": [ 0.18258588235294118,  0.6142305882352941,  0.06200705882352941,
                    -0.10064373237978098, -0.3385719538947288,  0.4392156862745098,
                     0.4392156862745098,  -0.3989421625902075, -0.04027352368430227]
    },
    [sabre["ColorSpaces"]["BT709_PC"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0, 0.4392156862745098, 0.4392156862745098],
        // prettier-ignore
        "toRGB": [1.000,  0.000,     1.5748,
                  1.000, -0.187324, -0.468124,
                  1.000,  1.8556,    6.5563e-17],
        // prettier-ignore
        "toDisplayP3": [0.711656,  0.421291,   1.43696,
                        0.757054, -0.0215334, -0.40797,
                        0.62552,   2.19426,    0.0152781],
        // prettier-ignore
        "fromRGB": [ 0.2126,               0.7152,               0.0722,
                    -0.11457210605733996, -0.38542789394266,     0.500,
                     0.500,               -0.45415290830581656, -0.04584709169418339]
    },
    [sabre["ColorSpaces"]["BT2020_TV"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.06274509803921569, 0.5019607843137255, 0.5019607843137255],
        // prettier-ignore
        "toRGB": [1.164383561643836,  1.458510124074039e-17,  1.678674107142857,
                  1.164383561643836, -0.1873261042193426,    -0.6504243185050568,
                  1.164383561643836,  2.141772321428571,      1.260596113768429e-16],
        // prettier-ignore
        "toDisplayP3": [0.831225,  0.471972,    1.5332,
                        0.881393, -0.00514562, -0.570162,
                        0.729488,  2.53502,     0.0177849],
        // prettier-ignore
        "fromRGB": [ 0.22561294117647057,  0.5822823529411765,   0.05092823529411764,
                    -0.12265542764357791, -0.3165602586309319,   0.4392156862745098,
                     0.4392156862745098,  -0.40389018756831363, -0.03532549870619616]
    },
    [sabre["ColorSpaces"]["BT2020_PC"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0, 0.4392156862745098, 0.4392156862745098],
        // prettier-ignore
        "toRGB": [1.000,  0.000,     1.4746,
                  1.000, -0.164553, -0.571353,
                  1.000,  1.8814,    4.33091e-17],
        // prettier-ignore
        "toDisplayP3": [0.713327,  0.409285,    1.34647,
                        0.757396, -0.00983022, -0.501186,
                        0.623958,  2.22153,     0.0152844],
        // prettier-ignore
        "fromRGB": [ 0.2627,               0.678,                0.0593,
                    -0.13963006271925163, -0.3603699372807484,   0.500,
                     0.500,               -0.45978570459785706, -0.04021429540214295]
    },
    [sabre["ColorSpaces"]["BT2020_CL_TV"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["CONSTANT_LUMINANCE"],
        "offset": [0.06274509803921569, 0.5019607843137255, 0.5019607843137255],
        "scale": [0.8588235294117647, 0.8784313725490196, 0.8784313725490196],
        "coefficients": [0.2627,0.6780,0.0593],
        "Nr": -0.8591205856272962,
        "Nb": -0.9701715667156197,
        "Pr": 0.4969162320105347,
        "Pb": 0.7909877078794619
    },
    [sabre["ColorSpaces"]["BT2020_CL_PC"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["CONSTANT_LUMINANCE"],
        "offset": [0, 0.4392156862745098, 0.4392156862745098],
        "scale": [1, 1, 1],
        "coefficients": [0.2627,0.6780,0.0593],
        "Nr": -0.8591205856272962,
        "Nb": -0.9701715667156197,
        "Pr": 0.4969162320105347,
        "Pb": 0.7909877078794619
    },
    //TODO: BT2100_PQ and BT2100_HLG
    [sabre["ColorSpaces"]["SMPTE240M_TV"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.06274509803921569, 0.5019607843137255, 0.5019607843137255],
        // prettier-ignore
        "toRGB": [1.164383561643836,  4.036066192587304e-17,  1.794107142857143,
                  1.164383561643836, -0.2579848303444059,    -0.5425830446301202,
                  1.164383561643836,  2.078705357142857,      2.829854238435873e-17],
        // prettier-ignore
        "toDisplayP3": [0.829301,  0.485804,   1.63744,
                        0.883875, -0.0669211, -0.472792,
                        0.733308,  2.46835,    0.0177693],
        // prettier-ignore
        "fromRGB": [ 0.1820705882352941,  0.6020352941176471,  0.07471764705882351,
                    -0.1019865558490647, -0.3372291304254451,  0.4392156862745098,
                     0.4392156862745098, -0.3907235990843038, -0.04849208719020603]
    },
    [sabre["ColorSpaces"]["SMPTE240M_PC"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0, 0.4392156862745098, 0.4392156862745098],
        // prettier-ignore
        "toRGB": [1.000,  0.000,      1.576,
                  1.000, -0.22662, -0.476622,
                  1.000,  1.826,   -7.19334e-17],
        // prettier-ignore
        "toDisplayP3": [0.711636,  0.421435,   1.43804,
                        0.759576, -0.0640938, -0.415654,
                        0.627313,  2.16297,    0.0152707],
        // prettier-ignore
        "fromRGB": [ 0.212,                0.7010000000000001,  0.087,
                    -0.11610076670317633, -0.3838992332968237,  0.500,
                     0.500,               -0.4447969543147208, -0.05520304568527918]
    },
    [sabre["ColorSpaces"]["FCC_TV"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0.06274509803921569, 0.5019607843137255, 0.5019607843137255],
        // prettier-ignore
        "toRGB": [1.164383561643836,  2.466910470962963e-18,  1.59375,
                  1.164383561643836, -0.3777920702179177,    -0.8103813559322034,
                  1.164383561643836,  2.026339285714286,     -9.630406442274205e-17],
        // prettier-ignore
        "toDisplayP3": [0.83264,   0.461796,  1.45651,
                        0.895595, -0.225665, -0.714659,
                        0.736479,  2.41299,   0.0177564],
        // prettier-ignore
        "fromRGB": [ 0.2576470588235294,  0.5067058823529411,  0.09447058823529411,
                    -0.14805023132848644,-0.29116545494602336, 0.4392156862745098,
                     0.4392156862745098, -0.3701960784313726, -0.06901960784313727]
    },
    [sabre["ColorSpaces"]["FCC_PC"]]: {
        "type": sabre["ColorSpaceConversionTypes"]["NON_CONSTANT_LUMINANCE"],
        "offset": [0, 0.4392156862745098, 0.4392156862745098],
        // prettier-ignore
        "toRGB": [1.000,  4.94049e-17,  1.400,
                  1.000, -0.331864,    -0.711864,
                  1.000,  1.780,        8.93792e-17],
        // prettier-ignore
        "toDisplayP3": [0.71457,   0.400346,  1.2791,
                        0.769871, -0.203541, -0.628117,
                        0.630099,  2.11434,   0.0152594],
        // prettier-ignore
        "fromRGB": [ 0.300,                0.590,                0.110,
                    -0.16853932584269662, -0.33146067415730335,  0.500,
                     0.500,               -0.42142857142857143, -0.07857142857142858]
    }
});