global = globalThis;
require("../subtitle-event.js");

const testPrimitiveMethods = require('./test-utils/primitive-values-methods.utils');

const subtitleEventPrimitiveFieldsAliases = {
    Id: 'id',
    Start: 's',
    End: 'e',
    Text: 't',
    Layer: 'l',
    Style: 'st',
    Overrides: 'o',
    LineOverrides: 'lO',
};

describe("SSASubtitleEvent", () => {
    let subtitleEvent;

    beforeEach(() => {
        subtitleEvent = new sabre.SSASubtitleEvent();
    });

    describe("#toJSON", () => {
        const defaultSubtitleEvent = {
            e: 0,
            id: NaN,
            l: 0,
            lO: null,
            o: null,
            s: 0,
            st: null,
            t: null
        };

        it("should return subtitle event object", () => {
            expect(subtitleEvent.toJSON()).toEqual(defaultSubtitleEvent);
        });
    });

    describe("#setLineTransitionTargetOverrides / getLineTransitionTargetOverrides", () => {
        const lineOverrides = 'lineOverrides';

        it("should return undefined if line overrides is not defined", () => {
            expect(subtitleEvent.getLineTransitionTargetOverrides()).toBeUndefined();
        });

        it("should be able to set and get line overrides", () => {
            subtitleEvent.setLineTransitionTargetOverrides(lineOverrides);
            expect(subtitleEvent.getLineTransitionTargetOverrides()).toBe(lineOverrides);
        });
    });

    testPrimitiveMethods(sabre.SSASubtitleEvent(), subtitleEventPrimitiveFieldsAliases);
});
