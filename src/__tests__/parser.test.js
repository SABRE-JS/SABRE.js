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

const assStyleKeys = [
    "Name",
    "Fontname",
    "Fontsize",
    "PrimaryColour",
    "SecondaryColour",
    "OutlineColour",
    "BackColour",
    "Bold",
    "Italic",
    "Underline",
    "StrikeOut",
    "ScaleX",
    "ScaleY",
    "Spacing",
    "Angle",
    "BorderStyle",
    "Outline",
    "Shadow",
    "Alignment",
    "MarginL",
    "MarginR",
    "MarginV",
    "Encoding"
];

const assEventKeys = [
    "Layer",
    "Start",
    "End",
    "Style",
    "Actor",
    "MarginL",
    "MarginR",
    "MarginV",
    "Effect",
    "Text"
];

const ssaStyleKeys = [
    "Name",
    "Fontname",
    "Fontsize",
    "PrimaryColour",
    "SecondaryColour",
    "TertiaryColour",
    "BackColour",
    "Bold",
    "Italic",
    "BorderStyle",
    "Outline",
    "Shadow",
    "Alignment",
    "MarginL",
    "MarginR",
    "MarginV",
    "AlphaLevel",
    "Encoding"
];

const ssaEventKeys = [
    "Marked",
    "Start",
    "End",
    "Style",
    "Name",
    "MarginL",
    "MarginR",
    "MarginV",
    "Effect",
    "Text"
];

const loadFile = (file) => {
    const { readFileSync } = require('fs');
    return readFileSync(__dirname+"/testfiles/" + file,null);
}

