#!/bin/sh
. "$PWD/scripts/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"

if [ ! -d "$TOOL_BIN_DIR/node_tools" ]; then 
    mkdir "$TOOL_BIN_DIR/node_tools" > /dev/null 2>&1
    echo $NPM_PACKAGES | xargs npm install --prefix "$TOOL_BIN_DIR/node_tools" --save-dev --save-exact
fi

NODE_TOOLS_BINDIR="$TOOL_BIN_DIR/node_tools/node_modules/.bin"

export NODE_PATH="$NODE_PATH:$TOOL_BIN_DIR/node_tools/node_modules"
eval "$NODE_TOOLS_BINDIR/$@"

RESULT_CODE=$?

exit $RESULT_CODE