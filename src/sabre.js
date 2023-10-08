/*
 *   sabre.js
 *----------------
 *  sabre.js is copyright Patrick Rhodes Martin 2013-2022.
 */
 let scriptpath = "";
 {
     let scripturl;
     if (typeof global.document !== "undefined") {
         try {
             if (typeof global.document.currentScript !== "undefined") {
                 scripturl = global.document.currentScript.src;
             } else {
                 scripturl = new Function("return import.meta.url;")();
             }
         } catch (e) {
             scripturl = "./dummy.js";
             let scripts = global.document.getElementsByTagName("script");
             for (let i = 0; i < scripts.length; i++) {
                 let src = scripts[i].getAttribute("src");
                 if (src === null || src === "") continue;
                 if (src.endsWith("sabre.js") || src.endsWith("sabre.min.js")) {
                     scripturl = src;
                     break;
                 }
             }
         }
     } else {
         scripturl = "./dummy.js";
     }
     {
         let relative = scripturl.startsWith(".");
         let absolute = scripturl.startsWith("/");
         let http = scripturl.startsWith("http");
         let pageurl = new URL(global.location.href);
         if (relative || absolute || !http) {
             if (scripturl.startsWith("//")) {
                 scriptpath = pageurl.protocol + scripturl;
             } else {
                 if (relative || (!http && !absolute)) {
                     scriptpath =
                         pageurl.protocol +
                         "//" +
                         pageurl.host +
                         ":" +
                         pageurl.port +
                         pageurl.pathname.match(/^(.*\/).*?$/)[1] +
                         (scripturl.match(/^(.*\/).*?$/)[1] ?? "/");
                 } else {
                     scriptpath =
                         pageurl.protocol +
                         "//" +
                         pageurl.host +
                         ":" +
                         pageurl.port +
                         (scripturl.match(/^(.*\/).*?$/)[1] ?? "/");
                 }
             }
         } else {
             scriptpath = scripturl.match(/^(.*\/).*?$/)[1] ?? "/";
         }
     }
 }
 if (typeof require !== "function") {
     let includelog = Object.create(Object, {});
 
     /**
      * includes a ecmascript file asynchronously.
      * @param {string} scriptName The name/path of the script.
      * @param {function(boolean)=} callback Callback on success or failure.
      */
     sabre["import"] = function import (scriptName, callback) {
         if (!DEBUG) {
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
     sabre["include"] = function include (scriptName, callback) {
         if (!DEBUG) {
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
      * @return {string} the path.
      */
     sabre["getScriptPath"] = function getScriptPath () {
         return scriptpath;
     };
 
     //This is a stub for loading.
     sabre.include("util");
     sabre.include("renderer-main");
 } else {
     //This is a stub for loading.
     require("./util.min.js");
     require("./renderer-main.min.js");
     /**
      * returns the root directory for included ecmascript files.
      * @return {string} the path.
      */
     sabre["getScriptPath"] = function getScriptPath () {
         return scriptpath;
     };
     module.exports = external;
 }
 