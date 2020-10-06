//@include [color.js]

sabre["SSAStyleDefinition"] = function(){
	var obj = {
		name: "Default",
		fontName: "Arial",
		fontSize: 18,
		primaryColor: new sabre.SSAColor(0x00ffffff),
		secondaryColor: new sabre.SSAColor(0x00ffff00),
		tertiaryColor: new sabre.SSAColor(0x00000000),
		quaternaryColor: new sabre.SSAColor(0x00000080),
		bold: 200,
		scaleX: 1,
		scaleY: 1,
		spacing: 0,
		borderStyle: 1,
		outline: 2,
		shadow: 3,
		alignment: 2,
		margins: [20,20,20],
		encoding: 1
	};
	return Object.create(Object,{
		"toJSON":{
			value: function(){
				return	"{n:"+JSON.stringify(obj.name)+
				",fn:"+JSON.stringify(obj.fontName)+
				",fs:"+obj.fontSize+
				",pc:"+JSON.stringify(obj.primaryColor)+
				",sc:"+JSON.stringify(obj.secondaryColor)+
				",tc:"+JSON.stringify(obj.tertiaryColor)+
				",qc:"+JSON.stringify(obj.quaternaryColor)+
				",b:"+obj.bold+
				",i:"+obj.italic+
				",u:"+obj.underline+
				",st:"+obj.strikeout+
				",sx:"+obj.scaleX+
				",sy:"+obj.scaleY+
				",sp:"+obj.spacing+
				",an:"+obj.angle+
				",bs:"+obj.borderStyle+
				",ox:"+obj.outlineX+
				",oy:"+obj.outlineY+
				",sh:"+obj.shadow+
				",al:"+obj.alignment+
				",m:"+JSON.stringify(obj.margins)+
				",en:"+obj.encoding+"}";
			},
			writable:false
		},

		"setName":{
			value: function(/** string */name){
				obj.name = name;
			},
			writable: false
		},

		"getName":{
			value: function(){
				return obj.name;
			},
			writable: false
		},

		"setFontName":{
			value: function(/** string */name){
				obj.fontName = name;
			},
			writable: false
		},

		"getFontName":{
			value: function(){
				return obj.fontName;
			},
			writable: false
		},

		"setFontSize":{
			value: function(/** num */size){
				obj.fontSize = size;
			},
			writable: false
		},

		"getFontSize":{
			value: function(){
				return obj.fontSize;
			},
			writable: false
		},

		"setPrimaryColor":{
			value: function(/** SSAColor */color){
				obj.primaryColor = color;
			},
			writable: false
		},

		"getPrimaryColor":{
			value: function(){
				return obj.primaryColor;
			},
			writable: false
		},

		"setSecondaryColor":{
			value: function(/** SSAColor */color){
				obj.primaryColor = color;
			},
			writable: false
		},

		"getSecondaryColor":{
			value: function(){
				return obj.primaryColor;
			},
			writable: false
		},

		"setTertiaryColor":{
			value: function(/** SSAColor */color){
				obj.primaryColor = color;
			},
			writable: false
		},

		"getTertiaryColor":{
			value: function(){
				return obj.primaryColor;
			},
			writable: false
		},

		"setQuaternaryColor":{
			value: function(/** SSAColor */color){
				obj.primaryColor = color;
			},
			writable: false
		},

		"getQuaternaryColor":{
			value: function(){
				return obj.primaryColor;
			},
			writable: false
		},

		"setBold":{
			value: function(/** num */bold){
				obj.bold = bold;
			},
			writable: false
		},

		"getBold":{
			value: function(){
				return obj.bold;
			},
			writable: false
		},

		"setItalic":{
			value: function(/** boolean */italic){
				obj.italic = italic;
			},
			writable: false
		},

		"getItalic":{
			value: function(){
				return obj.italic;
			},
			writable: false
		},

		"setUnderline":{
			value: function(/** boolean */underline){
				obj.underline = underline;
			},
			writable: false
		},

		"getUnderline":{
			value: function(){
				return obj.underline;
			},
			writable: false
		},

		"setStrikeout":{
			value: function(/** boolean */strikeout){
				obj.strikeout = strikeout;
			},
			writable: false
		},

		"getStrikeout":{
			value: function(){
				return obj.strikeout;
			},
			writable: false
		},

		"setScale":{
			value: function(/** num */scale){
				obj.scaleX = scale;
				obj.scaleY = scale;
			},
			writable: false
		},

		"setScaleX":{
			value: function(/** num */scale){
				obj.scaleX = scale;
			},
			writable: false
		},

		"setScaleY":{
			value: function(/** num */scale){
				obj.scaleY = scale;
			},
			writable: false
		},

		"getScaleX":{
			value: function(){
				return obj.scaleX;
			},
			writable: false
		},

		"getScaleY":{
			value: function(){
				return obj.scaleX;
			},
			writable: false
		},

		"setSpacing":{
			value: function(/** num */spacing){
				obj.spacing = spacing;
			},
			writable: false
		},

		"getSpacing":{
			value: function(){
				return obj.spacing;
			},
			writable: false
		},

		"setAngle":{
			value: function(/** num */angle){
				obj.angle = angle;
			},
			writable: false
		},

		"getAngle":{
			value: function(){
				return obj.angle;
			},
			writable: false
		},

		"setBorderStyle":{
			value: function(/** num */style){
				obj.borderStyle = style;
			},
			writable: false
		},

		"getBorderStyle":{
			value: function(){
				return obj.borderStyle;
			},
			writable: false
		},

		"setOutline":{
			value: function(/** num */outline){
				obj.outlineX = outline;
				obj.outlineY = outline;
			},
			writable: false
		},

		"setOutlineX":{
			value: function(/** num */outline){
				obj.outlineX = outline;
			},
			writable: false
		},

		"setOutlineY":{
			value: function(/** num */outline){
				obj.outlineY = outline;
			},
			writable: false
		},

		"getOutlineX":{
			value: function(){
				return obj.outlineX;
			},
			writable: false
		},

		"getOutlineY":{
			value: function(){
				return obj.outlineY;
			},
			writable: false
		},

		"setShadow":{
			value: function(/** num */shadow){
				obj.shadow = shadow;
			},
			writable: false
		},

		"getShadow":{
			value: function(){
				return obj.shadow;
			},
			writable: false
		},

		"setAlignment":{
			value: function(/** num */alignment){
				obj.alignment = alignment;
			},
			writable: false
		},

		"getAlignment":{
			value: function(){
				return obj.alignment;
			},
			writable: false
		},

		"setMargins":{
			value: function(/** num */left,/** num */right,/** num */vertical){
				obj.margins = [left,right,vertical];
			},
			writable: false
		},

		"setMarginLeft":{
			value: function(/** num */left){
				obj.margins[0] = left;
			},
			writable: false
		},

		"setMarginRight":{
			value: function(/** num */right){
				obj.margins[1] = right;
			},
			writable: false
		},

		"setMarginVertical":{
			value: function(/** num */vertical){
				obj.margins[2] = vertical;
			},
			writable: false
		},

		"getMargins":{
			value: function(){
				return obj.margins;
			},
			writable: false
		},

		"setEncoding":{
			value: function(/** num */encoding){
				obj.encoding = encoding;
			},
			writable: false
		},

		"getEncoding":{
			value: function(){
				return obj.encoding;
			},
			writable: false
		}
	});
};