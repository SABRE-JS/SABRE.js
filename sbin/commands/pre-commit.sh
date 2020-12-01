#!/bin/sh
. "$PWD/sbin/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/pre-commit.log"
rm -f $LOG_FILE
echo "Running pre-commit hook..." | tee -a $LOG_FILE
echo "Running pretty-quick..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh pretty-quick --staged | tee -a $LOG_FILE
echo "Running eslint..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh lint-staged | tee -a $LOG_FILE
RESULT_CODE=$?
echo "Finished pre-commit hook..." | tee -a $LOG_FILE
exit $RESULT_CODE