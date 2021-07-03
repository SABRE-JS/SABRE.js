/**
 * @typedef {!{
 *      getTransitionStart:function():number,
 *      getTransitionEnd:function():number,
 *      getTransitionAcceleration:function():number,
 *      getEdgeBlur:function():?number,
 *      getFontSize:function():?number,
 *      getGaussianEdgeBlur:function():?number,
 *      getOutlineX:function():?number,
 *      getOutlineY:function():?number,
 *      getPrimaryColor:function():?SSAOverrideColor,
 *      getSecondaryColor:function():?SSAOverrideColor,
 *      getTertiaryColor:function():?SSAOverrideColor,
 *      getQuaternaryColor:function():?SSAOverrideColor,
 *      getRotation:function():Array<?number>,
 *      getScaleX:function():?number,
 *      getScaleY:function():?number,
 *      getShadowX:function():?number,
 *      getShadowY:function():?number,
 *      getShearX:function():?number,
 *      getShearY:function():?number,
 *      getSpacing:function():?number,
 *      setTransitionStart:function(number):void,
 *      setTransitionEnd:function(number):void,
 *      setTransitionAcceleration:function(number):void,
 *      setEdgeBlur:function(number):void,
 *      setFontSize:function(number):void,
 *      setGaussianEdgeBlur:function(number):void,
 *      setOutline:function(number):void,
 *      setOutlineX:function(number):void,
 *      setOutlineY:function(number):void,
 *      setPrimaryColor:function(SSAOverrideColor):void,
 *      setSecondaryColor:function(SSAOverrideColor):void,
 *      setTertiaryColor:function(SSAOverrideColor):void,
 *      setQuaternaryColor:function(SSAOverrideColor):void,
 *      setRotation:function(?number,?number,?number):void,
 *      setScaleX:function(number):void,
 *      setScaleY:function(number):void,
 *      setShadowX:function(number):void,
 *      setShadowY:function(number):void,
 *      setShadow:function(number):void,
 *      setShearX:function(number):void,
 *      setShearY:function(number):void,
 *      setSpacing:function(number):void
 *  }}
 */
var SSATransitionTargetOverride;

/**
 * @typedef {!{
 *      getClip:function():?Array<number>,
 *      setClip:function(number,number,number,number):void,
 *  }}
 */
var SSALineTransitionTargetOverride;
/**
 * @typedef {!{
 *      toJSON:function():string,
 *      getAlignment:function():?number,
 *      getBaselineOffset:function():number,
 *      getDrawingMode:function():boolean,
 *      getDrawingScale:function():number,
 *      getEncoding:function():?number,
 *      getEdgeBlur:function():number,
 *      getFontName:function():?string,
 *      getFontSize:function():?number,
 *      getFontSizeMod:function():number,
 *      getGaussianEdgeBlur:function():number,
 *      getItalic:function():?boolean,
 *      getKaraokeMode:function():number,
 *      getKaraokeStart:function():number,
 *      getKaraokeEnd:function():number,
 *      getMargins:function():Array<?number>,
 *      getOutlineX:function():?number,
 *      getOutlineY:function():?number,
 *      getPrimaryColor:function():?SSAOverrideColor,
 *      getSecondaryColor:function():?SSAOverrideColor,
 *      getTertiaryColor:function():?SSAOverrideColor,
 *      getQuaternaryColor:function():?SSAOverrideColor,
 *      getRotation:function():Array<number>,
 *      getScaleX:function():?number,
 *      getScaleY:function():?number,
 *      getShadowX:function():?number,
 *      getShadowY:function():?number,
 *      getShearX:function():number,
 *      getShearY:function():number,
 *      getSpacing:function():?number,
 *      getStrikeout:function():?boolean,
 *      getTransition:function():?SSATransitionTargetOverride,
 *      getUnderline:function():?boolean,
 *      getWeight:function():?number,
 *      getWrapStyle:function():number,
 *      setAlignment:function(?number):void,
 *      setBaselineOffset:function(number):void,
 *      setDrawingMode:function(boolean):void,
 *      setDrawingScale:function(number):void,
 *      setEncoding:function(number):void,
 *      setEdgeBlur:function(number):void,
 *      setFontName:function(string):void,
 *      setFontSize:function(number):void,
 *      setFontSizeMod:function(number):void,
 *      increaseFontSizeMod:function(number):void,
 *      decreaseFontSizeMod:function(number):void,
 *      resetFontSizeMod:function():void,
 *      setGaussianEdgeBlur:function(number):void,
 *      setItalic:function(boolean):void,
 *      setKaraokeMode:function(number):void,
 *      setKaraokeStart:function(number):void,
 *      setKaraokeEnd:function(number):void,
 *      setMargins:function(number,number,number):void,
 *      setMarginLeft:function(number):void,
 *      setMarginRight:function(number):void,
 *      setMarginVertical:function(number):void,
 *      setOutline:function(number):void,
 *      setOutlineX:function(number):void,
 *      setOutlineY:function(number):void,
 *      setPrimaryColor:function(SSAOverrideColor):void,
 *      setSecondaryColor:function(SSAOverrideColor):void,
 *      setTertiaryColor:function(SSAOverrideColor):void,
 *      setQuaternaryColor:function(SSAOverrideColor):void,
 *      setRotation:function(?number,?number,?number):void,
 *      setScaleX:function(number):void,
 *      setScaleY:function(number):void,
 *      setShadowX:function(number):void,
 *      setShadowY:function(number):void,
 *      setShadow:function(number):void,
 *      setShearX:function(number):void,
 *      setShearY:function(number):void,
 *      setSpacing:function(number):void,
 *      setStrikeout:function(boolean):void,
 *      setTransition:function(SSATransitionTargetOverride):void,
 *      setUnderline:function(boolean):void,
 *      setWeight:function(number):void,
 *      setWrapStyle:function(number):void,
 *      reset:function():void,
 *      clone:function():SSAStyleOverride
 * }}
 */
var SSAStyleOverride;

/**
 * @typedef {!{
 *      toJSON:function():string,
 *      getClip:function():?Array<number|string>,
 *      getClipInverted:function():boolean,
 *      getFade:function():?Array<number>,
 *      getMovement:function():?Array<number>,
 *      getPosition:function():?Array<number>,
 *      getRotationOrigin:function():?Array<number>,
 *      setClip:function(number,(number|string),number=,number=):void,
 *      setClipInverted:function(boolean):void,
 *      setFade:function(number,number,number,number,number,number,number):void,
 *      setMovement:function(number,number,number,number,number,number):void,
 *      setPosition:function(number,number):void,
 *      setRotationOrigin:function(number,number):void
 * }}
 */
var SSALineStyleOverride;

/**
 * @type {function(new:SSAStyleOverride)}
 */
sabre.SSAStyleOverride = function () {};

/**
 * @type {function(new:SSALineStyleOverride)}
 */
sabre.SSALineStyleOverride = function () {};

/**
 * @type {function(new:SSATransitionTargetOverride)}
 */
sabre.SSATransitionTargetOverride = function () {};

/**
 * @type {function(new:SSALineTransitionTargetOverride)}
 */
sabre.SSALineTransitionTargetOverride = function () {};
