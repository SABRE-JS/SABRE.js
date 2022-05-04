#!/bin/sh
. "$PWD/sbin/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

RESULT_NEW=0
RESULT_CODE=0
LOG_FILE="$PROJECT_ROOT/packaging.log"
rm -f $LOG_FILE
echo "Creating NPM Package..." | tee -a $LOG_FILE
rm -rf "$TEMP_DIR/sabre"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
mkdir "$TEMP_DIR/sabre"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
cp "$PROJECT_ROOT/package.json" "$TEMP_DIR/sabre"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
cp -R "$PROJECT_ROOT/bin" "$TEMP_DIR/sabre/dist"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
rm "$TEMP_DIR/sabre/dist/.gitignore"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
cp -R "$PROJECT_ROOT/types" "$TEMP_DIR/sabre/types"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
cp "$PROJECT_ROOT/README.md" "$TEMP_DIR/sabre"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
cp "$PROJECT_ROOT/LICENCE.md" "$TEMP_DIR/sabre"
RESULT_NEW=$?
if [ $RESULT_CODE -ne 0 ]; then
    RESULT_CODE=$RESULT_NEW
fi
echo "Finished creating NPM Package..." | tee -a $LOG_FILE
exit $RESULT_CODE 