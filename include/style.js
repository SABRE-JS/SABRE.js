/**
 * @typedef {!{
 *              toJSON:function():string,
 *              getName:function():string,
 *              getFontName:function():string,
 *              getFontSize:function():number,
 *              getPrimaryColor:function():SSAColor,
 *              getSecondaryColor:function():SSAColor,
 *              getTertiaryColor:function():SSAColor,
 *              getQuaternaryColor:function():SSAColor,
 *              getWeight:function():number,
 *              getItalic:function():boolean,
 *              getUnderline:function():boolean,
 *              getStrikeout:function():boolean,
 *              getScaleX:function():number,
 *              getScaleY:function():number,
 *              getSpacing:function():number,
 *              getAngle:function():number,
 *              getBorderStyle:function():number,
 *              getOutlineX:function():number,
 *              getOutlineY:function():number,
 *              getShadow:function():number,
 *              getAlignment:function():number,
 *              getMargins:function():Array<number>,
 *              getEncoding:function():number,
 *              setName:function(string):void,
 *              setFontName:function(string):void,
 *              setFontSize:function(number):void,
 *              setPrimaryColor:function(SSAColor):void,
 *              setSecondaryColor:function(SSAColor):void,
 *              setTertiaryColor:function(SSAColor):void,
 *              setQuaternaryColor:function(SSAColor):void,
 *              setWeight:function(number):void,
 *              setItalic:function(boolean):void,
 *              setUnderline:function(boolean):void,
 *              setStrikeout:function(boolean):void,
 *              setScale:function(number):void,
 *              setScaleX:function(number):void,
 *              setScaleY:function(number):void,
 *              setSpacing:function(number):void,
 *              setAngle:function(number):void,
 *              setBorderStyle:function(number):void,
 *              setOutline:function(number):void,
 *              setOutlineX:function(number):void,
 *              setOutlineY:function(number):void,
 *              setShadow:function(number):void,
 *              setAlignment:function(number):void,
 *              setMargins:function(number,number,number):void,
 *              setMarginLeft:function(number):void,
 *              setMarginRight:function(number):void,
 *              setMarginVertical:function(number):void,
 *              setEncoding:function(number):void
 *          }}
 */
let SSAStyleDefinition;

/**
 * @type {function(new:SSAStyleDefinition)}
 */
sabre.SSAStyleDefinition = function () {};
