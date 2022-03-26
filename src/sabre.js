/*
 *   include.js
 *----------------
 *  include.js is copyright Patrick Rhodes Martin 2013,2016,2019,2020.
 */
let includelog = Object.create(Object, {});
let scriptpath = "";
{
    let scripts = global.document.getElementsByTagName("script");
    let curscript = new global.URL(scripts[scripts.length - 1].src);
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
 * @param {string} scriptUrl The URL or URI of the script.
 * @param {function(boolean)=} callback Callback on success or failure.
 */
sabre["import"] = function (scriptUrl, callback) {
    if (!ENABLE_DEBUG) {
        scriptUrl += ".min.js";
    } else {
        scriptUrl += ".js";
    }
    if (typeof callback === "undefined" || callback === null)
        callback = function () {};
    if (
        !(typeof includelog[scriptUrl] === "undefined") &&
        includelog[scriptUrl] === true
    )
        return;
    if (
        typeof global["importScripts"] === "function" &&
        typeof global["document"] === "undefined"
    ) {
        try {
            global.importScripts(scriptpath + scriptUrl); //eslint-disable-line no-undef
        } catch (e) {
            //if(e instanceof NetworkError){
            callback(false);
            return;
            //}
        }
        callback(true);
        includelog[scriptUrl] = true;
        return;
    }
    let head = global.document.head;
    let scriptImport = global.document.createElement("script");
    scriptImport.setAttribute("type", "application/ecmascript");
    scriptImport.setAttribute("src", scriptpath + scriptUrl);
    scriptImport.setAttribute("async", "");
    scriptImport.addEventListener("load", function () {
        console.log("Finished Importing: " + scriptUrl);
        callback(true);
    });
    includelog[scriptUrl] = true;
    head.appendChild(scriptImport);
};
/**
 * includes a ecmascript file
 * @param {string} scriptUrl The URL or URI of the script.
 * @param {function(boolean)=} callback Callback on success or failure.
 */
sabre["include"] = function (scriptUrl, callback) {
    if (!ENABLE_DEBUG) {
        scriptUrl += ".min.js";
    } else {
        scriptUrl += ".js";
    }
    if (typeof callback === "undefined" || callback === null)
        callback = function () {};
    if (
        !(typeof includelog[scriptUrl] === "undefined") &&
        includelog[scriptUrl] === true
    )
        return;
    if (
        typeof global["importScripts"] === "function" &&
        typeof global["document"] === "undefined"
    ) {
        try {
            global.importScripts(scriptpath + scriptUrl); //eslint-disable-line no-undef
        } catch (e) {
            //if(e instanceof NetworkError){
            callback(false);
            return;
            //}
        }
        callback(true);
        includelog[scriptUrl] = true;
        return;
    }
    let head = global.document.head;
    let scriptImport = global.document.createElement("script");
    scriptImport.setAttribute("type", "application/ecmascript");
    scriptImport.setAttribute("src", scriptpath + scriptUrl);
    scriptImport.addEventListener("load", function () {
        console.log("Finished Including: " + scriptUrl);
        callback(true);
    });
    includelog[scriptUrl] = true;
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
