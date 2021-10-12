global = globalThis;
require("../subtitle-event.js");

const testPrimitiveMethods = require("./test-utils/primitive-values-methods.utils");

const subtitleEventPrimitiveFieldsAliases = {
    Id: "id",
    Start: "s",
    End: "e",
    Text: "t",
    Layer: "l",
    Style: "st",
    Overrides: "o",
    LineOverrides: "lO",
    LineTransitionTargetOverrides: "tO"
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
            t: null,
            tO: null
        };

        it("should return subtitle event object", () => {
            expect(subtitleEvent.toJSON()).toEqual(defaultSubtitleEvent);
        });
    });

    testPrimitiveMethods(
        sabre.SSASubtitleEvent(),
        subtitleEventPrimitiveFieldsAliases
    );
});
