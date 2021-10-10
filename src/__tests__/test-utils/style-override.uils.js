global = globalThis;
const { clip } = require('../test-constants/style-override.constants');

const getClipTest = (override) => {
    const { a, b, c, d, expectedClip } = clip;

    describe("#getClip", () => {
        it("should return null if clip is not defined", () => {
            expect(override.getClip()).toBeNull();
        });

        it("should return new clip array if it is defined", () => {
            override.setClip(a, b, c, d);
            const clip = override.getClip();

            expect(clip).not.toBe(override.getClip())
            expect(clip).toEqual(expectedClip)
        });
    });
}

const testArrayValuesMethod = (override, fieldName, alias, ...args) => {
    describe(`#set${fieldName} / #get${fieldName}`, () => {
        it(`should set field ${fieldName}`, () => {
            override[`set${fieldName}`](...args);
            expect(override.toJSON()[alias]).toEqual(args)
        });

        it(`should get field ${fieldName}`, () => {
            override[`set${fieldName}`](...args);
            expect(override[`get${fieldName}`]()).toEqual(args);
        });
    });
}

const testSetInvalidRotations = (override) => {
    describe("#setRotation", () => {
        const defaultRotations = override.getRotation();

        it("should set default rotation if passed rotation axis is null", () => {
            override.setRotation(null, null, null);
            expect(override.getRotation()).toEqual(defaultRotations);
        });
    });
}

const testSetOutline = (override) => {
    describe("#setOutline", () => {
        const outline = 'outline';

        it("should set outline x and y based on passed outline", () => {
            override.setOutline(outline);
            expect(override.getOutlineX()).toBe(outline);
            expect(override.getOutlineY()).toBe(outline);
        });
    });
}

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
}

module.exports = {
    getClipTest,
    testArrayValuesMethod,
    testSetInvalidRotations,
    testSetOutline,
    testSetShadow
}
