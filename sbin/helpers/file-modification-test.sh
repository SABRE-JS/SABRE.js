#!/bin/sh
. "$PWD/sbin/bootstrap.sh"

if [ "$1" = "test" ]; then
    TARGET_FILE=$2
    FILE_COUNT=$3
    TEMPVAR_1="$PWD"
    cd "$PROJECT_SOURCE_DIR"
    MODIFICATION_TIME=$(stat -c %Y $TARGET_FILE)
    cd "$TEMPVAR_1"
    unset TEMPVAR_1
    if [ ! -f "$TOOL_DATA_DIR/changes.cfg" ]; then
        touch "$TOOL_DATA_DIR/changes.cfg"
    fi
    for MODIFICATION_PAIR in $(cat "$TOOL_DATA_DIR/changes.cfg")
    do
        set -- `echo $MODIFICATION_PAIR | tr '=' ' '`
        if [ "$1" = "/COUNT" ]; then
            if [ "$2" -ne "$FILE_COUNT" ]; then
                exit 0
            fi
        elif [ "$1" = "$TARGET_FILE" ]; then
            [ "$2" -ne "$MODIFICATION_TIME" ]
            exit $?
        fi
    done
    exit 0
elif [ "$1" = "init" ]; then
    FILES_TO_SCAN="$2"
    FILE_COUNT=$(echo "$FILES_TO_SCAN" | wc -l)
    rm -f "$TOOL_DATA_DIR/changes.cfg"
    touch "$TOOL_DATA_DIR/changes.cfg"
    TEMPVAR_1="$PWD"
    cd "$PROJECT_SOURCE_DIR"
    echo "/COUNT=$FILE_COUNT" >> "$TOOL_DATA_DIR/changes.cfg"
    for f in $FILES_TO_SCAN
    do
        echo "$f=$(stat -c %Y $f)" >> "$TOOL_DATA_DIR/changes.cfg"
    done
    cd "$TEMPVAR_1"
    unset TEMPVAR_1
fi
