global = globalThis;
require("../style-override.js");

describe("SSALineTransitionTargetOverride", () => {
    let lineTransitionTargetOverride;

    const a = 'a';
    const b = 'b';
    const c = 'c';
    const d = 'd';

    beforeEach(() => {
        lineTransitionTargetOverride= sabre.SSALineTransitionTargetOverride();
    });

    describe("#toJSON", () => {
        it("should return translation target override object", () => {
            expect(lineTransitionTargetOverride.toJSON()).toEqual({ cl: null });
        });
    });

    describe("#setClip", () => {
        it("should set clip value from passed arguments", () => {
            lineTransitionTargetOverride.setClip(a, b, c, d);
            expect(lineTransitionTargetOverride.toJSON().cl).toEqual([a, b, c, d])
        });
    });

    describe("#getClip", () => {
        it("should return null if clip is not defined", () => {
            expect(lineTransitionTargetOverride.getClip()).toBeNull();
        });

        it("should return new clip array if it is defined", () => {
            lineTransitionTargetOverride.setClip(a, b, c, d);
            const clip = lineTransitionTargetOverride.getClip();

            expect(clip).not.toBe(lineTransitionTargetOverride.getClip())
            expect(clip).toEqual([a, b, c, d])
        });
    });
});
