global = globalThis;
require("../util.js");

describe("#performTransition", () => {
    let performTransition;

    let curtime;
    let originalValue;
    let transitionValue;
    let start;
    let end;
    let acceleration;

    beforeEach(() => {
        performTransition = sabre.performTransition;
    });

    beforeEach(() => {
        curtime = 18;
        originalValue = 25;
        transitionValue = 14;
        start = 13;
        end = 26;
        acceleration = 2;
    });

    it("should return original value if transition value is null", () => {
        transitionValue = null;
        expect(
            performTransition(
                curtime,
                originalValue,
                transitionValue,
                start,
                end,
                acceleration
            )
        ).toBe(originalValue);
    });

    it("should return original value if current time less than start", () => {
        curtime = start - 1;
        expect(
            performTransition(
                curtime,
                originalValue,
                transitionValue,
                start,
                end,
                acceleration
            )
        ).toBe(originalValue);
    });

    it("should return transition value if current time more or equal than end", () => {
        curtime = end;
        expect(
            performTransition(
                curtime,
                originalValue,
                transitionValue,
                start,
                end,
                acceleration
            )
        ).toBe(transitionValue);

        curtime = end + 1;
        expect(
            performTransition(
                curtime,
                originalValue,
                transitionValue,
                start,
                end,
                acceleration
            )
        ).toBe(transitionValue);
    });

    it("should return transition value calculated based on the passed arguments", () => {
        expect(
            performTransition(
                curtime,
                originalValue,
                transitionValue,
                start,
                end,
                acceleration
            )
        ).toBe(23.37278106508876);
    });
});

describe("#stringEqualsCaseInsensitive", () => {
    let stringEqualsCaseInsensitive;

    let a;
    let b;

    beforeEach(() => {
        stringEqualsCaseInsensitive = sabre.stringEqualsCaseInsensitive;
    });

    beforeEach(() => {
        a = "a";
        b = "b";
    });

    it("should return true if strings are equal even with different register", () => {
        b = a;
        expect(stringEqualsCaseInsensitive(a, b)).toBeTruthy();

        b = a.toUpperCase();
        expect(stringEqualsCaseInsensitive(a, b)).toBeTruthy();
    });

    it("should return false if strings are not equal", () => {
        expect(stringEqualsCaseInsensitive(a, b)).toBeFalsy();
    });

    it("should return result of comparisons of two values by the link if they are not strings", () => {
        expect(stringEqualsCaseInsensitive(1, 2)).toBeFalsy();
        expect(stringEqualsCaseInsensitive(1, 1)).toBeTruthy();
        expect(stringEqualsCaseInsensitive({}, {})).toBeFalsy();
        expect(
            stringEqualsCaseInsensitive(
                stringEqualsCaseInsensitive,
                stringEqualsCaseInsensitive
            )
        ).toBeTruthy();
    });
});
