/*
 |   scheduler.js
 |----------------
 |  scheduler.js is copyright Patrick Rhodes Martin 2019.
 |
 |-
 */
//@include [subtitle-event.js]
/**
 * @typedef {!{
 * 				events:!Array<SSASubtitleEvent>,
 * 				start:number,
 * 				end:number
 * 			}}
 */
var TreeNode;
/**
 * @fileoverview generic subtitle scheduler.
 */
const scheduler_prototype = global.Object.create(Object, {
    _eventTree: {
        /**
         * The event tree.
         * @type {?Array<?TreeNode>}
         */
        value: null,
        writable: true
    },

    _eventListComparator: {
        /**
         * Function for sorting the events list prior to building the tree.
         * @param {SSASubtitleEvent} a The first event to be compared.
         * @param {SSASubtitleEvent} b The second event to be compared.
         * @returns {number}
         */
        value: function (/** SSASubtitleEvent */ a, /** SSASubtitleEvent */ b) {
            if (a.getStart() == b.getStart())
                return a.getEnd() - a.getStart() - (b.getEnd() - b.getStart());
            return a.getStart() - b.getStart();
        },
        writable: false
    },

    _constructFixedArray: {
        /**
         * Construct a fixed-length null-filled array.
         * @param {number} len length of fixed-length array.
         * @returns {!Array<?TreeNode>}
         */
        value: function (len) {
            var arr = new Array(len);
            arr.fill(null);
            return Object.seal(arr);
        },
        writable: false
    },

    _createEventsTree: {
        /**
         * Generate the event tree.
         * @param {!Array<SSASubtitleEvent>} eventsList list of events to put in the tree.
         */
        value: function (eventsList) {
            eventsList = eventsList.slice();
            var originalLen = eventsList.length;
            this._eventTree = this._constructFixedArray(2 * originalLen);
            eventsList.sort(this._eventListComparator);
            var i;
            for (i = originalLen; i < 2 * originalLen; i++) {
                var cur = eventsList[i - originalLen];
                this._eventTree[i] = {
                    events: [cur],
                    start: cur.getStart(),
                    end: cur.getEnd
                };
            }
            for (i = originalLen - 1; i > 0; i--) {
                var cur_a = this._eventTree[i * 2];
                var cur_b = this._eventTree[i * 2 + 1];
                this._eventTree[i] = {
                    events: cur_a.events.concat(cur_b.events),
                    start:
                        cur_a.start < cur_b.start ? cur_a.start : cur_b.start,
                    end: cur_b.end > cur_a.end ? cur_b.end : cur_b.end
                };
            }
        },
        writable: false
    },

    "getVisibleAtTime": {
        /**
         * Get the SSASubtitleEvents visible at the specified time.
         * @param {number} time the specified time.
         * @returns {!Array<SSASubtitleEvent>} subtitle events onscreen.
         */
        value: function (time) {
            var array = [];
            var i = 1;
            if (
                time >= this._eventTree[1].start &&
                time < this._eventTree[1].end
            ) {
                var found = null;
                do {
                    var cur_a = this._eventTree[i * 2];
                    var a_overlaps = cur_a.start <= time && cur_a.end > time;
                    var cur_b = this._eventTree[i * 2 + 1];
                    var b_overlaps = cur_b.start <= time && cur_b.end > time;
                    if (a_overlaps && b_overlaps) {
                        found = true;
                    } else if (a_overlaps) {
                        i = i * 2;
                    } else if (b_overlaps) {
                        i = i * 2 + 1;
                    } else found = false;
                } while (found == null && i < this._eventTree.length / 2);
                if (found) {
                    array = this._eventTree[i].events.slice();
                }
            }
            return array;
        },
        writable: false
    },

    "setEvents": {
        /**
         * Clear the event tree and regenerate.
         * @param {!Array<SSASubtitleEvent>} eventsList list of all subtitle events to schedule.
         */
        value: function (eventsList) {
            this._eventTree = null;
            this._createEventsTree(eventsList);
        },
        writable: false
    }
});

sabre["SubtitleScheduler"] = function () {
    return global.Object.create(scheduler_prototype);
};
