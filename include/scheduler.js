/**
 * @typedef {!{
    *              getStart:function():num,
    *              getEnd:function():num,
    *          }}
    */
   var SchedulableEvent;
/**
 * @typedef {!{
 *              getVisibleAtTime:function(num):Array<SchedulableEvent>,
 *              setEvents:function(Array<SchedulableEvent>):void
 *          }}
 */
var SubtitleScheduler;

/**
 * @type {function(new:SubtitleScheduler)}
 */
sabre.SubtitleScheduler = function(){};