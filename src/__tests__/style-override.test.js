global = globalThis;
require("../style-override.js");

const constants = require('./test-constants/style-override.constants');
const utils = require('./test-utils/style-override.uils');
const testPrimitiveMethods = require('./test-utils/primitive-values-methods.utils');

const { defaultStyleOverride, defaultTransitionTargetOverride } = constants;
const { a, b, c, d, expectedClip } = constants.clip;


describe("style-override", () => {
    describe("SSATransitionTargetOverride", () => {
        let transitionTargetOverride;

        beforeEach(() => {
            transitionTargetOverride = sabre.SSATransitionTargetOverride();
        });

        describe("#toJSON", () => {
            it("should return style override object", () => {
                expect(transitionTargetOverride.toJSON()).toEqual(defaultTransitionTargetOverride);
            });
        });

        utils.testSetShadow(sabre.SSATransitionTargetOverride());
        utils.testSetOutline(sabre.SSATransitionTargetOverride());
        utils.testSetInvalidRotations(sabre.SSATransitionTargetOverride());
        utils.testArrayValuesMethod(sabre.SSATransitionTargetOverride(), 'Rotation', 'r', ...constants.rotations);
        testPrimitiveMethods(sabre.SSATransitionTargetOverride(), constants.transitionTargetOverridePrimitiveFieldsAliases);
    });

    describe("SSAStyleOverride", () => {
        let styleOverride;

        beforeEach(() => {
            styleOverride = sabre.SSAStyleOverride();
        });

        describe("#toJSON", () => {
            it("should return style override object", () => {
                expect(styleOverride.toJSON()).toEqual(defaultStyleOverride);
            });
        });

        describe("change font size mod", () => {
            const defaultFontSize = 10;
            const diffFontSize = 5;

            describe("#increaseFontSizeMod", () => {
                it("should increase font size based on passed size", () => {
                    styleOverride.setFontSizeMod(defaultFontSize);
                    expect(styleOverride.getFontSizeMod()).toBe(defaultFontSize);

                    styleOverride.increaseFontSizeMod(diffFontSize);
                    expect(styleOverride.getFontSizeMod()).toBe(defaultFontSize + diffFontSize);
                });
            });

            describe("#decreaseFontSizeMod", () => {
                it("should increase font size based on passed size", () => {
                    styleOverride.setFontSizeMod(defaultFontSize);
                    expect(styleOverride.getFontSizeMod()).toBe(defaultFontSize);

                    styleOverride.decreaseFontSizeMod(diffFontSize);
                    expect(styleOverride.getFontSizeMod()).toBe(defaultFontSize - diffFontSize);
                });

                it("should return 0 if reduced value is less than 0", () => {
                    styleOverride.setFontSizeMod(diffFontSize);
                    styleOverride.decreaseFontSizeMod(defaultFontSize);
                    expect(styleOverride.getFontSizeMod()).toBe(0);
                    expect(defaultFontSize > diffFontSize).toBeTruthy();
                });
            });

            describe("#resetFontSizeMod", () => {
                it("should reset font size mod to 0", () => {
                    styleOverride.setFontSizeMod(defaultFontSize);
                    expect(styleOverride.getFontSizeMod()).toBe(defaultFontSize);

                    styleOverride.resetFontSizeMod();
                    expect(styleOverride.getFontSizeMod()).toBe(0);
                });
            });
        });

        describe("set custom margins", () => {
            it("should set margin left", () => {
                styleOverride.setMarginLeft(constants.marginLeft);
                expect(styleOverride.getMargins()).toEqual([constants.marginLeft, null, null]);
            });

            it("should set margin right", () => {
                styleOverride.setMarginRight(constants.marginRight);
                expect(styleOverride.getMargins()).toEqual([null, constants.marginRight, null]);
            });

            it("should set margin vertical", () => {
                styleOverride.setMarginVertical(constants.marginVertical);
                expect(styleOverride.getMargins()).toEqual([null, null, constants.marginVertical]);
            });
        });

        describe("#reset", () => {
            const alignment = 'alignment';

            it("should reset style override object", () => {
                styleOverride.setAlignment(alignment);
                expect(styleOverride.toJSON()).not.toEqual(defaultStyleOverride);

                styleOverride.reset();
                expect(styleOverride.toJSON()).toEqual(defaultStyleOverride);
            });
        });

        describe("#clone", () => {
            const alignment = 'alignment';

            it("should clone style override object", () => {
                styleOverride.setAlignment(alignment);
                const modifiedStylOverride =  styleOverride.toJSON();

                const clonedStyleOverride = styleOverride.clone();
                styleOverride.reset();

                expect(styleOverride.toJSON()).not.toEqual(modifiedStylOverride);
                expect(clonedStyleOverride.toJSON()).toEqual(modifiedStylOverride);
            });
        });

        describe("#_cloneHelper", () => {
            const shearX = 'shearX';
            const shearY = 'shearY';

            it("should replace style override properties based on the passed object values", () => {
                expect(styleOverride.getShearX()).not.toBe(shearX);
                expect(styleOverride.getShearY()).not.toBe(shearY);

                styleOverride._cloneHelper({ shearX, shearY });

                expect(styleOverride.getShearX()).toBe(shearX);
                expect(styleOverride.getShearY()).toBe(shearY);
            });
        });

        utils.testSetShadow(sabre.SSAStyleOverride());
        utils.testSetOutline(sabre.SSAStyleOverride());
        utils.testSetInvalidRotations(sabre.SSAStyleOverride());
        utils.testArrayValuesMethod(sabre.SSAStyleOverride(), 'Margins', 'm', ...constants.margins);
        utils.testArrayValuesMethod(sabre.SSAStyleOverride(), 'Rotation', 'r', ...constants.rotations);
        testPrimitiveMethods(sabre.SSAStyleOverride(), constants.styleOverridePrimitiveFieldsAliases);
    });

    describe("SSALineStyleOverride", () => {
        let lineStyleOverride;

        const movementX1 = 'movementX1';
        const movementY1 = 'movementY1';
        const movementX2 = 'movementX2';
        const movementY2 = 'movementY2';
        const movementT1 = 'movementT1';
        const movementT2 = 'movementT2';

        const positionX = 'positionX';
        const positionY = 'positionY';

        const rotationOriginX = 'rotationOriginX';
        const rotationOriginY = 'rotationOriginY';

        const fadeA1 = 'fadeA1';
        const fadeA2 = 'fadeA2';
        const fadeA3 = 'fadeA3';
        const fadeT1 = 'fadeT1';
        const fadeT2 = 'fadeT2';
        const fadeT3 = 'fadeT3';
        const fadeT4 = 'fadeT4';


        const clipInverted = 'clipInverted';

        beforeEach(() => {
            lineStyleOverride = sabre.SSALineStyleOverride();
        });

        describe("#toJSON", () => {
            beforeEach(() => {
                lineStyleOverride.setClip(a, b, c, d);
                lineStyleOverride.setClipInverted(clipInverted);
                lineStyleOverride.setMovement(movementX1, movementY1, movementX2, movementY2, movementT1, movementT2);
                lineStyleOverride.setPosition(positionX, positionY);
                lineStyleOverride.setRotationOrigin(rotationOriginX, rotationOriginY);
                lineStyleOverride.setFade(fadeA1, fadeA2, fadeA3, fadeT1, fadeT2, fadeT3, fadeT4);
            });

            it("should return line style override object", () => {
                expect(lineStyleOverride.toJSON()).toEqual({
                    cl: expectedClip,
                    cli: clipInverted,
                    mo: [movementX1, movementY1, movementX2, movementY2, movementT1, movementT2],
                    p: [positionX, positionY],
                    rO: [rotationOriginX, rotationOriginY],
                    f: [fadeA1, fadeA2, fadeA3, fadeT1, fadeT2, fadeT3, fadeT4]
                });
            });
        });

        describe("#getClipInverted", () => {
            it("should return clip invented value", () => {
                lineStyleOverride.setClipInverted(clipInverted);
                expect(lineStyleOverride.getClipInverted()).toBe(clipInverted);
            });
        });

        describe("#getFade", () => {
            it("should return null if fade is null", () => {
                lineStyleOverride.toJSON().fade = null;
                expect(lineStyleOverride.getFade()).toBeNull();
            });
        });

        describe("#getMovement", () => {
            it("should return null if movement is null", () => {
                lineStyleOverride.toJSON().movement = null;
                expect(lineStyleOverride.getMovement()).toBeNull();
            });
        });

        describe("#getPosition", () => {
            it("should return null if position is null", () => {
                lineStyleOverride.toJSON().position = null;
                expect(lineStyleOverride.getPosition()).toBeNull();
            });
        });

        utils.getClipTest(sabre.SSALineStyleOverride());
        utils.testArrayValuesMethod(sabre.SSALineStyleOverride(), 'Clip', 'cl', a, b);
        utils.testArrayValuesMethod(sabre.SSALineStyleOverride(), 'Clip', 'cl', a, b, c, d);
        utils.testArrayValuesMethod(sabre.SSALineStyleOverride(), 'Fade', 'f', fadeA1, fadeA2, fadeA3, fadeT1, fadeT2, fadeT3, fadeT4);
        utils.testArrayValuesMethod(sabre.SSALineStyleOverride(), 'Movement', 'mo', movementX1, movementY1, movementX2, movementY2, movementT1, movementT2);
        utils.testArrayValuesMethod(sabre.SSALineStyleOverride(), 'Position', 'p', positionX, positionY);
        utils.testArrayValuesMethod(sabre.SSALineStyleOverride(), 'RotationOrigin', 'rO', rotationOriginX, rotationOriginY);
    });

    describe("SSALineTransitionTargetOverride", () => {
        let lineTransitionTargetOverride;

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
                expect(lineTransitionTargetOverride.toJSON().cl).toEqual(expectedClip)
            });
        });

        utils.getClipTest(sabre.SSALineTransitionTargetOverride());
    });
});
