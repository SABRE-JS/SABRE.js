#!/bin/sh
export CLOSURE_REMOTE_API="https://closure-compiler.appspot.com/compile"

export CLOSURE_NAME="closure.jar"

export CLOSURE_LOGGING_DETAIL="VERBOSE"

export CLOSURE_COMPILATION_LEVEL="ADVANCED_OPTIMIZATIONS"

export CLOSURE_INPUT_LANGUAGE_VERSION="ECMASCRIPT_2020"
export CLOSURE_OUTPUT_LANGUAGE_VERSION="ECMASCRIPT5_STRICT"

export CLOSURE_ENABLE_TYPED_OPTIMIZATION=true

export CLOSURE_TYPE_INF_OPTION_OLD=
export CLOSURE_TYPE_INF_OPTION_NEW=--new_type_inf

export CLOSURE_TYPE_INF=$CLOSURE_TYPE_INF_OPTION_OLD

export CLOSURE_OUTPUT_WRAPPER_PREFIX="(function(global,external){var window=null;var self=null;var sabre=external.\$;{%output%}if(++sabre.\$==="
export CLOSURE_OUTPUT_WRAPPER_SUFFIX="){external.\$=null;sabre.\$=null}})(globalThis||self,(globalThis||self).sabre=((globalThis||self).sabre||{\$:{\$:0}}));"