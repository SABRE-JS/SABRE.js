// jest.config.js
// Sync object
const config = {
    verbose: true,
    testMatch: ["**/__tests__/**/*.test.js"],
    globals: {
        "sabre": {
            "include": function () {},
            "import": function () {}
        },
        "external": {}
    },
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["includes", "test-constants", "test-utils"],
    sandboxInjectedGlobals: [
        "Math",
        "Object",
        "isNaN",
        "URL",
        "parseInt",
        "parseFloat"
    ],
    cacheDirectory: "./tdata/cache"
};

module.exports = config;
