#!/bin/sh
. "$PWD/sbin/bootstrap.sh"

find "$BUILD_DATA_DIR/" -type f -not -name .gitignore | xargs rm -f 
find "$BIN_DIR/" -type f -not -name .gitignore | xargs rm -f 
find "$TEMP_DIR/" -type f -not -name .gitignore | xargs rm -f 
rm -f "$TOOL_DATA_DIR/changes.cfg"