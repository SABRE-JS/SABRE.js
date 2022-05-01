global = globalThis;
const { clip } = require("../test-constants/style-override.constants");

const getClipTest = (override) => {
    const { a, b, c, d, expectedClip } = clip;

    describe("#getClip", () => {
        it("should return null if clip is not defined", () => {
            expect(override.getClip()).toBeNull();
        });

        it("should return new clip array if it is defined", () => {
            override.setClip(a, b, c, d);
            const clip = override.getClip();

            expect(clip).not.toBe(override.getClip());
            expect(clip).toEqual(expectedClip);
        });
    });
};

const testArrayValuesMethod = (override, fieldName, alias, ...args) => {
    describe(`#set${fieldName} / #get${fieldName}`, () => {
        it(`should set field ${fieldName}`, () => {
            override[`set${fieldName}`](...args);
            expect(override.toJSON()[alias]).toEqual(args);
        });

        it(`should get field ${fieldName}`, () => {
            override[`set${fieldName}`](...args);
            expect(override[`get${fieldName}`]()).toEqual(args);
        });
    });
};
/*
const testArrayAppendMethod = (override, fieldName, alias) => {
    describe(`#add${fieldName} / #get${fieldName}s`, () => {
        it(`should append to array ${fieldName}`, () => {
            let a = {a:"test1"};
            let b = {b:"test2"};
            override[`add${fieldName}`](a);
            override[`add${fieldName}`](b);
            expect(override.toJSON()[alias]).toEqual([a,b]);
        });

        it(`should get field ${fieldName}`, () => {
            let testString = "test3";
            override[`add${fieldName}`](testString);
            expect(overide[`get${fieldName}s`]()).arrayContaining([testString]);
        });
    });
}
*/
const testSetInvalidRotations = (override) => {
    describe("#setRotation", () => {
        it("should set default rotation if passed rotation axis is null", () => {
            override.setRotation(null, null, null);
            expect(override.getRotation()).toEqual([0, 0, 0]);
        });
    });
};

const testSetOutline = (override) => {
    describe("#setOutline", () => {
        const outline = "outline";

        it("should set outline x and y based on passed outline", () => {
            override.setOutline(outline);
            expect(override.getOutlineX()).toBe(outline);
            expect(override.getOutlineY()).toBe(outline);
        });
    });
};

const testSetShadow = (override) => {
    describe("#setShadow", () => {
        const shadow = 12;
        const effectiveShadowValue = shadow / Math.sqrt(2);

        it("should set shadow x and y based on effective value for passed shadow", () => {
            override.setShadow(shadow);
            expect(override.getShadowX()).toBe(effectiveShadowValue);
            expect(override.getShadowY()).toBe(effectiveShadowValue);
        });
    });
};

module.exports = {
    getClipTest,
    testArrayValuesMethod,
    //    testArrayAppendMethod,
    testSetInvalidRotations,
    testSetOutline,
    testSetShadow
};
