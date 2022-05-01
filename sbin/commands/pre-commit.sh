#!/bin/sh
. "$PWD/sbin/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

RESULT_NEW=0
RESULT_CODE=0
LOG_FILE="$PROJECT_ROOT/pre-commit.log"
rm -f $LOG_FILE
echo "Running pre-commit hook..." | tee -a $LOG_FILE
echo "Running pretty-quick..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh pretty-quick --staged | tee -a $LOG_FILE
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
echo "Running eslint..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh lint-staged | tee -a $LOG_FILE
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
echo "Running tests..." | tee -a $LOG_FILE
$SCRIPT_BIN_DIR/helpers/execute-node.sh jest -o | tee -a $LOG_FILE
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
echo "Finished pre-commit hook..." | tee -a $LOG_FILE
exit $RESULT_CODE 