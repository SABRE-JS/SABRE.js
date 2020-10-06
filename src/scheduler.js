/*
 |   scheduler.js
 |----------------
 |  scheduler.js is copyright Patrick Rhodes Martin 2019.
 |
 |-
 */
/**
 * @typedef {!{
 *              getStart:function():num,
 *              getEnd:function():num,
 *          }}
 */
var SchedulableEvent;
/**
 * @fileoverview generic subtitle scheduler.
 */
const scheduler_prototype = global.Object.create(Object,{

    _events:{
        /**
         * The event tree.
         */
        value: null,
        writable: true
    },

    _createEventsTree:{
        /**
         * Generate the event tree.
         * @param {Array<SchedulableEvent>} eventsList list of events to put in the tree.
         */
		value: function(eventsList){
			this._events = {value: eventsList[0]};
			for (var i = 1; i < eventsList.length; i++){
				this._events = this._addEventNode(this._events,{value:eventsList[i]});
			}
		},
		writable: false
    },

    _addEventNode:{
		value: function(tree,node){
			if(typeof(tree) == "undefined"||tree == null) return node;
			if(typeof(node) == "undefined"||node == null) return tree;
			var nstart = node.value.getStart();
			var nend = node.value.getEnd();

			var tstart = tree.value.getStart();
			var tend = tree.value.getEnd();

			var isFront = nend < tend;
			
			var leftFront = tree.leftFront;
			var leftBack = tree.leftBack;
			
			var rightFront = tree.rightFront;
			var rightBack = tree.rightBack;

			var centerFront = tree.centerFront;
			var centerBack = tree.centerBack;

			if(nstart < tstart) { //left
				if(isFront)
					tree.leftFront = this._addEventNode(leftFront,node);
				else
					tree.leftBack = this._addEventNode(leftBack,node);
			} else if(nstart > tstart) { //right
				if(isFront)
					tree.rightFront = this._addEventNode(rightFront,node);
				else
					tree.rightBack = this._addEventNode(rightBack,node);
			} else { //center
				if(isFront)
					tree.centerFront = this._addEventNode(centerFront,node);
				else
					tree.centerBack = this._addEventNode(centerBack,node);
			}
			return tree;
		},
		writable: false
    },
    
    "getVisibleAtTime":{
        /**
         * Get the SchedulableEvents visible at the specified time.
         * @param {num} time the specified time.
         * @returns {Array<SchedulableEvent>} subtitle events onscreen.
         */
		value: function(time){
			var array = [];
			var queue = [this._events];
			while(queue.length > 0){
				this._getVisibleAtTimeHelper(time,queue.shift(),array,queue);
			}
			return array;
		},
		writable: false
	},

	_getVisibleAtTimeHelper:{
		value: function(time,node,array,queue){
			if(time < node.value["Start"]){ // left of node
				if(time < node.value["End"])
					if(node.leftFront)queue.push(node.leftFront);
				if(node.leftBack)queue.push(node.leftBack);
			}else if(time > node.value["Start"]){ //right of node
				if(time < node.value["End"]){//front of node
					array.push(node.value);
					if(node.leftFront)queue.push(node.leftFront);
					if(node.centerFront)queue.push(node.centerFront);
					if(node.rightFront)queue.push(node.rightFront);
				}
				if(node.leftBack)queue.push(node.leftBack);
				if(node.centerBack)queue.push(node.centerBack);
				if(node.rightBack)queue.push(node.rightBack);
			}else if(time === node.value["Start"]){
				if(time < node.value["End"]){//front of node
					array.push(node.value);
					if(node.leftFront)queue.push(node.leftFront);
					if(node.centerFront)queue.push(node.centerFront);
				}
				if(node.leftBack)queue.push(node.leftBack);
				if(node.centerBack)queue.push(node.centerBack);
			}
		},
		writable: false
    },
    
    "setEvents":{
        /**
         * Clear the event tree and regenerate.
         * @param {Array<SchedulableEvent>} eventsList list of all subtitle events to schedule.
         */
        value: function(eventsList){
            this._events = null;
            this._createEventsTree(eventsList);
        },
        writable: false
    },
});

sabre["SubtitleScheduler"] = function(){
	return global.Object.create(scheduler_prototype);
}