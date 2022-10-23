global = globalThis;
require('../global-constants.js')
require('../util.js')
require('../color.js');
require('../style.js');
require('../style-override.js');
require('../subtitle-event.js');
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
    return readFileSync(__dirname+"/testfiles/" + file,"utf8");
}

describe("Parser", () => {
    describe("#load",() => {
        test("Does basic Advanced SubStation Alpha Subtitles parsing work?", () => {
            const parser = new sabre.Parser(() => {});
            const testFile = loadFile('test1.ass');
            parser.load(testFile, (config) => {
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
            const parser = new sabre.Parser(() => {});
            const testFile = loadFile('test2.ass');
            parser.load(testFile, (config) => {
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
            const parser = new sabre.Parser(() => {});
            const testFile = loadFile('test1.ssa');
            parser.load(testFile, (config) => {
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
                expect(JSON.stringify(config.renderer.events[0])).toBe('{"id":0,"or":0,"nl":false,"l":0,"s":6.6,"e":8.9,"st":{"n":"Default","fn":"Arial","fs":18,"pc":[1,1,1,1],"sc":[0,1,1,1],"tc":[0,0,0,1],"qc":[0.5019607843137255,0,0,1],"w":200,"i":false,"sx":1,"sy":1,"sp":0,"bs":1,"ox":2,"oy":2,"sh":2.1213203435596424,"al":2,"m":[20,20,20],"en":1},"o":{"a":null,"bO":0,"bI":0,"dM":false,"dS":1,"e":null,"fN":null,"fS":null,"fSM":0,"gB":0,"i":null,"kM":0,"kS":6.6,"kE":6.6,"m":[0,0,0],"oX":null,"oY":null,"pC":null,"sC":null,"tC":null,"qC":null,"r":[0,0,0],"sX":null,"sY":null,"shX":null,"shY":null,"sheX":0,"sheY":0,"sp":null,"st":null,"t":[],"u":null,"w":null,"wS":0},"lO":{"cl":null,"cli":false,"mo":null,"p":null,"rO":null,"f":null},"tO":[],"t":"This file tests SubStation Alpha parsing."}');
                
            });
        });
        test("Does SubStation Alpha Subtitles parsing work with arbitrary format ordering?", () => {
            const parser = new sabre.Parser(() => {});
            const testFile = loadFile('test2.ssa');
            parser.load(testFile, (config) => {
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
                expect(JSON.stringify(config.renderer.events[0])).toBe('{"id":0,"or":0,"nl":false,"l":0,"s":6.6,"e":8.9,"st":{"n":"Default","fn":"Arial","fs":18,"pc":[1,1,1,1],"sc":[0,1,1,1],"tc":[0,0,0,1],"qc":[0.5019607843137255,0,0,1],"w":200,"i":false,"sx":1,"sy":1,"sp":0,"bs":1,"ox":2,"oy":2,"sh":2.1213203435596424,"al":2,"m":[20,20,20],"en":1},"o":{"a":null,"bO":0,"bI":0,"dM":false,"dS":1,"e":null,"fN":null,"fS":null,"fSM":0,"gB":0,"i":null,"kM":0,"kS":6.6,"kE":6.6,"m":[0,0,0],"oX":null,"oY":null,"pC":null,"sC":null,"tC":null,"qC":null,"r":[0,0,0],"sX":null,"sY":null,"shX":null,"shY":null,"sheX":0,"sheY":0,"sp":null,"st":null,"t":[],"u":null,"w":null,"wS":0},"lO":{"cl":null,"cli":false,"mo":null,"p":null,"rO":null,"f":null},"tO":[],"t":"This file tests SubStation Alpha parsing with a non-standard order."}');
                
            });
        });
         
    });
});