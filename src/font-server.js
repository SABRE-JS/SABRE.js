//@include [util]
//@include [global-constants]
//@include [color]
//@include [style]
//@include [style-override]
//@include [subtitle-event]
//@include [subtitle-parser]
/**
 * @fileoverview font server for the renderer.
 */
/**
 * An enum of platforms.
 */
const platforms = Object.freeze({
    UNICODE: 0,
    APPLE: 1,
    MICROSOFT: 3
});

/**
 * An enum of name types.
 */
const nameTypes = Object.freeze({
    COPYRIGHT: 0,
    FONT_FAMILY: 1,
    FONT_SUBFAMILY: 2,
    UNIQUE_ID: 3,
    FULL_NAME: 4,
    VERSION_STRING: 5,
    PS_NAME: 6,
    TRADEMARK: 7
});

const font_server_prototype = Object.create(Object,{
    _fonts: {
        /**
         * @type {?Array<Font>}
         */
        value: null,
        writable: true
    },

    _fontTables : {
        /**
         * @type {?Array<{tables:Array<OpenTypeTable|OS2Table|NameTable>}>}
         */
        value: null,
        writable: true
    },

    _fontMapping: {
        /**
         * @type {?Object<string,Array<{font:Font,ascent:number,descent:number}>>}
         */
        value: null,
        writable: true
    },

    _wcharByteArrayToString: {
        /**
         * converts a wchar byte array to a string.
         * @param {Array<number>} arr 
         * @returns {string}
         */
        value: function(arr){
            let array = [];
            for (var i = 0; i < arr.length; i+=2) {
                array.push(parseInt((arr[i]<<8)|arr[i+1], 10));
            }
            return String.fromCharCode.apply(null,array);
        },
        writable: false
    },

    init: {
        value: function(config){
            this._fonts = config.fontserver;
            //this._fontTables = [];
            this._fontMapping = {};
            /*for(let i = 0; i < this._fonts.length; i++){
                this._fontTables[i] = this._fonts[i].toTables();
            }*/
        },
        writable: false
    },

    _fixUnsignedToSignedShort: {
        value: function(num){
            num = 0xFFFF & num;
            if(num > 0x7FFF)
                num = -(0xFFFF & ((~num)+1));
            return num;
        },
        writable: false
    },

    "getFontsAndInfo": {
        /**
         * @private
         * @param {string} name 
         * @returns {Array<{font:Font,ascent:number,descent:number,weight:number,selection:number}>} the resulting font and info.
         */
        value: function(name){
            name = name.toLowerCase().trim();
            if(this._fontMapping[name])
                return this._fontMapping[name];
            let results = [];
            for(let i = 0; i < this._fonts.length; i++){
                // /**
                //  * @type {?NameTable}
                //  */
                // let namesTable = null;
                // /**
                //  * @type {?OS2Table}
                //  */
                // let os2Table = null;
                // /**
                //  * @type {?HeadTable}
                //  */
                // let headTable = null;
                // const container = this._fontTables[i];
                // for(let j = 0; j < container.tables.length && (namesTable === null || os2Table === null || headTable === null); j++)
                // {
                //     let table = /** @type {OpenTypeTable} */ (container.tables[j]);
                //     if(table.tableName === "name"){
                //         namesTable = /** @type {?NameTable} */ (table);
                //     }
                //     if(table.tableName === "OS/2"){
                //         os2Table = /** @type {?OS2Table} */ (table);
                //     }
                //     if(table.tableName === "head"){
                //         headTable = /** @type {?HeadTable} */ (table);
                //     }
                // }
                // if(namesTable === null||os2Table === null)
                //     continue;
                // const fullnames = [];
                // const familynames = [];
                // const subfamilynames = [];
                // {
                //     const nameTargets = [];
                //     let namesArray = null;
                //     for(let j = 0; j < namesTable.fields.length; j++){
                //         const field = /** @type {NameTableEntry} */ (namesTable.fields[j]);
                //         if(field.name === "strings" && field.type === "LITERAL"){
                //             namesArray = (/** @type {StringsEntry} */ (field)).value;
                //         }else if(field.type === "RECORD"){
                //             const record = (/** RecordEntry */ (field));
                //             if(record.value.platformID === platforms.MICROSOFT){
                //                 nameTargets.push({type:record.value.nameID,offset:record.value.offset,length:record.value.length})
                //             }
                //         }
                //     }
                //     if(namesArray === null)
                //         continue;
                //     for(let j = 0; j < nameTargets.length; j++){
                //         const offset = nameTargets[j].offset;
                //         const offset_end = nameTargets[j].offset+nameTargets[j].length;
                //         const nameType = nameTargets[j].type;
                //         const text = this._wcharByteArrayToString(namesArray.slice(offset,offset_end));
                //         switch(nameType){
                //             case nameTypes.FULL_NAME:
                //                 fullnames.push(text);
                //                 break;
                //             case nameTypes.FONT_FAMILY:
                //                 familynames.push(text);
                //                 break;
                //             case nameTypes.FONT_SUBFAMILY:
                //                 subfamilynames.push(text);
                //                 break;
                //             default:
                //                 break;
                //         }
                //     }
                // }

                // let add_font = false;
                // for(let j = 0; j < fullnames.length && !add_font; j++){
                //     if(fullnames[j].toLowerCase().trim() === name){
                //         add_font = true;
                //         break;
                //     }
                // }
                // for(let j = 0; j < familynames.length && !add_font; j++){
                //     if(familynames[j].toLowerCase().trim() === name){
                //         add_font = true;
                //         break;
                //     }
                // }
                // for(let j = 0; j < familynames.length && !add_font; j++){
                //     for(let k = 0; k < subfamilynames.length && !add_font; k++){
                //         if((familynames[j].toLowerCase().trim() + " " + subfamilynames[k].toLowerCase().trim()) === name){
                //             add_font = true;
                //             break;
                //         }
                //     }
                // }

                let add_font = false;
                let font_family = this._fonts[i].tables.name.fontFamily.en.toLowerCase().trim();
                if(font_family === name)
                    add_font = true;
                if(this._fonts[i].tables.name.fullName.en.toLowerCase().trim() === nameTypes)
                    add_font = true;
                if(font_family + " " + this._fonts[i].tables.name.fontSubfamily.en.toLowerCase().trim() === name)
                    add_font = true;
                if(add_font)
                    results.push({"font":this._fonts[i],"ascent":this._fixUnsignedToSignedShort(this._fonts[i].tables.os2.usWinAscent)||this._fonts[i].tables.os2.sTypoAscent||this._fonts[i].tables.head.yMax,"descent":this._fixUnsignedToSignedShort(this._fonts[i].tables.os2.usWinDescent)||(-(this._fonts[i].tables.os2.sTypoDescent||this._fonts[i].tables.head.yMin)),"weight":this._fonts[i].tables.os2.usWeightClass,"selection":this._fonts[i].tables.os2.fsSelection});
            }
            this._fontMapping[name] = results;
            return results;
        }
    }
});
/**
 * Creates a FontServer
 * @private
 * @param {RendererData} config 
 */
sabre["FontServer"] = function(config){
    let server = Object.create(font_server_prototype);
    server.init(config)
    return server;
}