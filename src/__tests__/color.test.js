global = globalThis;
require("../color.js");

const jsonFix = function (key, value) {
    if (value === null) return "null";
    else if (typeof value === "number" && global.isNaN(value)) return "NaN";
    return value;
};
describe("SSAColor", () => {
    describe("#constructor", () => {
        test("Are hex inputs to SSAColor handled correctly?", () => {
            let color = new sabre.SSAColor(0x12345678);
            expect(color.getR()).toBe(0x78 / 255);
            expect(color.getG()).toBe(0x56 / 255);
            expect(color.getB()).toBe(0x34 / 255);
            expect(color.getA()).toBe((255 - 0x12) / 255);
        });

        test("Are individual hex inputs to SSAColor handled correctly?", () => {
            let color = new sabre.SSAColor(0x12, 0x34, 0x43, 0x21);
            expect(color.getR()).toBe(0x12 / 255);
            expect(color.getG()).toBe(0x34 / 255);
            expect(color.getB()).toBe(0x43 / 255);
            expect(color.getA()).toBe(0x21 / 255);
        });

        test("Are individual floating point inputs to SSAColor handled correctly?", () => {
            let color = new sabre.SSAColor(0.1, 0.2, 0.3, 0.4);
            expect(color.getR()).toBe(0.1);
            expect(color.getG()).toBe(0.2);
            expect(color.getB()).toBe(0.3);
            expect(color.getA()).toBe(0.4);
        });
    });

    describe("#toJSON", () => {
        test("should serialize correctly.", () => {
            let color = new sabre.SSAColor(0x87654321);
            expect(JSON.stringify(color, jsonFix)).toBe(
                "[0.12941176470588237,0.2627450980392157,0.396078431372549,0.47058823529411764]"
            );
        });
    });
});

describe("SSAOverrideColor", () => {
    describe("#constructor", () => {
        test("Are individual hex inputs to SSAOverrideColor handled correctly?", () => {
            let color = new sabre.SSAOverrideColor(0x12, 0x34, 0x43, 0x21);
            expect(color.getR()).toBe(0x12 / 255);
            expect(color.getG()).toBe(0x34 / 255);
            expect(color.getB()).toBe(0x43 / 255);
            expect(color.getA()).toBe(0x21 / 255);
        });

        test("Are individual floating point inputs to SSAOverrideColor handled correctly?", () => {
            let color = new sabre.SSAOverrideColor(0.1, 0.2, 0.3, 0.4);
            expect(color.getR()).toBe(0.1);
            expect(color.getG()).toBe(0.2);
            expect(color.getB()).toBe(0.3);
            expect(color.getA()).toBe(0.4);
        });

        test("Does SSAOverrideColor store null values correctly?", () => {
            let color = new sabre.SSAOverrideColor(0.1, null, 0.3, null);
            expect(color.getR()).toBe(0.1);
            expect(color.getG()).toBe(null);
            expect(color.getB()).toBe(0.3);
            expect(color.getA()).toBe(null);
        });

        test("Does SSAOverrideColor with empty constructor work correctly?", () => {
            let color = new sabre.SSAOverrideColor();
            expect(color.getR()).toBe(null);
            expect(color.getG()).toBe(null);
            expect(color.getB()).toBe(null);
            expect(color.getA()).toBe(null);
            expect(color.toJSON()).toEqual([null, null, null, null]);
        });
    });

    describe("#setR", () => {
        test("Does changing the red color component work?", () => {
            let color = new sabre.SSAOverrideColor(0.1, 0.2, 0.3, 0.4);
            color.setR(0.5);
            expect(color.getR()).toBe(0.5);
            expect(color.getG()).toBe(0.2);
            expect(color.getB()).toBe(0.3);
            expect(color.getA()).toBe(0.4);
        });
    });

    describe("#setG", () => {
        test("Does changing the green color component work?", () => {
            let color = new sabre.SSAOverrideColor(0.1, 0.2, 0.3, 0.4);
            color.setG(0.6);
            expect(color.getR()).toBe(0.1);
            expect(color.getG()).toBe(0.6);
            expect(color.getB()).toBe(0.3);
            expect(color.getA()).toBe(0.4);
        });
    });

    describe("#setB", () => {
        test("Does changing the blue color component work?", () => {
            let color = new sabre.SSAOverrideColor(0.1, 0.2, 0.3, 0.4);
            color.setB(0.7);
            expect(color.getR()).toBe(0.1);
            expect(color.getG()).toBe(0.2);
            expect(color.getB()).toBe(0.7);
            expect(color.getA()).toBe(0.4);
        });
    });

    describe("#setA", () => {
        test("Does changing the alpha color component work?", () => {
            let color = new sabre.SSAOverrideColor(0.1, 0.2, 0.3, 0.4);
            color.setA(0.8);
            expect(color.getR()).toBe(0.1);
            expect(color.getG()).toBe(0.2);
            expect(color.getB()).toBe(0.3);
            expect(color.getA()).toBe(0.8);
        });
    });

    describe("#toJSON", () => {
        test("Does the function return correct values for serialization?", () => {
            let color = new sabre.SSAOverrideColor(0x87, null, 0x43, null);
            expect(color.toJSON()).toEqual([
                0.5294117647058824,
                null,
                0.2627450980392157,
                null
            ]);
        });

        test("Does SSAOverrideColor serialize correctly?", () => {
            let color = new sabre.SSAOverrideColor(0x87, null, 0x43, null);
            expect(JSON.stringify(color, jsonFix)).toBe(
                '[0.5294117647058824,"null",0.2627450980392157,"null"]'
            );
        });
    });

    describe("#clone", () => {
        test("Does SSAOverrideColor clone correctly", () => {
            let color = new sabre.SSAOverrideColor(0x87, null, 0x43, null);
            let clone = color.clone();
            expect(color.toJSON()).toEqual([
                0.5294117647058824,
                null,
                0.2627450980392157,
                null
            ]);
            expect(clone.toJSON()).toEqual([
                0.5294117647058824,
                null,
                0.2627450980392157,
                null
            ]);
            expect(color === clone).toBeFalsy();
        });
    });

    describe("#applyOverride", () => {
        test("Does SSAOverrideColor applyOverride correctly?", () => {
            let override_color = new sabre.SSAOverrideColor(
                0x87,
                null,
                0x43,
                null
            );
            let color = new sabre.SSAColor(0xff, 0xff, 0xff, 0xff);
            let newcolor = override_color.applyOverride(color);
            expect(newcolor.toJSON()).toEqual([
                0.5294117647058824, 1, 0.2627450980392157, 1
            ]);
            expect(color === newcolor).toBe(false);
            expect(override_color === newcolor).toBe(false);
        });
    });
});
