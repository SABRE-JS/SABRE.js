/*
 *   sabre.js
 *----------------
 *  sabre.js is copyright Patrick Rhodes Martin 2013-2022.
 */
let includelog = Object.create(Object, {});
let scriptpath = "";

/**
 * Determines if we import *.min.js or *.js
 * @private
 * @define {boolean}
 * */
const ENABLE_DEBUG = true;

if (!(typeof define === "function" && define.amd)) {
    {
        let scripturl = "./";
        if (typeof global.document !== "undefined") {
            if (
                typeof global.document.currentScript !== "undefined" &&
                global.document.currentScript !== null
            ) {
                scripturl = global.document.currentScript.src;
            } else {
                scripturl = null;
                let scripts = global.document.getElementsByTagName("script");
                for (let i = scripts.length - 1; i >= 0; i--) {
                    let src = scripts[i].getAttribute("src");
                    if (src === null || src === "") continue;
                    if (
                        scripts[i].getAttribute("module") === null &&
                        scripts[i].getAttribute("async") === null &&
                        scripts[i].getAttribute("defer") === null
                    ) {
                        scripturl = src;
                        break;
                    }
                }
                if (scripturl === null) {
                    throw "Error: Unable to find script path.";
                }
            }
        } else {
            scriptpath = "./";
        }

        let curscript = global.document.createElement("a");
        curscript.href = scripturl;
        curscript = new global.URL(curscript.href);
        scriptpath =
            curscript.protocol +
            "//" +
            curscript.host +
            curscript.pathname.match(/^(.*\/).*?$/)[1];
    }

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
} else {
    define("sabre", ["require"], function (require) {
        sabre["include"] = function (name, cb) {
            if (
                !(typeof includelog[name] === "undefined") &&
                includelog[name] === true
            )
                return;
            try {
                require("./" + name);
                includelog[name] = true;
                cb(true);
            } catch (e) {
                cb(false);
            }
        };
        sabre["import"] = sabre["include"];

        sabre["getScriptPath"] = function () {
            let url = require["toUrl"]("./pathtest.fake");
            return url.substr(0, url.lastIndexOf("/"));
        };

        return external;
    });
}

//This is a stub for loading.
sabre["include"]("util");
sabre["include"]("renderer-main");
