/*
 |   renderer-main.js
 |----------------
 |  renderer-main.js is copyright Patrick Rhodes Martin 2014-2020.
 |
 |-
 */
//@include [util.js]
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
//@include [subtitle-parser.js]
//@include [scheduler.js]
//@include [canvas-2d-text-renderer.js]
/**
 * @fileoverview canvas/webgl subtitle renderer code.
 */
const renderer_prototype = global.Object.create(Object,{

	//BEGIN MODULE VARIABLES

	_scheduler: {
		/** @type {?SubtitleScheduler} */
		value: null,
		writable: true
	},

	_textRenderer: {
		/** @type {?Canvas2DTextRenderer} */
		value: null,
		writable: true
	},

	_compositingCanvas:{
		/** @type{?HTMLCanvasElement} */
		value: null,
		writable: true
	},

	//END MODULE VARIABLES
	//BEGIN LOCAL VARIABLES

	_lastTime: {
		/**
		 * @type {num}
		 */
		value: -1,
		writable: true
	},

	_lastHash: {
		/**
		 * @type {num}
		 */
		value: 0,
		writable: true
	},

	//END LOCAL VARIABLES
	//BEGIN LOCAL FUNCTIONS

	_hashEvents: {
		/**
		 * Hashes a list of subtitle events.
		 * @param {Array<SSASubtitleEvent>} events list of subtitle events to hash.
		 * @returns {num} The Hash of the events.
		 */
		value: function(events){
			var str_rep = JSON.stringify(events);
			var hash = 0, i, chr;
			if (str_rep.length === 0) return hash;
			for (i = 0; i < str_rep.length; i++) {
				chr   = str_rep.charCodeAt(i);
				hash  = ((hash << 5) - hash) + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		},
		writable: false
	},

	//END LOCAL FUNCTIONS
	//BEGIN PUBLIC FUNCTIONS

	init: {
		/**
		 * Initializes the renderer.
		 * @returns {void}
		 */
		value: function(){
			this._scheduler = new sabre.SubtitleScheduler();
			this._textRenderer = new sabre.Canvas2DTextRenderer();
		},
		writable: false
	},

	'load': {
		/**
		 * Load the configuration for the renderer and do any follow-up steps.
		 * @param {{info:Object,parser:Object,renderer:Object,events:Array<SSASubtitleEvent>}} config configuration for the renderer.
		 * @returns {void}
		 */
		value: function(config){
			this._config = config;
			this._scheduler.setEvents(/** @type {Array<SchedulableEvent>} */ (config.events));
			
		},
		writable: false
	},

	'frame': {
		/**
		 * Render one frame.
		 * @param {num} time the current frame time.
		 * @returns {void}
		 */
		value: function(time){
			if(time === this._lastTime) return;
			this._lastTime = time;
			var events = /** @type {Array<SSASubtitleEvent>} */ (this._scheduler.getVisibleAtTime(time));
			events = events.sort(function(/** SSASubtitleEvent */a,/** SSASubtitleEvent */b){return a.getLayer()-b.getLayer();});	
			var currentHash = this._hashEvents(events);
			if(currentHash === this._lastHash) return;
			this._lastHash = currentHash;
		},
		writable: false
	},
	'getDisplayUri': {
		value: function(){
			return global.URL.createObjectURL(this._compositingCanvas.toBlobHD());
		},
		writable: false
	},
	
	//END PUBLIC FUNCTIONS
});

sabre["Renderer"] = function(){
	var renderer = global.Object.create(renderer_prototype);
	renderer.init();
	return renderer;
}