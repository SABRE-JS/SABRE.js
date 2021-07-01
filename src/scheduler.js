/*
 |   scheduler.js
 |----------------
 |  scheduler.js is copyright Patrick Rhodes Martin 2019.
 |
 |-
 */
//@include [color.js]
//@include [style.js]
//@include [style-override.js]
//@include [subtitle-event.js]
/**
 * @private
 * @typedef {!{
 * 				events:!Array<SSASubtitleEvent>,
 * 				start:number,
 * 				end:number
 * 			}}
 */
var TreeNode; // eslint-disable-line no-unused-vars
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
            if (a.getStart() === b.getStart()) return a.getEnd() - b.getEnd();
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
            let arr = new Array(len);
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
            eventsList.sort(this._eventListComparator);
            let originalLen = eventsList.length;
            this._eventTree = this._constructFixedArray(2 * originalLen);
            let i;
            for (i = originalLen; i < 2 * originalLen; i++) {
                let cur = eventsList[i - originalLen];
                this._eventTree[i] = {
                    events: [cur],
                    start: cur.getStart(),
                    end: cur.getEnd(),
                    leaf: true
                };
            }
            for (i = originalLen - 1; i > 0; i--) {
                let cur_a = this._eventTree[i * 2];
                let cur_b = this._eventTree[i * 2 + 1];
                this._eventTree[i] = {
                    start:
                        cur_a.start < cur_b.start ? cur_a.start : cur_b.start,
                    end: cur_b.end > cur_a.end ? cur_b.end : cur_a.end,
                    leaf: false
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
            let array = [];
            if (
                time >= this._eventTree[1].start &&
                time < this._eventTree[1].end
            ) {
                let queue = [1];
                let results = [];
                do {
                    let found = 1;
                    let i = queue.shift();
                    while (found === 1 && !this._eventTree[i].leaf) {
                        let cur_a = this._eventTree[i * 2];
                        let cur_b = this._eventTree[i * 2 + 1];
                        let a_overlaps =
                            cur_a.start <= time && cur_a.end > time;
                        let b_overlaps =
                            cur_b.start <= time && cur_b.end > time;
                        if (a_overlaps && b_overlaps) {
                            found = 2;
                            queue.push(i * 2);
                            queue.push(i * 2 + 1);
                        } else if (a_overlaps) {
                            i = i * 2;
                        } else if (b_overlaps) {
                            i = i * 2 + 1;
                        } else found = 0;
                    }
                    if (found === 1) {
                        results.push(this._eventTree[i].events.slice());
                    }
                } while (queue.length > 0);
                array = [].concat.apply([], results);
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
