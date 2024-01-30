#!/bin/sh
. "$PWD/scripts/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/readme.log"
rm -f $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh jsdoc2md -d 4 --template README.hbs --files src/*.js > README.md | tee -a "$LOG_FILE"
