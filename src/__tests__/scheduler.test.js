require("../scheduler.js");

describe("SubtitleScheduler", () => {
    let scheduler;

    beforeEach(() => {
        scheduler = new sabre.SubtitleScheduler();
    });

    describe("#_eventListComparator", () => {
        let SSASubtitleEventA;
        let SSASubtitleEventB;

        const eventAStartValue = 10;
        const eventBStartValue = 6;
        const eventsStartValueDiff = eventAStartValue - eventBStartValue;

        const eventAEndValue = 5;
        const eventBEndValue = 3;
        const eventsEndValueDiff = eventAEndValue - eventBEndValue;

        beforeEach(() => {
            SSASubtitleEventA ={
                getStart: jest.fn().mockName('getStart').mockReturnValue(eventAStartValue),
                getEnd: jest.fn().mockName('getEnd').mockReturnValue(eventAEndValue),
            };
            SSASubtitleEventB ={
                getStart: jest.fn().mockName('getStart').mockReturnValue(eventBStartValue),
                getEnd: jest.fn().mockName('getEnd').mockReturnValue(eventBEndValue)
            };
        });

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
});
