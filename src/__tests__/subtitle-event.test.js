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
    LineOverrides: "lO"
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
            nl: false,
            o: null,
            or: NaN,
            s: 0,
            st: null,
            t: null,
            tO: []
        };

        it("should return subtitle event object", () => {
            expect(subtitleEvent.toJSON()).toEqual(defaultSubtitleEvent);
        });
    });

    //TODO: Test line transition override arrays.

    testPrimitiveMethods(
        sabre.SSASubtitleEvent(),
        subtitleEventPrimitiveFieldsAliases
    );
});
