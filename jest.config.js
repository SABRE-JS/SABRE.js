// jest.config.js
// Sync object
const config = {
    verbose: true,
    globals: {
        "sabre": {
            "include": function () {},
            "import": function () {}
        },
        "external": {}
    },
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["includes", "constants", "utils"],
    extraGlobals: ["Math", "Object", "isNaN", "URL", "parseInt", "parseFloat"],
    cacheDirectory: "./tdata/cache"
};

module.exports = config;
