/**
 * includes a ecmascript file asynchronously.
 * @param {string} scriptUrl The URL or URI of the script.
 * @param {function(boolean)=} callback Callback on success or failure.
 */
sabre.import = function (scriptUrl, callback) {};
/**
 * includes a ecmascript file
 * @param {string} scriptUrl The URL or URI of the script.
 * @param {function(boolean)=} callback Callback on success or failure.
 */
sabre.include = function (scriptUrl, callback) {};

/**
 * returns the root directory for included ecmascript files.
 * @return {string} the path.
 */
sabre.getScriptPath = function () {
    return "";
};
