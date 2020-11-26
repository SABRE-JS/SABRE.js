/*
 |   canvas-2d-text-renderer.js
 |----------------
 |  canvas-2d-text-renderer.js is copyright Patrick Rhodes Martin 2019.
 |
 |-
 */
/**
 * @fileoverview advance stubstation alpha subtitle text renderer.
 */

/**
 * @typedef {{
 *              fillColor:SSAColor,
 *              strokeColor:SSAColor,
 *              wipeColor:SSAColor,
 *              outline:number,
 *              boxBlur:number,
 *              spacing:number,
 *              fontSize:number,
 *              scaleX:number,
 *              scaleY:number,
 *              fontName:!string,
 *              bold:(boolean|number),
 *              italic:boolean,
 *              strikeout:boolean,
 *              wipeEnabled:boolean,
 *              wipePercent:number,
 *              stroke:boolean
 *          }}
 */
var TextRenderingProperties;

const lineSpacing = 1.2;

sabre["canvas2d_text_renderer_prototype"] = global.Object.create(Object,{

    _serializer:{
		value: new XMLSerializer(),
		writable: false
	},

    _initialized: {
        /**
         * Is the text renderer initialized.
         * @type {boolean}
         */
        value: false,
        writable: true
    },

    _pixelsPerDpt: {
        /**
         * Pixel to Dpt Ratio
         * @type {number}
         */
        value: 1,
        writable: false,
    },

    _blur_urls: {
        /**
         * Blur URLS
         * @type {Array<string>}
         */
		value: [],
		writable: false
	},

    _canvas: {
        /**
         * The canvas for the text renderer.
         * @type {HTMLCanvasElement}
         */
        value: null,
        writable: true
    },
    
    _ctx: {
        /**
         * The canvas context for the text renderer.
         * @type {CanvasRenderingContext2D}
         */
        value: null,
        writable: true
    },

    _offsetX: {
        /**
         * The offset in the x coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _offsetY: {
        /**
         * The offset in the y coordinate.
         * @type {number}
         */
        value: 0,
        writable: true
    },

    _width: {
        /**
         * The width of the canvas.
         * @type {number}
         */
        value: NaN,
        writable: true
    },

    _height: {
        /**
         * The height of the canvas.
         * @type {number}
         */
        value: NaN,
        writable: true
    },

    _init: {
        /**
         * Initializes the rendering canvas.
         */
        value: function(){
            this._canvas = global.document.createElement("canvas");
            this._height = (this._width = 0);
            this._ctx = this._canvas.getContext("2d",{"alpha":true});
            this._initialized = true;
        },
        writable: false
    },

    _getBlurKernelValueForPosition:{
		value: function(center_value,x,y,dim,intgr){
			if (intgr == null) intgr = false;
			var value = Math.max(center_value-Math.sqrt(Math.pow(x-(dim-1)/2,2)+Math.pow(y-(dim-1)/2,2)),0);
			if (intgr)
				value = Math.floor(value)
			return value;
		},
		writable: false
	},

    _getBlurMatrixUrl:{
        /**
         * Generates a box-blur URL.
         * @param {number} blur_count Number of times to apply box-blur.
         * @returns {string} the resulting URL.
         */
		value: function (blur_count){
			if(typeof(this._blur_urls[blur_count])==="undefined"||this._blur_urls[blur_count]==null){
                var filterdom;
                var doctype = global.document.implementation.createDocumentType('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
				var filter_doc = (filterdom = global.document.implementation.createDocument("http://www.w3.org/2000/svg","svg",doctype)).documentElement;
                var defs = filterdom.createElementNS("http://www.w3.org/2000/svg","defs");
                var filter = filterdom.createElementNS("http://www.w3.org/2000/svg","filter");
                filter.setAttribute("id","filter");
                defs.appendChild(filter);
                filter_doc.appendChild(defs);
				filter.setAttribute("filterUnits","userSpaceOnUse");
				filter.setAttribute("x","0");
				filter.setAttribute("y","0");
				filter.setAttribute("width",global.screen.width);
                filter.setAttribute("height",global.screen.height);
                var filters_count = 0;
                while(blur_count > 0){
                    var blur = filterdom.createElementNS("http://www.w3.org/2000/svg","feConvolveMatrix");
                    blur.setAttribute("edgeMode","none");
                    if(filters_count++ == 0) blur.setAttribute("in","SourceGraphic");
                    else blur.setAttribute("in","filterStep"+(filters_count-1));
                    var blur_matrix = [];
                    for(var i = 0; i<5;i++)
                        for (var j = 0; j<5;j++)
                            blur_matrix[i*5+j] = this._getBlurKernelValueForPosition(4,j,i,5,false);
                    blur.setAttribute("order",Math.sqrt(blur_matrix.length));
                    blur.setAttribute("kernelMatrix",blur_matrix.join(", "));
                    if(--blur_count > 0) blur.setAttribute("result","filterStep"+filters_count);
                    filter.appendChild(blur);
                }
                var filterxml = this._serializer.serializeToString(filterdom);
				var filterurl = "data:image/svg+xml;utf8,"+global.encodeURIComponent(filterxml)+"#filter";
				return this._blur_urls[blur_count] = filterurl;
			}else{
				return this._blur_urls[blur_count];
			}
		},
		writable: false
    },
    
    _setScale: {
        /**
         * Sets up the canvas to render to the correct scale.
         * @param {TextRenderingProperties} props
         */
        value: function(props){
            props.scaleX = (props.scaleX<=0?1:props.scaleX);
            props.scaleY = (props.scaleY<=0?1:props.scaleY);
            this._ctx.scale(props.scaleX,props.scaleY);
        },
        writable: false
    },

    _setOutline: {
        /**
         * Set outline width to the correct size.
         * @param {TextRenderingProperties} props
         */
        value: function(props){
            this._ctx.lineWidth = props.outline*2;
        },
        writable: false
    },

    _setFont: {
        /**
         * Set font settings for drawing.
         * @param {TextRenderingProperties} props
         */
        value: function(props){
            var font = (props.fontSize*this._pixelsPerDpt)+"px '"+props.fontName+"', 'Arial', 'Open Sans'";
            if(props.bold === true)
                font = "bold " + font;
            else if(props.bold > 0)
                font = props.bold + " " + font;
            if(props.italic)
                font = "italic " + font;
            this._ctx.font = font;
        },
        writable: false
    },

    _setBoxBlur: {
        /**
         * Set box blur radius, gaussian blur is handled in the compositing step instead of here for performance reasons.
         * @param {TextRenderingProperties} props
         */
        value: function(props){
            if(props.boxBlur > 0){
                this._ctx.filter = "url('" + this._getBlurMatrixUrl(props.boxBlur)+"')";
            }else this._ctx.filter = "none";
        },
        writable: false
    },

    _setColors: {
        /**
         * Set the colors for the subtitle.
         * @param {TextRenderingProperties} props
         */
        
    },
    
    _handleProperties:{
        /**
         * Sets up the canvas to render according to the properties specified.
         * @param {TextRenderingProperties} props 
         */
        value: function(props){
            this._ctx.resetTransform();
            this._setScale(props);
            this._setOutline(props);
            this._setFont(props);
            this._setColors(props);
            this._setBoxBlur(props);
            //TODO: Strikeout/Strikethrough
            this._ctx.textAlign = "left";
            this._ctx.textBaseline = "middle";
            this._ctx.lineCap = "round";
			this._ctx.lineJoin = "round";
        },
        writable: false
    },

    "renderText": {
        value: function(text,properties){
            if(!this._initialized) this._init();
            this._offsetX = (this._offsetY = 0);
            this._handleProperties(properties);

            //calculate size of text
            this._width = 0;
            if(global.isNaN(properties.spacing)){
				this._width = this._ctx.measureText(text).width * properties.scaleX;
			}else{
				for(var i = 0; i < text.length; i++) this._width += this._ctx.measureText(text[i]).width;
				this._width += properties.spacing*(text.length-1);
            }
            this._height = properties.fontSize * this._pixelsPerDpt * lineSpacing;
            
            //pad for box blur
            if(properties.boxBlur > 0){
                this._width += global.Math.pow(2,properties.boxBlur)*2;
                this._height += global.Math.pow(2,properties.boxBlur)*2;
                this._offsetX += global.Math.pow(2,properties.boxBlur);
            }

            //pad for outline
            if(properties.stroke){
                this._width += properties.outline*2;
                this._height += properties.outline*2;
                this._offsetX += properties.outline;
            }

            this._offsetY += this._height/2;
            this._offsetX *= properties.scaleX;
            this._offsetY *= properties.scaleY;
            this._width *= properties.scaleX;
            this._height *= properties.scaleY;
            this._canvas.width = this._width;
            this._canvas.height = this._height;
            this._handleProperties(properties); //To workaround a bug.

            //reset the composite operation
            this._ctx.globalCompositeOperation = "source-over";
            //draw the text
            var offsetXtemp = this._offsetX/properties.scaleX;
            var offsetYtemp = this._offsetY/properties.scaleY;
            if(properties.stroke){
                if(global.isNaN(properties.spacing)){
                    this._ctx.strokeText(text,this._offsetXtemp,this._offsetYtemp);
                    this._ctx.globalCompositeOperation = "destination-out";
                    this._ctx.filter = "none";
					this._ctx.fillText(text,this._offsetXtemp,this._offsetYtemp);
                } else {
                    var letter_offset = 0;
                    for(var i = 0; i < text.length; i++){
                        this._ctx.strokeText(text[i],this._offsetXtemp+(properties.spacing*i+letter_offset),this._offsetYtemp);
                        letter_offset += this._ctx.measureText(text[i]).width;
                    }
                    this._ctx.globalCompositeOperation = "destination-out";
                    this._ctx.filter = "none";
                    letter_offset = 0;
                    for(var i = 0; i < text.length; i++){
                        this._ctx.fillText(text[i],this._offsetXtemp+(properties.spacing*i+letter_offset),this._offsetYtemp);
                        letter_offset += this._ctx.measureText(text[i]).width;
                    }
                }
            }else{
                if(global.isNaN(properties.spacing))this._ctx.fillText(text,this._offsetXtemp,this._offsetYtemp);
                else {
                    var letter_offset = 0;
                    for(var i = 0; i < text.length; i++){
                        this._ctx.fillText(text[i],this._offsetXtemp+(properties.spacing*i+letter_offset),this._offsetYtemp);
                        letter_offset += this._ctx.measureText(text[i]).width;
                    }
                }
            }
        },
        writable: false
    },

    "setDPI": {
        /**
         * Sets the DPI for Rendering text
         * @param {number} dpi the DPI to use for rendering text.
         */
        value: function(dpi){
            this._pixelsPerDpt = dpi/72;
        },
        writable: false
    },

    "getOffset": {
        /**
         * Gets the offset of the resulting image.
         * @returns {Array<number>} offset of the resulting image
         */
        value: function(){
            return [-this._offsetX,-this._offsetY];
        },
        writable: false
    },

    "getDimensions": {
        /**
         * Gets the dimensions of the resulting image.
         * @returns {Array<number>} dimensions of the resulting image
         */
        value: function(){
            return [this._width,this._height];
        },
        writable: false
    },
    
    "getImage": {
        value: function(){
            return this._canvas;
        },
        writable: true
    }
});