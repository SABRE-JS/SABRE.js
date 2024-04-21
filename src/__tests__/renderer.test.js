{
    const { mockDOM } = require('node-canvas-webgl');
    mockDOM(window);
}
global = globalThis;
require('../util.js')
require('../global-constants.js')
require('../color.js');
require('../style.js');
require('../lib/codepage.js');
require('../text-server.js');
require('../style-override.js');
require('../subtitle-event.js');
require("../subtitle-tags.js");
require("../subtitle-parser.js");
require("../scheduler.js");
require("../shader.js");
require("../font-server.js");
require("../canvas-2d-text-renderer.js");
require("../canvas-2d-shape-renderer.js");
require("../lib/BSpline.js");
require("../lib/earcut.js");
require("../renderer-main.js");

sabre.getScriptPath = function(){
        return __dirname+"/../";
    };

const opentype = require("./test-modules/opentype.compat.min.js");

const loadFile = (function(){
    const { readFileSync } = require('fs');
    return function(file){
        return readFileSync(__dirname+"/testfiles/" + file,null);
    }
})();

const loadFileAsDataURI = (function(file,mime){
    const data = loadFile(file);
    return "data:"+mime+";base64,"+data.toString('base64');
});

const compareImages = (function(){
    const compare = require("./test-utils/image-comparison.utils.js");
    return (function(){
        function canvasToImageData(inputCanvas){
            const wantedColorSpace = (window.matchMedia && window.matchMedia("(color-gamut: p3)").matches ? "display-p3" : "srgb");
            if(inputCanvas.width > 0 && inputCanvas.height > 0){
                ctx = inputCanvas.getContext("2d");
                const imageData = ctx.getImageData(0,0,inputCanvas.width,inputCanvas.height,{colorSpace:wantedColorSpace});
                return imageData;
            }else{
                throw new Error("Canvas too small to compare.");
            }
        }
        return function(canvas1,canvas2){
            const imageData1 = canvasToImageData(canvas1);
            const imageData2 = canvasToImageData(canvas2);
            return compare(imageData1,imageData2);
        }
    })();
})();

describe("Subtitle Renderer", () => {

    describe("Canvas2DTextRenderer", () => {
        
    });

    describe("Canvas2DShapeRenderer", () => {
        
    });

    describe("Integration Tests", () => {

        const SubtitlesOctopus = require("libass-wasm");

        const octopus_options_template = Object.freeze({
            workerUrl: require.resolve('libass-wasm/dist/js/subtitles-octopus-worker.js'),
            legacyWorkerUrl: require.resolve('libass-wasm/dist/js/subtitles-octopus-worker-legacy.js'),
        });

        let canvas;
        let octopus_canvas;

        const fontsList = [
            "fonts/OpenSans-Light.ttf",
            "fonts/OpenSans-Regular.ttf",
            "fonts/OpenSans-Medium.ttf",
            "fonts/OpenSans-SemiBold.ttf",
            "fonts/OpenSans-Bold.ttf",
            "fonts/OpenSans-ExtraBold.ttf",
            "fonts/OpenSans-LightItalic.ttf",
            "fonts/OpenSans-Italic.ttf",
            "fonts/OpenSans-MediumItalic.ttf",
            "fonts/OpenSans-SemiBoldItalic.ttf",
            "fonts/OpenSans-BoldItalic.ttf",
            "fonts/OpenSans-ExtraBoldItalic.ttf",
            "fonts/Rosario-Regular.otf"
        ];
        const fontUrls = fontsList.map(font => loadFileAsDataURI(font,(font.endsWith(".otf") ? "font/otf" : "font/ttf")));
        const fonts = fontsList.map(font => opentype.parse(loadFile(font)));
        
        beforeEach(() => {
            canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            
            octopus_canvas = document.createElement('canvas');
            octopus_canvas.width = 640;
            octopus_canvas.height = 480;
        });

        describe("Basic Tests", () => {
           test("Can we initialize the renderer?", () => {
                const renderer = external.SABRERenderer({
                    fonts: fonts,
                    subtitles: loadFile("tag_tests.ass"),
                    colorSpace:external.VideoColorSpaces.AUTOMATIC,
                    resolution:[640,480],
                    nativeResolution:[640,480]
                });
                expect(renderer.checkReadyToRender()).toBe(true);
           });
        });
        /*
        describe("Comparison Tests", () => {
            let testBuffer;
            let testUri;
            let sabre, octopus;

            beforeEach(() => {
                const octopus_options = Object.freeze(Object.assign({
                    subUrl: testUri
                },octopus_options_template));
                octopus = new SubtitlesOctopus(octopus_options);
            });

            afterEach(() => {
                octopus.dispose();
            });
            
            describe("Tag Tests", () => {
                beforeAll(() => {
                    testBuffer = loadFile("./testfiles/tag_tests.ass");
                    testUri = loadFile("./testfiles/tag_tests.ass");
                });

            });

        });
        */
    });
});
