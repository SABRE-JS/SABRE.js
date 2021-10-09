const a = 'a';
const b = 'b';
const c = 'c';
const d = 'd';

const expectedClip = [a, b, c, d];

const defaultStyleOverride = {
    a: null,
    bI: 0,
    bO: 0,
    dM: false,
    dS: 1,
    e: null,
    fN: null,
    fS: null,
    fSM: 0,
    gB: 0,
    i: null,
    kE: NaN,
    kM: 0,
    kS: NaN,
    m: [null, null, null],
    oX: null,
    oY: null,
    pC: null,
    qC: null,
    r: [0, 0, 0],
    sC: null,
    sX: null,
    sY: null,
    shX: null,
    shY: null,
    sheX: 0,
    sheY: 0,
    sp: null,
    st: null,
    t: null,
    tC: null,
    u: null,
    w: null,
    wS: 0
};

const styleOverridePrimitiveFieldsAliases = {
    Alignment: 'a',
    BaselineOffset: 'bO',
    DrawingMode: 'dM',
    DrawingScale: 'dS',
    Encoding: 'e',
    EdgeBlur: 'bI',
    FontName: 'fN',
    FontSize: 'fS',
    FontSizeMod: 'fSM',
    GaussianEdgeBlur: 'gB',
    Italic: 'i',
    KaraokeMode: 'kM',
    KaraokeStart: 'kS',
    KaraokeEnd: 'kE',
    OutlineY: 'oY',
    OutlineX: 'oX',
    PrimaryColor: 'pC',
    SecondaryColor: 'sC',
    TertiaryColor: 'tC',
    QuaternaryColor: 'qC',
    ScaleX: 'sX',
    ScaleY: 'sY',
    ShadowX: 'shX',
    ShadowY: 'shY',
    ShearX: 'sheX',
    ShearY: 'sheY',
    Spacing: 'sp',
    Strikeout: 'st',
    Transition: 't',
    Underline: 'u',
    Weight: 'w',
    WrapStyle: 'wS',
}

const marginLeft = 'marginLeft';
const marginRight = 'marginRight';
const marginVertical = 'marginVertical';

const rotationX = 'rotationX';
const rotationY = 'rotationY';
const rotationZ = 'rotationZ';

const defaultTransitionTargetOverride = {
    bI: null,
    fS: null,
    gB: null,
    oX: null,
    oY: null,
    pC: null,
    qC: null,
    r: [null, null, null], // looks like here is the issue in SSATransitionTargetOverride
    sC: null,
    sX: null,
    sY: null,
    shX: null,
    shY: null,
    sheX: null,
    sheY: null,
    sp: null,
    tA: 1,
    tC: null,
    tE: 0,
    tS: 0
};

const transitionTargetOverridePrimitiveFieldsAliases = {
    TransitionStart: 'tS',
    TransitionEnd: 'tE',
    TransitionAcceleration: 'tA',
    EdgeBlur: 'bI',
    FontSize: 'fS',
    GaussianEdgeBlur: 'gB',
    OutlineY: 'oY',
    OutlineX: 'oX',
    PrimaryColor: 'pC',
    SecondaryColor: 'sC',
    TertiaryColor: 'tC',
    QuaternaryColor: 'qC',
    ScaleX: 'sX',
    ScaleY: 'sY',
    ShadowX: 'shX',
    ShadowY: 'shY',
    ShearX: 'sheX',
    ShearY: 'sheY',
    Spacing: 'sp',
};

module.exports = {
    clip: {
        a,
        b,
        c,
        d,
        expectedClip
    },
    defaultStyleOverride,
    styleOverridePrimitiveFieldsAliases,
    margins: [marginLeft, marginRight, marginVertical],
    marginLeft,
    marginRight,
    marginVertical,
    rotations: [rotationX, rotationY, rotationZ],
    defaultTransitionTargetOverride,
    transitionTargetOverridePrimitiveFieldsAliases
}
