#!/bin/sh
. "$PWD/sbin/bootstrap.sh"
. "$PWD/sbin/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/debug.log"
rm -f $LOG_FILE
find "$TEST_DIR/" \( -type f -and -name "*.js" \) -or \( -type f -and -name "*.glsl" \) -or \( -type f -and -name "*.map" \) | xargs rm -f > /dev/null 2>&1
cp -r $DEBUG_BIN_DIR/* "$TEST_DIR" > /dev/null 2>&1
$SCRIPT_BIN_DIR/helpers/execute-node.sh http-server "$TEST_DIR" -p 8081 -r --no-dotfiles | tee -a "$LOG_FILE" &
PID=$!
echo "$(xdg-open "http://localhost:8081" 2>&1 > /dev/null || kde-open "http://localhost:8081" 2>&1 > /dev/null || gnome-open "http://localhost:8081" 2>&1 > /dev/null)" > /dev/null 2>&1
sleep 8
read -p "Press enter to stop the server." TRASH
kill $PID