#!/bin/sh
. "$PWD/sbin/bootstrap.sh"
. "$PWD/sbin/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/debug.log"
rm -f $LOG_FILE
if [ ! -f "$TOOL_BIN_DIR/jlhttp.jar" ]; then
    echo "JLHTTP is not installed, downloading..." > $LOG_FILE
    $SCRIPT_BIN_DIR/helpers/download.sh "$JLHTTP_LATEST" "$TEMP_DIR/jlhttp.zip" 1>>/dev/null 2>>/dev/stdout | tee -a $LOG_FILE | cat 1>&2
    TEMPVAR_1="$PWD"
    cd "$TEMP_DIR"
    ls
    unzip ./jlhttp.zip 
    mv ./jlhttp-*/lib/jlhttp-*.jar "$TOOL_BIN_DIR/jlhttp.jar"
    rm -rf ./jlhttp-*/
    rm -f ./jlhttp.zip
    cd "$TEMPVAR_1"
    unset TEMPVAR_1
fi
find "$TEST_DIR/" -type f -not -name .gitignore -not -name "*.html" -not -name "*.css" -not -name "*.mp4" -not -name "*.m4v" -not -name "*.webm" -not -name "*.ass" -not -name "*.ssa" -not -name "*.woff" -not -name "*.ttf" -not -name "*.otf" | xargs rm -f > /dev/null 2>&1
cp -r $BIN_DIR/* "$TEST_DIR" > /dev/null 2>&1
$SCRIPT_BIN_DIR/helpers/execute-java.sh -jar "$TOOL_BIN_DIR/jlhttp.jar" "$TEST_DIR" 8081 | tee -a "$LOG_FILE" &
echo "$(xdg-open "http://localhost:8081" 2>&1 > /dev/null || kde-open "http://localhost:8081" 2>&1 > /dev/null || gnome-open "http://localhost:8081" 2>&1 > /dev/null)" > /dev/null 2>&1
sleep 2
read -p "Press enter to stop the server." TRASH
pkill java