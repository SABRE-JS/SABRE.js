#!/bin/sh
. "$PWD/scripts/bootstrap.sh"

find "$DEBUG_BIN_DIR/" -type f -not -name .gitignore | xargs rm -f 
find "$BIN_DIR/" -type f -not -name .gitignore | xargs rm -f 
find "$TEMP_DIR/" -type f -not -name .gitignore | xargs rm -f 
rm -rf "$TEMP_DIR/codepage"
rm -f "$TOOL_DATA_DIR/changes.cfg"