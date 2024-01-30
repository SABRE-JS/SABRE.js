#!/bin/sh
export PROJECT_ROOT="$PWD"
export PROJECT_SOURCE_DIR="$PROJECT_ROOT/src"
export PROJECT_INCLUDE_DIR="$PROJECT_ROOT/include"
export SCRIPT_BIN_DIR="$PROJECT_ROOT/scripts"
export TOOL_BIN_DIR="$PROJECT_ROOT/tbin"
export TOOL_SCRIPTS_DIR="$PROJECT_ROOT/tscripts"
export TOOL_DATA_DIR="$PROJECT_ROOT/tdata"
export BIN_DIR="$PROJECT_ROOT/bin"
export DEBUG_BIN_DIR="$PROJECT_ROOT/debugbin"
export TEST_DIR="$PROJECT_ROOT/test"
export TEMP_DIR="$PROJECT_ROOT/temp_files"


case $(uname -s) in
    Hurd)
        export NIX_TYPE="gnu"
        export NIX_SUBTYPE="gnu";;
    Linux)
        export NIX_TYPE="gnu"
        export NIX_SUBTYPE="linux";;
    Darwin)
        export NIX_TYPE="bsd"
        export NIX_SUBTYPE="darwin";;
    *BSD)
        export NIX_TYPE="bsd"
        export NIX_SUBTYPE="bsd";;
    *)
        export NIX_TYPE="unknown"
        export NIX_SUBTYPE="unknown";;
esac

if [ "$NIX_TYPE" = "bsd" ]; then
    if [ "$NIX_SUBTYPE" = "darwin" ]; then
        which brew > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "Please install the Homebrew package manager." >&2
            exit 1
        fi
        which gsed > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "Installing GNU sed..."
            brew install gsed
        fi
        alias sed="gsed"
    elif [ "$NIX_SUBTYPE" = "bsd" ]; then
        which gsed > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "Installing GNU sed..."
            pkg install gsed
        fi
        alias sed="gsed"
    else
        which gsed > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "Please install GNU sed." >&2
            exit 1
        fi
        alias sed="gsed"
    fi
fi