#!/bin/sh
. "$PWD/scripts/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/test.log"
echo "Running tests..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh jest | tee -a $LOG_FILE
RESULT_CODE=$?
exit $RESULT_CODE