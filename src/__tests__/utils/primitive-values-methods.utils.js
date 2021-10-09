const testPrimitiveMethods = (testedObject, primitiveMethodsWithAliases) => {
    Object.entries(primitiveMethodsWithAliases).forEach(([fieldName, alias]) => {
        const value = `${fieldName}Value`;

        describe(`#set${fieldName} / #get${fieldName}`, () => {
            it(`should set field ${fieldName}`, () => {
                testedObject[`set${fieldName}`](value);
                expect(testedObject.toJSON()[alias]).toBe(value)
            });

            it(`should get field ${fieldName}`, () => {
                testedObject[`set${fieldName}`](value);
                expect(testedObject[`get${fieldName}`]()).toBe(value);
            });
        });
    });
}

module.exports = testPrimitiveMethods;
