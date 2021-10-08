global = globalThis;
require("../style.js");

const styleDefinitionPrimitiveFields = [
    'Name',
    'FontName',
    'FontSize',
    'Weight',
    'Italic',
    'Underline',
    'Strikeout',
    'Spacing',
    'Angle',
    'BorderStyle',
    'Shadow',
    'Alignment',
    'Encoding',
    'ScaleX',
    'ScaleY',
    'OutlineX',
    'OutlineY',
];
const styleDefinitionPrimitiveFieldsAliases = {
    Name: 'n',
    FontName: 'fn',
    FontSize: 'fs',
    Weight: 'w',
    Italic: 'i',
    Underline: 'u',
    Strikeout: 'st',
    Spacing: 'sp',
    Angle: 'an',
    BorderStyle: 'bs',
    Shadow: 'sh',
    Alignment: 'al',
    Encoding: 'en',
    ScaleX: 'sx',
    ScaleY: 'sy',
    OutlineX: 'ox',
    OutlineY: 'oy',
}

describe("SSAStyleDefinition", () => {
    let style;

    let defaultStyleDefinitionObject;

    beforeEach(() => {
        sabre.SSAColor = jest.fn().mockName('SSAColor').mockImplementation((color) => ({ color }))
    });

    beforeEach(() => {
        defaultStyleDefinitionObject = {
            al: 2,
            bs: 1,
            en: 1,
            fn: "Arial",
            fs: 18,
            m: [ 20, 20, 20 ],
            n: "Default",
            pc: { color: 0x00ffffff },
            qc: { color: 0x00000080 },
            sc: { color: 0x00ffff00 },
            sh: 3,
            sp: 0,
            sx: 1,
            sy: 1,
            tc: { color: 0x00000000 },
            w: 200
        }
    });

    beforeEach(() => {
        style = sabre.SSAStyleDefinition();
    });

    describe("#toJSON", () => {
        it("should return style definition object", () => {
            expect(style.toJSON()).toEqual(defaultStyleDefinitionObject)
        });
    });

    describe("primitive methods setters/getters", () => {
        styleDefinitionPrimitiveFields.forEach((fieldName) => {
            describe(`#set${fieldName} / #get${fieldName}`, () => {
                const fieldValue = `${fieldName}Value`;

                it(`should set style definition ${fieldName}`, () => {
                    style[`set${fieldName}`](fieldValue);
                    expect(style.toJSON()[styleDefinitionPrimitiveFieldsAliases[fieldName]]).toBe(fieldValue)
                });

                it(`should get style definition ${fieldName}`, () => {
                    expect(style[`get${fieldName}`]()).toBe(defaultStyleDefinitionObject[styleDefinitionPrimitiveFieldsAliases[fieldName]])
                });
            });

        })
    });

    describe("#setPrimaryColor / #getPrimaryColor", () => {
        let primaryColor = 'primaryColor';

        it("should set style definition primary color", () => {
            style.setPrimaryColor(primaryColor);
            expect(style.toJSON().pc).toBe(primaryColor)
        });

        it("should get style definition primary color", () => {
            expect(style.getPrimaryColor()).toEqual(defaultStyleDefinitionObject.pc)
        });
    });

    describe("#setSecondaryColor / #getSecondaryColor", () => {
        let secondaryColor = 'secondaryColor';

        it("should set style definition secondary color", () => {
            style.setSecondaryColor(secondaryColor);
            expect(style.toJSON().sc).toBe(secondaryColor)
        });

        it("should get style definition secondary color", () => {
            expect(style.getSecondaryColor()).toEqual(defaultStyleDefinitionObject.sc)
        });
    });

    describe("#setTertiaryColor / #getTertiaryColor", () => {
        let tertiaryColor = 'tertiaryColor';

        it("should set style definition tertiary color", () => {
            style.setTertiaryColor(tertiaryColor);
            expect(style.toJSON().tc).toBe(tertiaryColor)
        });

        it("should get style definition tertiary color", () => {
            expect(style.getTertiaryColor()).toEqual(defaultStyleDefinitionObject.tc)
        });
    });

    describe("#setQuaternaryColor / #getQuaternaryColor", () => {
        let quaternaryColor = 'quaternaryColor';

        it("should set style definition quaternary color", () => {
            style.setQuaternaryColor(quaternaryColor);
            expect(style.toJSON().qc).toBe(quaternaryColor)
        });

        it("should get style definition quaternary color", () => {
            expect(style.getQuaternaryColor()).toEqual(defaultStyleDefinitionObject.qc)
        });
    });


    describe("#setScale", () => {
        const scale = 'scale';

        it("should set style definition scale x and y from the passed scale", () => {
            style.setScale(scale);
            expect(style.getScaleX()).toBe(scale);
            expect(style.getScaleY()).toBe(scale);
        });
    });

    describe("#setOutline", () => {
        const outline = 'outline';

        it("should set style definition outline x and y from the passed outline", () => {
            style.setOutline(outline);
            expect(style.getOutlineX()).toBe(outline);
            expect(style.getOutlineY()).toBe(outline);
        });
    });

    describe("#setMargins / #getMargins", () => {
        const marginLeft = 'marginLeft';
        const marginRight = 'marginRight';
        const marginVertical = 'marginVertical';

        it("should set style definition margins", () => {
            style.setMargins(marginLeft, marginRight, marginVertical);
            expect(style.toJSON().m).toEqual([marginLeft, marginRight, marginVertical]);
        });

        it("should get style definition margins", () => {
            expect(style.getMargins()).toEqual(defaultStyleDefinitionObject.m);
        });
    });

    describe("#setMarginLeft", () => {
        const marginLeft = 'marginLeft';

        it("should set style definition margin left", () => {
            style.setMarginLeft(marginLeft);
            expect(style.getMargins()[0]).toBe(marginLeft);
        });
    });

    describe("#setMarginRight", () => {
        const marginRight = 'marginRight';

        it("should set style definition margin right", () => {
            style.setMarginRight(marginRight);
            expect(style.getMargins()[1]).toBe(marginRight);
        });
    });

    describe("#setMarginVertical", () => {
        const marginVertical = 'marginVertical';

        it("should set style definition margin c", () => {
            style.setMarginVertical(marginVertical);
            expect(style.getMargins()[2]).toBe(marginVertical);
        });
    });
});
