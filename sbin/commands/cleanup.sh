#!/bin/sh
. "$PWD/sbin/bootstrap.sh"

$SCRIPT_BIN_DIR/commands/clean.sh
find "$TOOL_BIN_DIR/" -type f -not -name .gitignore | xargs rm -f 