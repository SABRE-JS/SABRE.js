#!/bin/sh
. "$PWD/sbin/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

LOG_FILE="$PROJECT_ROOT/pre-commit.log"
rm -f $LOG_FILE
echo "Running pre-commit hook..." | tee -a $LOG_FILE
echo "Running pretty-quick..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh pretty-quick --staged | tee -a $LOG_FILE
echo "Running goodparts..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh goodparts ./src | tee -a $LOG_FILE
echo "Finished pre-commit hook..." | tee -a $LOG_FILE

