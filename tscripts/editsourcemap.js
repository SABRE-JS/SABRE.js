const sourceMap = require('source-map');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

try{
    const arguments = process.argv.slice(2);
    const inputSourceMapFilename = arguments[0];
    const outputSourceMapFilename = arguments[1];
    const defaultSource = arguments[2];
    let lineOffsetOriginal;
    let characterOffsetOriginal;
    let lineOffsetGenerated;
    let characterOffsetGenerated;
    {
        const offsetOriginal = arguments[3].split(':');
        const offsetGenerated = arguments[4].split(':');
        lineOffsetOriginal = parseInt(offsetOriginal[0], 10);
        characterOffsetOriginal = parseInt(offsetOriginal[1], 10);
        lineOffsetGenerated = parseInt(offsetGenerated[0], 10);
        characterOffsetGenerated = parseInt(offsetGenerated[1], 10);
    }

    const inputSourceMap = JSON.parse(fs.readFileSync(inputSourceMapFilename, 'utf8'));

    const outputPromise = (async (inputSourceMap,offsetOriginal,offsetGenerated) => {
        const consumer = await new sourceMap.SourceMapConsumer(inputSourceMap);
        const generator = new sourceMap.SourceMapGenerator({
            file: inputSourceMap.file,
            sourceRoot: inputSourceMap.sourceRoot
        });
        consumer.eachMapping((mapping) => {
            const newMapping = {
                source: mapping.source ?? defaultSource,
                original: {
                    line: mapping.originalLine + offsetOriginal[0],
                    column: mapping.originalColumn + offsetOriginal[1]
                },
                generated: {
                    line: mapping.generatedLine + offsetGenerated[0],
                    column: mapping.generatedColumn + offsetGenerated[1]
                }
            };
            if(mapping.name){
                newMapping.name = mapping.name;
            }
            generator.addMapping(newMapping);
        });
        consumer.destroy();
        return generator.toString();
    })(inputSourceMap,[lineOffsetOriginal,characterOffsetOriginal],[lineOffsetGenerated,characterOffsetGenerated]);

    outputPromise.then((output) => {
        fs.writeFileSync(outputSourceMapFilename, output, {
            encoding: 'utf8',
            flag: 'w',
            flush: true
        });
        process.exit();
    },(error) => {
        console.error(error);
        process.exit(1);
    });
}catch(e){
    console.error(e);
    process.exit(1);
}
