global = globalThis;
require("../scheduler.js");

describe("SubtitleScheduler", () => {
    let scheduler;

    let events;

    let SSASubtitleEventA;
    let SSASubtitleEventB;
    let SSASubtitleEventC;

    const eventAStartValue = 5;
    const eventBStartValue = 3;
    const eventCStartValue = 1;

    const eventAEndValue = 10;
    const eventBEndValue = 7;
    const eventCEndValue = 13;

    const eventNameA = 'eventNameA'
    const eventNameB = 'eventNameB'
    const eventNameC = 'eventNameC'

    beforeEach(() => {
        SSASubtitleEventA = {
            eventName: eventNameA,
            getStart: jest.fn().mockName('getStart').mockReturnValue(eventAStartValue),
            getEnd: jest.fn().mockName('getEnd').mockReturnValue(eventAEndValue),
        };
        SSASubtitleEventB = {
            eventName: eventNameB,
            getStart: jest.fn().mockName('getStart').mockReturnValue(eventBStartValue),
            getEnd: jest.fn().mockName('getEnd').mockReturnValue(eventBEndValue)
        };
        SSASubtitleEventC = {
            eventName: eventNameC,
            getStart: jest.fn().mockName('getStart').mockReturnValue(eventCStartValue),
            getEnd: jest.fn().mockName('getEnd').mockReturnValue(eventCEndValue)
        };

        events = [SSASubtitleEventA, SSASubtitleEventB, SSASubtitleEventC];
    });

    beforeEach(() => {
        scheduler = new sabre.SubtitleScheduler();
    });

    describe("#_eventListComparator", () => {
        const eventsStartValueDiff = eventAStartValue - eventBStartValue;
        const eventsEndValueDiff = eventAEndValue - eventBEndValue;


        it("should return diff value between two events based on their start values if they are not the same", () => {
            expect(scheduler._eventListComparator(SSASubtitleEventA, SSASubtitleEventB)).toBe(eventsStartValueDiff);

            expect(SSASubtitleEventA.getStart).toBeCalledTimes(2);
            expect(SSASubtitleEventB.getStart).toBeCalledTimes(2);

            expect(SSASubtitleEventA.getEnd).not.toBeCalled();
            expect(SSASubtitleEventB.getEnd).not.toBeCalled();
        });

        it("should return diff value between two events based on their end values if their start values are the same", () => {
            SSASubtitleEventB.getStart.mockReturnValue(eventAStartValue);

            expect(scheduler._eventListComparator(SSASubtitleEventA, SSASubtitleEventB)).toBe(eventsEndValueDiff);

            expect(SSASubtitleEventA.getStart).toBeCalledTimes(1);
            expect(SSASubtitleEventB.getStart).toBeCalledTimes(1);

            expect(SSASubtitleEventA.getEnd).toBeCalled();
            expect(SSASubtitleEventB.getEnd).toBeCalled();
        });
    });

    describe("#_constructFixedArray", () => {
        const arrayLength = 3;

        it("should return sealed array with the length passed from the argument", () => {
            const fixedArray = scheduler._constructFixedArray(arrayLength);

            expect(fixedArray.length).toBe(arrayLength);
            expect(Object.isSealed(fixedArray)).toBeTruthy();
        });

        it("should define all fixed array elements as null", () => {
            expect(scheduler._constructFixedArray(arrayLength)).toEqual([null, null, null]);
        });
    });

    describe("#_createEventsTree", () => {
        let doubleEventsLength;

        beforeEach(() => {
            doubleEventsLength = events.length * 2;
        });

        it("should create nodes tree with double of count of events from passed events", () => {
            scheduler._createEventsTree(events);
            expect(scheduler._eventTree.length).toBe(doubleEventsLength);
        });

        it("should save the first node in the tree to null", () => {
            scheduler._createEventsTree(events);
            const [firstNode] = scheduler._eventTree;
            expect(firstNode).toBeNull();
        });

        it("should create first part of the nodes with calculated start and end values from sibling events", () => {
            scheduler._createEventsTree(events);
            const [, secondNode, thirdNode] = scheduler._eventTree;

            expect(secondNode).toEqual({
                start: eventCStartValue,
                end: eventCEndValue,
                leaf: false,
            });

            expect(thirdNode).toEqual({
                start: eventBStartValue,
                end: eventAEndValue,
                leaf: false,
            });
        });

        it("should create second part of the nodes with link to the events from  which they are created", () => {
            scheduler._createEventsTree(events);
            const [,,, fourNode, fiveNode, sixNode] = scheduler._eventTree;

            expect(fourNode).toEqual({
                events: [SSASubtitleEventC],
                start: eventCStartValue,
                end: eventCEndValue,
                leaf: true,
            });

            expect(fiveNode).toEqual({
                events: [SSASubtitleEventB],
                start: eventBStartValue,
                end: eventBEndValue,
                leaf: true,
            });

            expect(sixNode).toEqual({
                events: [SSASubtitleEventA],
                start: eventAStartValue,
                end: eventAEndValue,
                leaf: true,
            });
        });
    });

    describe("#getVisibleAtTime", () => {
        beforeEach(() => {
            scheduler._createEventsTree(events);
        });

        it("should return empty array if time is out of the range of the second node in the events tree", () => {
            expect(scheduler.getVisibleAtTime(0)).toEqual([]);
            expect(scheduler.getVisibleAtTime(14)).toEqual([]);
        });

        it("should return only visible events for the passed time", () => {
            expect(scheduler.getVisibleAtTime(12)).toEqual([SSASubtitleEventC]);
            expect(scheduler.getVisibleAtTime(9)).toEqual([SSASubtitleEventA, SSASubtitleEventC]);
            expect(scheduler.getVisibleAtTime(6)).toEqual([SSASubtitleEventC, SSASubtitleEventB, SSASubtitleEventA]);
        });
    });

    describe("#setEvents", () => {
        const eventsTree = 'eventsTree';

        beforeEach(() => {
            Object.defineProperty(scheduler, '_createEventsTree', { writable: true });
            scheduler._createEventsTree = jest.fn().mockName('_createEventsTree').mockImplementation(() => {
                scheduler._eventTree = eventsTree;
            });
        });

        it("should set events", () => {
            scheduler.setEvents(events);

            expect(scheduler._createEventsTree).toBeCalledWith(events);
            expect(scheduler._eventTree).toBe(eventsTree);
        });
    });
});
