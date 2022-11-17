#!/bin/sh
. "$PWD/scripts/bootstrap.sh"

$SCRIPT_BIN_DIR/commands/clean.sh
find "$TOOL_BIN_DIR/" -type f -not -name .gitignore | xargs rm -f 
find "$TOOL_BIN_DIR/" -type d -and -not -name "." -and -not -name ".." | xargs rmdir