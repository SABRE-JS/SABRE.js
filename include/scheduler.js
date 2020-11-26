/**
 * @typedef {!{
 *              getVisibleAtTime:function(number):!Array<SSASubtitleEvent>,
 *              setEvents:function(!Array<SSASubtitleEvent>):void
 *          }}
 */
var SubtitleScheduler;

/**
 * @type {function(new:SubtitleScheduler)}
 */
sabre.SubtitleScheduler = function(){};