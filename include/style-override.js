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
 *      getMovement:function():?Array<number>,
 *      getOutlineX:function():?number,
 *      getOutlineY:function():?number,
 *      getPosition:function():?Array<number>,
 *      getPrimaryColor:function():?SSAOverrideColor,
 *      getSecondaryColor:function():?SSAOverrideColor,
 *      getTertiaryColor:function():?SSAOverrideColor,
 *      getQuaternaryColor:function():?SSAOverrideColor,
 *      getRotations:function():Array<Array<number>>,
 *      getScaleX:function():?number,
 *      getScaleY:function():?number,
 *      getShadowX:function():?number,
 *      getShadowY:function():?number,
 *      getShearX:function():number,
 *      getShearY:function():number,
 *      getSpacing:function():?number,
 *      getTransition:function():?Array<number|string>,
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
 *      setMovement:function(number,number,number,number,number,number):void,
 *      setOutline:function(number):void,
 *      setOutlineX:function(number):void,
 *      setOutlineY:function(number):void,
 *      setPosition:function(number,number):void,
 *      setPrimaryColor:function(SSAOverrideColor):void,
 *      setSecondaryColor:function(SSAOverrideColor):void,
 *      setTertiaryColor:function(SSAOverrideColor):void,
 *      setQuaternaryColor:function(SSAOverrideColor):void,
 *      addRotation:function(number,number,number):void,
 *      setScaleX:function(number):void,
 *      setScaleY:function(number):void,
 *      setShadowX:function(number):void,
 *      setShadowY:function(number):void,
 *      setShadow:function(number):void,
 *      setShearX:function(number):void,
 *      setShearY:function(number):void,
 *      setSpacing:function(number):void,
 *      setTransition:function(Array<number|string>):void,
 *      setUnderline:function(boolean):void,
 *      setWeight:function(number):void,
 *      setWrapStyle:function(number):void,
 *      reset:function():void,
 *      clone:function():SSAStyleOverride
 * }}
 */
var SSAStyleOverride;

/**
 * @type {function(new:SSAStyleOverride)}
 */
sabre.SSAStyleOverride = function () {};
