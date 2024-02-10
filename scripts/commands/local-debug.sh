#!/bin/sh
. "$PWD/scripts/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/debug.log"
rm -f $LOG_FILE
find "$TEST_DIR/" \( -type f -and -name "*.js" \) -or \( -type f -and -name "*.glsl" \) -or \( -type f -and -name "*.map" \) | xargs rm -f > /dev/null 2>&1
false | cp -r -i $DEBUG_BIN_DIR/* "$TEST_DIR" > /dev/null 2>&1
false | cp -r -i $BIN_DIR/* "$TEST_DIR" > /dev/null 2>&1
printf '%s\n' "$(xdg-open "http://localhost:8081" 2>&1 > /dev/null || kde-open "http://localhost:8081" 2>&1 > /dev/null || gnome-open "http://localhost:8081" 2>&1 > /dev/null)" > /dev/null 2>&1 &
$SCRIPT_BIN_DIR/helpers/execute-node.sh http-server "$TEST_DIR" -p 8081 -r --cors --no-dotfiles | tee -a "$LOG_FILE"