describe("Parser", () => {
    describe("#load",() => {
        test("Does basic Advanced SubStation Alpha Subtitles parsing work?", () => {
            const parser = new sabre.Parser();
            const testFile = loadFile('test1.ass');
            parser.load(testFile, [], (config) => {
                expect(config).not.toBeNull();
                expect(config.info).not.toBeNull();
                expect(config.parser).not.toBeNull();
                expect(config.renderer).not.toBeNull();

                expect(config.info.title).toBe('Test Script');
                expect(config.info.version).toBe(4);
                expect(config.info.is_ass).toBe(true);
                
                
                for(let i = 0; i < assStyleKeys.length; i++){
                    expect(config.parser.style_format[i]).toBe(assStyleKeys[i]);
                }
              
                for(let i = 0; i < assEventKeys.length; i++){
                    
                    if(config.parser.event_format[i] === "Name" && assEventKeys[i] === "Actor")
                    {
                        expect(config.parser.event_format[i]).toBe("Name");
                    }
                    else
                    {
                        expect(config.parser.event_format[i]).toBe(assEventKeys[i]);
                    }
                }
                expect(config.renderer.default_wrap_style).toBe(sabre.WrapStyleModes.SMART);
                expect(config.renderer.events).toBeInstanceOf(Array);
                expect(config.renderer.events.length).toBe(1);
                expect(JSON.stringify(config.renderer.events[0])).toBe('{"id":0,"or":0,"nl":false,"l":0,"s":0,"e":5,"st":{"n":"Default","fn":"Arial","fs":48,"pc":[1,1,1,1],"sc":[1,0,0,1],"tc":[0,0,0,1],"qc":[0,0,0,1],"w":400,"i":false,"u":false,"st":false,"sx":100,"sy":100,"sp":0,"an":0,"bs":1,"ox":2,"oy":2,"sh":1.414213562373095,"al":2,"m":[10,10,10],"en":1},"o":{"a":null,"bO":0,"bI":0,"dM":false,"dS":1,"e":null,"fN":null,"fS":null,"fSM":0,"gB":0,"i":null,"kM":0,"kS":0,"kE":0,"m":[0,0,0],"oX":null,"oY":null,"pC":null,"sC":null,"tC":null,"qC":null,"r":[0,0,0],"sX":null,"sY":null,"shX":null,"shY":null,"sheX":0,"sheY":0,"sp":null,"st":null,"t":[],"u":null,"w":null,"wS":0},"lO":{"cl":null,"cli":false,"mo":null,"p":null,"rO":null,"f":null},"tO":[],"t":"This file tests Advanced Substation Alpha parsing."}');
            });
        });
        test("Does Advanced SubStation Alpha Subtitles parsing work with arbitrary format ordering?", () => {
            const parser = new sabre.Parser();
            const testFile = loadFile('test2.ass');
            parser.load(testFile, [], (config) => {
                expect(config).not.toBeNull();
                expect(config.info).not.toBeNull();
                expect(config.parser).not.toBeNull();
                expect(config.renderer).not.toBeNull();
    
                expect(config.info.title).toBe('Test Script');
                expect(config.info.version).toBe(4);
                expect(config.info.is_ass).toBe(true);
                
                
                for(let i = 0; i < assStyleKeys.length; i++){
                    expect(config.parser.style_format[i]).toBe(assStyleKeys[assStyleKeys.length - i - 1]);
                }
                const reversedEventKeys = assEventKeys.slice(0,assEventKeys.length-1).reverse();
                for(let i = 0; i < reversedEventKeys.length; i++){
                    
                    if(config.parser.event_format[i] === "Name" && reversedEventKeys[i] === "Actor")
                    {
                        expect(config.parser.event_format[i]).toBe("Name");
                    }
                    else
                    {
                        expect(config.parser.event_format[i]).toBe(reversedEventKeys[i]);
                    }
                }
                expect(config.parser.event_format[assEventKeys.length-1]).toBe("Text");
                expect(config.renderer.default_wrap_style).toBe(sabre.WrapStyleModes.SMART);
                expect(config.renderer.events).toBeInstanceOf(Array);
                expect(config.renderer.events.length).toBe(1);
                expect(JSON.stringify(config.renderer.events[0])).toBe('{"id":0,"or":0,"nl":false,"l":0,"s":0,"e":5,"st":{"n":"Default","fn":"Arial","fs":48,"pc":[1,1,1,1],"sc":[1,0,0,1],"tc":[0,0,0,1],"qc":[0,0,0,1],"w":400,"i":false,"u":false,"st":false,"sx":100,"sy":100,"sp":0,"an":0,"bs":1,"ox":2,"oy":2,"sh":1.414213562373095,"al":2,"m":[10,10,10],"en":1},"o":{"a":null,"bO":0,"bI":0,"dM":false,"dS":1,"e":null,"fN":null,"fS":null,"fSM":0,"gB":0,"i":null,"kM":0,"kS":0,"kE":0,"m":[0,0,0],"oX":null,"oY":null,"pC":null,"sC":null,"tC":null,"qC":null,"r":[0,0,0],"sX":null,"sY":null,"shX":null,"shY":null,"sheX":0,"sheY":0,"sp":null,"st":null,"t":[],"u":null,"w":null,"wS":0},"lO":{"cl":null,"cli":false,"mo":null,"p":null,"rO":null,"f":null},"tO":[],"t":"This file tests Advanced Substation Alpha parsing with a non-standard order."}');
            });
        });
        test("Does basic SubStation Alpha Subtitles parsing work?", () => {
            const parser = new sabre.Parser();
            const testFile = loadFile('test1.ssa');
            parser.load(testFile, [], (config) => {
                expect(config).not.toBeNull();
                expect(config.info).not.toBeNull();
                expect(config.parser).not.toBeNull();
                expect(config.renderer).not.toBeNull();
    
                expect(config.info.title).toBe('Test Script');
                expect(config.info.version).toBe(4);
                expect(config.info.is_ass).toBe(false);
                
                
                for(let i = 0; i < ssaStyleKeys.length; i++){
                    expect(config.parser.style_format[i]).toBe(ssaStyleKeys[i]);
                }
              
                for(let i = 0; i < ssaEventKeys.length; i++){
                    
                    if(config.parser.event_format[i] === "Name" && ssaEventKeys[i] === "Actor")
                    {
                        expect(config.parser.event_format[i]).toBe("Name");
                    }
                    else
                    {
                        expect(config.parser.event_format[i]).toBe(ssaEventKeys[i]);
                    }
                }
                expect(config.renderer.default_wrap_style).toBe(sabre.WrapStyleModes.SMART);
                expect(config.renderer.events).toBeInstanceOf(Array);
                expect(config.renderer.events.length).toBe(1);
                expect(JSON.stringify(config.renderer.events[0])).toBe('{"id":0,"or":0,"nl":false,"l":0,"s":6.6,"e":8.9,"st":{"n":"Default","fn":"Arial","fs":18,"pc":[1,1,1,1],"sc":[0,1,1,1],"tc":[0,0,0,1],"qc":[0.5019607843137255,0,0,1],"w":200,"i":false,"u":false,"st":false,"sx":1,"sy":1,"sp":0,"an":0,"bs":1,"ox":2,"oy":2,"sh":2.1213203435596424,"al":2,"m":[20,20,20],"en":1},"o":{"a":null,"bO":0,"bI":0,"dM":false,"dS":1,"e":null,"fN":null,"fS":null,"fSM":0,"gB":0,"i":null,"kM":0,"kS":6.6,"kE":6.6,"m":[0,0,0],"oX":null,"oY":null,"pC":null,"sC":null,"tC":null,"qC":null,"r":[0,0,0],"sX":null,"sY":null,"shX":null,"shY":null,"sheX":0,"sheY":0,"sp":null,"st":null,"t":[],"u":null,"w":null,"wS":0},"lO":{"cl":null,"cli":false,"mo":null,"p":null,"rO":null,"f":null},"tO":[],"t":"This file tests SubStation Alpha parsing."}');
                
            });
        });
        test("Does SubStation Alpha Subtitles parsing work with arbitrary format ordering?", () => {
            const parser = new sabre.Parser();
            const testFile = loadFile('test2.ssa');
            parser.load(testFile, [], (config) => {
                expect(config).not.toBeNull();
                expect(config.info).not.toBeNull();
                expect(config.parser).not.toBeNull();
                expect(config.renderer).not.toBeNull();
    
                expect(config.info.title).toBe('Test Script');
                expect(config.info.version).toBe(4);
                expect(config.info.is_ass).toBe(false);
                
                
                for(let i = 0; i < ssaStyleKeys.length; i++){
                    expect(config.parser.style_format[i]).toBe(ssaStyleKeys[ssaStyleKeys.length - i - 1]);
                }
                const reversedEventKeys = ssaEventKeys.slice(0,ssaEventKeys.length-1).reverse();
                for(let i = 0; i < reversedEventKeys.length; i++){
                    
                    if(config.parser.event_format[i] === "Name" && reversedEventKeys[i] === "Actor")
                    {
                        expect(config.parser.event_format[i]).toBe("Name");
                    }
                    else
                    {
                        expect(config.parser.event_format[i]).toBe(reversedEventKeys[i]);
                    }
                }
                expect(config.parser.event_format[ssaEventKeys.length-1]).toBe("Text");
                expect(config.renderer.default_wrap_style).toBe(sabre.WrapStyleModes.SMART);
                expect(config.renderer.events).toBeInstanceOf(Array);
                expect(config.renderer.events.length).toBe(1);
                expect(JSON.stringify(config.renderer.events[0])).toBe('{"id":0,"or":0,"nl":false,"l":0,"s":6.6,"e":8.9,"st":{"n":"Default","fn":"Arial","fs":18,"pc":[1,1,1,1],"sc":[0,1,1,1],"tc":[0,0,0,1],"qc":[0.5019607843137255,0,0,1],"w":200,"i":false,"u":false,"st":false,"sx":1,"sy":1,"sp":0,"an":0,"bs":1,"ox":2,"oy":2,"sh":2.1213203435596424,"al":2,"m":[20,20,20],"en":1},"o":{"a":null,"bO":0,"bI":0,"dM":false,"dS":1,"e":null,"fN":null,"fS":null,"fSM":0,"gB":0,"i":null,"kM":0,"kS":6.6,"kE":6.6,"m":[0,0,0],"oX":null,"oY":null,"pC":null,"sC":null,"tC":null,"qC":null,"r":[0,0,0],"sX":null,"sY":null,"shX":null,"shY":null,"sheX":0,"sheY":0,"sp":null,"st":null,"t":[],"u":null,"w":null,"wS":0},"lO":{"cl":null,"cli":false,"mo":null,"p":null,"rO":null,"f":null},"tO":[],"t":"This file tests SubStation Alpha parsing with a non-standard order."}');
                
            });
        });
         
        describe("Tag Tests",() => {
            const tag_tests = [
                {
                    "tag": "\\alpha",
                    "test": (event) =>{
                        expect(event.getOverrides().getPrimaryColor().getA()).toBe(127/255);
                    }
                },
                {
                    "tag": "\\alpha",
                    "test": (event) =>{
                        expect(event.getOverrides().getSecondaryColor().getA()).toBe(127/255);
                    }
                },
                {
                    "tag": "\\alpha",
                    "test": (event) =>{
                        expect(event.getOverrides().getTertiaryColor().getA()).toBe(127/255);
                    }
                },
                {
                    "tag": "\\alpha",
                    "test": (event) =>{
                        expect(event.getOverrides().getQuaternaryColor().getA()).toBe(127/255);
                    }
                },
                {
                    "tag": "\\alpha",
                    "test": (event) =>{
                        expect(event.getOverrides().getPrimaryColor().getA()).toBe(127/255);
                    }
                },
                {
                    "tag": "\\a",
                    "test": (event) =>{
                        expect(event.getOverrides().getAlignment()).toBe(5);
                    }
                },
                {
                    "tag": "\\an",
                    "test": (event) =>{
                        expect(event.getOverrides().getAlignment()).toBe(5);
                    }
                },
                {
                    "tag": "\\b",
                    "test": (event) =>{
                        expect(event.getOverrides().getWeight()).toBe(700);
                    }
                },
                {
                    "tag": "\\b",
                    "test": (event) =>{
                        expect(event.getOverrides().getWeight()).toBe(800);
                    }
                },
                {
                    "tag": "\\be",
                    "test": (event) =>{
                        expect(event.getOverrides().getEdgeBlur()).toBe(5);
                    }
                },
                {
                    "tag": "\\blur",
                    "test": (event) =>{
                        expect(event.getOverrides().getGaussianEdgeBlur()).toBe(20);
                    }
                },
                {
                    "tag": "\\bord",
                    "test": (event) =>{
                        expect(event.getOverrides().getOutlineX()).toBe(5);
                        expect(event.getOverrides().getOutlineY()).toBe(5);
                    }
                },
                {
                    "tag": "\\bord",
                    "test": (event) =>{
                        expect(event.getOverrides().getOutlineX()).toBe(5);
                        expect(event.getOverrides().getOutlineY()).toBeNull();
                    }
                },
                {
                    "tag": "\\bord",
                    "test": (event) =>{
                        expect(event.getOverrides().getOutlineX()).toBeNull();
                        expect(event.getOverrides().getOutlineY()).toBe(5);
                    }
                },
                {
                    "tag": "\\c",
                    "test": (event) =>{
                        expect(event.getOverrides().getPrimaryColor().getR()).toBe(128/255);
                        expect(event.getOverrides().getPrimaryColor().getG()).toBe(128/255);
                        expect(event.getOverrides().getPrimaryColor().getB()).toBe(128/255);
                    }
                },
                {
                    "tag": "\\c",
                    "test": (event) =>{
                        expect(event.getOverrides().getPrimaryColor().getR()).toBe(128/255);
                        expect(event.getOverrides().getPrimaryColor().getG()).toBe(128/255);
                        expect(event.getOverrides().getPrimaryColor().getB()).toBe(128/255);
                    }
                },
                {
                    "tag": "\\c",
                    "test": (event) =>{
                        expect(event.getOverrides().getSecondaryColor().getR()).toBe(128/255);
                        expect(event.getOverrides().getSecondaryColor().getG()).toBe(128/255);
                        expect(event.getOverrides().getSecondaryColor().getB()).toBe(128/255);
                    }
                },
                {
                    "tag": "\\c",
                    "test": (event) =>{
                        expect(event.getOverrides().getTertiaryColor().getR()).toBe(128/255);
                        expect(event.getOverrides().getTertiaryColor().getG()).toBe(128/255);
                        expect(event.getOverrides().getTertiaryColor().getB()).toBe(128/255);
                    }
                },
                {
                    "tag": "\\c",
                    "test": (event) =>{
                        expect(event.getOverrides().getQuaternaryColor().getR()).toBe(128/255);
                        expect(event.getOverrides().getQuaternaryColor().getG()).toBe(128/255);
                        expect(event.getOverrides().getQuaternaryColor().getB()).toBe(128/255);
                    }
                },
                {
                    "tag": "\\clip",
                    "test": (event) =>{
                        expect(event.getLineOverrides().getClipInverted()).toBe(false);
                        expect(Array.isArray(event.getLineOverrides().getClip())).toBe(true);
                        let clip = event.getLineOverrides().getClip();
                        expect(clip.length).toBe(4);
                        expect(clip[0]).toBe(0);
                        expect(clip[1]).toBe(0);
                        expect(clip[2]).toBe(100);
                        expect(clip[3]).toBe(101);
                    }
                },
                {
                    "tag": "\\clip",
                    "test": (event) =>{
                        expect(event.getLineOverrides().getClipInverted()).toBe(false);
                        expect(Array.isArray(event.getLineOverrides().getClip())).toBe(true);
                        let clip = event.getLineOverrides().getClip();
                        expect(clip.length).toBe(2);
                        expect(clip[0]).toBe(1);
                        expect(clip[1]).toBe("m 0 0 l 100 0 100 101 0 101");
                    }
                },
                {
                    "tag": "\\fade",
                    "test": (event) =>{
                        expect(Array.isArray(event.getLineOverrides().getFade())).toBe(true);
                        let fade = event.getLineOverrides().getFade();
                        expect(fade.length).toBe(7);
                        expect(fade[0]).toBe(1);
                        expect(fade[1]).toBe(0);
                        expect(fade[2]).toBe(1);
                        expect(fade[3]).toBe(21);
                        expect(fade[4]).toBe(22.25);
                        expect(fade[5]).toBe(24.75);
                        expect(fade[6]).toBe(26);
                    }
                },
                {
                    "tag": "\\fad",
                    "test": (event) =>{
                        expect(Array.isArray(event.getLineOverrides().getFade())).toBe(true);
                        let fade = event.getLineOverrides().getFade();
                        expect(fade.length).toBe(7);
                        expect(fade[0]).toBe(0);
                        expect(fade[1]).toBe(1);
                        expect(fade[2]).toBe(0);
                        expect(fade[3]).toBe(22);
                        expect(fade[4]).toBe(23.25);
                        expect(fade[5]).toBe(25.75);
                        expect(fade[6]).toBe(27);
                    }
                },
                {
                    "tag": "\\fax",
                    "test": (event) =>{
                        expect(event.getOverrides().getShearX()).toBe(5);
                        expect(event.getOverrides().getShearY()).toBe(0);
                    }
                },
                {
                    "tag": "\\fay",
                    "test": (event) =>{
                        expect(event.getOverrides().getShearX()).toBe(0);
                        expect(event.getOverrides().getShearY()).toBe(5);
                    },
                },
                {
                    "tag": "\\fe",
                    "test": (event) =>{
                        expect(event.getOverrides().getEncoding()).toBe(0);
                    }
                },
                {
                    "tag": "\\fn",
                    "test": (event) =>{
                        expect(event.getOverrides().getFontName()).toBe("Open Sans");
                    }
                },
                {
                    "tag": "\\frx",
                    "test": (event) =>{
                        const rotation = event.getOverrides().getRotation();
                        expect(Array.isArray(rotation)).toBe(true);
                        expect(rotation[0]).toBe(45)
                        expect(rotation[1]).toBe(0);
                        expect(rotation[2]).toBe(0);
                    }
                },
                {
                    "tag": "\\fry",
                    "test": (event) =>{
                        const rotation = event.getOverrides().getRotation();
                        expect(Array.isArray(rotation)).toBe(true);
                        expect(rotation[0]).toBe(0)
                        expect(rotation[1]).toBe(45);
                        expect(rotation[2]).toBe(0);
                    }
                },
                {
                    "tag": "\\frx",
                    "test": (event) =>{
                        const rotation = event.getOverrides().getRotation();
                        expect(Array.isArray(rotation)).toBe(true);
                        expect(rotation[0]).toBe(0)
                        expect(rotation[1]).toBe(0);
                        expect(rotation[2]).toBe(45);
                    }
                },
                {
                        "tag": "\\fs+",
                        "test": (event) =>{
                            expect(event.getOverrides().getFontSizeMod()).toBe(20);
                        }  
                },
                {
                    "tag": "\\fs-",
                    "test": (event) =>{
                        expect(event.getOverrides().getFontSizeMod()).toBe(-20);
                    }  
                },
                {
                    "tag": "\\fs",
                    "test": (event) =>{
                        expect(event.getOverrides().getFontSize()).toBe(100);
                    }
                },
                {
                    "tag": "\\fscx",
                    "test": (event) =>{
                        expect(event.getOverrides().getScaleX()).toBe(2);
                        expect(event.getOverrides().getScaleY()).toBeNull();
                    }
                },
                {
                    "tag": "\\fscy",
                    "test": (event) =>{
                        expect(event.getOverrides().getScaleX()).toBeNull();
                        expect(event.getOverrides().getScaleY()).toBe(2);
                    }
                },
                {
                    "tag": "\\fsp",
                    "test": (event) =>{
                        expect(event.getOverrides().getSpacing()).toBe(20);
                    }
                },
                {
                    "tag": "\\fsp",
                    "test": (event) =>{
                        expect(event.getOverrides().getSpacing()).toBe(-20);
                    }
                },
                {
                    "tag": "\\i",
                    "test": (event) =>{
                        expect(event.getOverrides().getItalic()).toBe(true);
                    }
                },
                {
                    "tag": "\\iclip",
                    "test": (event) =>{
                        expect(event.getLineOverrides().getClipInverted()).toBe(true);
                        expect(Array.isArray(event.getLineOverrides().getClip())).toBe(true);
                        let clip = event.getLineOverrides().getClip();
                        expect(clip.length).toBe(4);
                        expect(clip[0]).toBe(0);
                        expect(clip[1]).toBe(0);
                        expect(clip[2]).toBe(100);
                        expect(clip[3]).toBe(101);
                    }
                },
                {
                    "tag": "\\iclip",
                    "test": (event) =>{
                        expect(event.getLineOverrides().getClipInverted()).toBe(true);
                        expect(Array.isArray(event.getLineOverrides().getClip())).toBe(true);
                        let clip = event.getLineOverrides().getClip();
                        expect(clip.length).toBe(2);
                        expect(clip[0]).toBe(1);
                        expect(clip[1]).toBe("m 0 0 l 100 0 100 101 0 101");
                    }
                },
                {
                    "tag": "\\k",
                    "test": (event) =>{
                        expect(event.getOverrides().getKaraokeMode()).toBe(sabre.KaraokeModes.COLOR_SWAP);
                        expect(event.getOverrides().getKaraokeEnd()).toBe(41);
                    }
                },
                {
                    "tag": "\\K",
                    "test": (event) =>{
                        expect(event.getOverrides().getKaraokeMode()).toBe(sabre.KaraokeModes.COLOR_SWEEP);
                        expect(event.getOverrides().getKaraokeEnd()).toBe(42);
                    }
                },
                {
                    "tag": "\\kf",
                    "test": (event) =>{
                        expect(event.getOverrides().getKaraokeMode()).toBe(sabre.KaraokeModes.COLOR_SWEEP);
                        expect(event.getOverrides().getKaraokeEnd()).toBe(43);
                    }
                },
                {
                    "tag": "\\ko",
                    "test": (event) =>{
                        expect(event.getOverrides().getKaraokeMode()).toBe(sabre.KaraokeModes.OUTLINE_TOGGLE);
                        expect(event.getOverrides().getKaraokeEnd()).toBe(44);
                    }
                },
                {
                    "tag": "\\kt",
                    "test": (event) =>{
                        expect(event.getOverrides().getKaraokeMode()).toBe(sabre.KaraokeModes.OFF);
                        expect(event.getOverrides().getKaraokeEnd()).toBe(45);
                    }
                },
                {
                        "tag": "\\move",
                        "test": (event) =>{
                            const movement = event.getLineOverrides().getMovement();
                            expect(Array.isArray(movement)).toBe(true);
                            expect(movement[0]).toBe(0);
                            expect(movement[1]).toBe(0);
                            expect(movement[2]).toBe(100);
                            expect(movement[3]).toBe(101);
                            expect(movement[4]).toBe(45);
                            expect(movement[5]).toBe(50);
                        }
                },
                {
                    "tag": "\\move",
                    "test": (event) =>{
                        const movement = event.getLineOverrides().getMovement();
                        expect(Array.isArray(movement)).toBe(true);
                        expect(movement[0]).toBe(0);
                        expect(movement[1]).toBe(0);
                        expect(movement[2]).toBe(100);
                        expect(movement[3]).toBe(101);
                        expect(movement[4]).toBe(47);
                        expect(movement[5]).toBe(48);
                    }
                },
                {
                    "tag": "\\org",
                    "test": (event) =>{
                        const org = event.getLineOverrides().getRotationOrigin();
                        expect(Array.isArray(org)).toBe(true);
                        expect(org[0]).toBe(100);
                        expect(org[1]).toBe(101);
                    }
                },
                {
                    "tag": "\\p",
                    "test": (event) =>{
                        expect(event.getOverrides().getDrawingMode()).toBe(true);
                        expect(event.getOverrides().getDrawingScale()).toBe(2);
                    }
                },
                {
                    "tag": "\\pbo",
                    "test": (event) =>{
                        expect(event.getOverrides().getBaselineOffset()).toBe(5);
                    }
                },
                {
                    "tag": "\\pos",
                    "test": (event) =>{
                        const pos = event.getLineOverrides().getPosition();
                        expect(Array.isArray(pos)).toBe(true);
                        expect(pos[0]).toBe(100);
                        expect(pos[1]).toBe(101);
                    }
                },
                {
                    "tag": "\\q",
                    "test": (event) =>{
                        expect(event.getOverrides().getWrapStyle()).toBe(sabre.WrapStyleModes.SMART_INVERSE);
                    }
                },
                {
                    "tag": "\\r",
                    "test": (event) =>{
                        expect(event.getOverrides().getWeight()).toBeNull();
                    }
                },
                {
                    "tag": "\\r",
                    "test": (event) =>{
                        expect(event.getStyle().getName()).toBe("Bold");
                    }
                },
                {
                    "tag": "\\s",
                    "test": (event) =>{
                        expect(event.getOverrides().getStrikeout()).toBe(true);
                    }
                },
                {
                    "tag": "\\shad",
                    "test": (event) =>{
                        expect(event.getOverrides().getShadowX()).toBe(2.82842712474619);
                        expect(event.getOverrides().getShadowY()).toBe(2.82842712474619);
                    }
                },
                {
                    "tag": "\\xshad",
                    "test": (event) =>{
                        expect(event.getOverrides().getShadowX()).toBe(5);
                        expect(event.getOverrides().getShadowY()).toBeNull();
                    }
                },
                {
                    "tag": "\\yshad",
                    "test": (event) =>{
                        expect(event.getOverrides().getShadowX()).toBeNull();
                        expect(event.getOverrides().getShadowY()).toBe(5);
                    }
                },
                {
                    "tag": "\\t",
                    "test": (event) =>{
                        const transitionOverrides = event.getOverrides().getTransitions();
                        expect(Array.isArray(transitionOverrides)).toBe(true);
                        expect(transitionOverrides.length).toBe(1);
                        expect(transitionOverrides[0].getTransitionStart()).toBe(58);
                        expect(transitionOverrides[0].getTransitionEnd()).toBe(63);
                        expect(transitionOverrides[0].getTransitionAcceleration()).toBe(1);
                        expect(transitionOverrides[0].getFontSize()).toBe(200);
                    }
                },
                {
                    "tag": "\\t",
                    "test": (event) =>{
                        const transitionOverrides = event.getOverrides().getTransitions();
                        expect(Array.isArray(transitionOverrides)).toBe(true);
                        expect(transitionOverrides.length).toBe(1);
                        expect(transitionOverrides[0].getTransitionStart()).toBe(59);
                        expect(transitionOverrides[0].getTransitionEnd()).toBe(64);
                        expect(transitionOverrides[0].getTransitionAcceleration()).toBe(2);
                        expect(transitionOverrides[0].getFontSize()).toBe(200);
                    }
                },
                {
                    "tag": "\\t",
                    "test": (event) =>{
                        const transitionOverrides = event.getOverrides().getTransitions();
                        expect(Array.isArray(transitionOverrides)).toBe(true);
                        expect(transitionOverrides.length).toBe(1);
                        expect(transitionOverrides[0].getTransitionStart()).toBe(61.25);
                        expect(transitionOverrides[0].getTransitionEnd()).toBe(63.75);
                        expect(transitionOverrides[0].getTransitionAcceleration()).toBe(1);
                        expect(transitionOverrides[0].getFontSize()).toBe(200);
                    }
                },
                {
                    "tag": "\\t",
                    "test": (event) =>{
                        const transitionOverrides = event.getOverrides().getTransitions();
                        expect(Array.isArray(transitionOverrides)).toBe(true);
                        expect(transitionOverrides.length).toBe(1);
                        expect(transitionOverrides[0].getTransitionStart()).toBe(62.25);
                        expect(transitionOverrides[0].getTransitionEnd()).toBe(64.75);
                        expect(transitionOverrides[0].getTransitionAcceleration()).toBe(2);
                        expect(transitionOverrides[0].getFontSize()).toBe(200);
                    }
                },
                {
                    "tag": "\\u",
                    "test": (event) =>{
                        expect(event.getOverrides().getUnderline()).toBe(true);
                    }
                }
            ];
            const parser = new sabre.Parser(() => {});
            const testFile = loadFile('tag_tests.ass');
            const counters = {}; 
            parser.load(testFile, [], (config) => {
                for (let index = 1; index < config.renderer.events.length; index+=2) {
                    const element = config.renderer.events[index];
                    const testIndex = (index - 1) / 2;
                    counters[tag_tests[testIndex].tag] = (counters[tag_tests[testIndex].tag] ?? 0) + 1;
                    test(tag_tests[testIndex].tag+"  #"+counters[tag_tests[testIndex].tag], () => {
                        tag_tests[testIndex].test(element);
                    });
                }
            });
        });
    });
});