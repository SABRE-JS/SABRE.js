/*
 *   sabre.js
 *----------------
 *  sabre.js is copyright Patrick Rhodes Martin 2013-2022.
 */
let includelog = Object.create(Object, {});
let scriptpath = "";
{
    let scripturl;
    if (typeof global.document !== "undefined") {
        if (typeof global.document.currentScript !== "undefined") {
            scripturl = global.document.currentScript.src;
        } else {
            scripturl = "./";
            let scripts = global.document.getElementsByTagName("script");
            for (let i = 0; i < scripts.length; i++) {
                let src = scripts[i].getAttribute("src");
                if (src === null || src === "") continue;
                if (src.endsWith("sabre.js")) {
                    scripturl = src;
                    break;
                }
            }
        }
    } else {
        scripturl = "./";
    }
    let curscript = new global.URL(scripturl);
    scriptpath =
        curscript.protocol +
        "//" +
        curscript.host +
        curscript.pathname.match(/^(.*\/).*?$/)[1];
}

/**
 * Determines if we import *.min.js or *.js
 * @define {boolean}
 * */
const ENABLE_DEBUG = true;

/**
 * includes a ecmascript file asynchronously.
 * @param {string} scriptName The name/path of the script.
 * @param {function(boolean)=} callback Callback on success or failure.
 */
sabre["import"] = function (scriptName, callback) {
    if (!ENABLE_DEBUG) {
        scriptName += ".min.js";
    } else {
        scriptName += ".js";
    }
    if (typeof callback === "undefined" || callback === null)
        callback = function () {};
    if (
        !(typeof includelog[scriptName] === "undefined") &&
        includelog[scriptName] === true
    )
        return;
    if (
        typeof global["importScripts"] === "function" &&
        typeof global["document"] === "undefined"
    ) {
        try {
            global.importScripts(scriptpath + scriptName); //eslint-disable-line no-undef
        } catch (e) {
            //if(e instanceof NetworkError){
            callback(false);
            return;
            //}
        }
        callback(true);
        includelog[scriptName] = true;
        return;
    }
    let head = global.document.head;
    let scriptImport = global.document.createElement("script");
    scriptImport.setAttribute("type", "application/ecmascript");
    scriptImport.setAttribute("src", scriptpath + scriptName);
    scriptImport.setAttribute("async", "");
    scriptImport.addEventListener("load", function () {
        console.log("Finished Importing: " + scriptName);
        callback(true);
    });
    includelog[scriptName] = true;
    head.appendChild(scriptImport);
};
/**
 * includes a ecmascript file
 * @param {string} scriptName The name/path of the script.
 * @param {function(boolean)=} callback Callback on success or failure.
 */
sabre["include"] = function (scriptName, callback) {
    if (!ENABLE_DEBUG) {
        scriptName += ".min.js";
    } else {
        scriptName += ".js";
    }
    if (typeof callback === "undefined" || callback === null)
        callback = function () {};
    if (
        !(typeof includelog[scriptName] === "undefined") &&
        includelog[scriptName] === true
    )
        return;
    if (
        typeof global["importScripts"] === "function" &&
        typeof global["document"] === "undefined"
    ) {
        try {
            global.importScripts(scriptpath + scriptName); //eslint-disable-line no-undef
        } catch (e) {
            //if(e instanceof NetworkError){
            callback(false);
            return;
            //}
        }
        callback(true);
        includelog[scriptName] = true;
        return;
    }
    let head = global.document.head;
    let scriptImport = global.document.createElement("script");
    scriptImport.setAttribute("type", "application/ecmascript");
    scriptImport.setAttribute("src", scriptpath + scriptName);
    scriptImport.addEventListener("load", function () {
        console.log("Finished Including: " + scriptName);
        callback(true);
    });
    includelog[scriptName] = true;
    head.appendChild(scriptImport);
};

/**
 * returns the root directory for included ecmascript files.
 * @returns {string} the path.
 */
sabre["getScriptPath"] = function () {
    return scriptpath;
};

//This is a stub for loading.
sabre.import("renderer-main");
