/**
 * @typedef {!{
 *              getVisibleAtTime:function(number):!Array<SSASubtitleEvent>,
 *              setEvents:function(!Array<SSASubtitleEvent>):void
 *          }}
 */
let SubtitleScheduler;

/**
 * @type {function(new:SubtitleScheduler)}
 */
sabre.SubtitleScheduler = function () {};
