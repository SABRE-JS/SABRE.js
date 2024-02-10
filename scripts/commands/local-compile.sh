#!/bin/sh
. "$PWD/scripts/bootstrap.sh"
. "$SCRIPT_BIN_DIR/defines/tools-defines.sh"
. "$SCRIPT_BIN_DIR/defines/closure-defines.sh"

LOG_FILE="$PROJECT_ROOT/compile.log"
rm -f $LOG_FILE
if [ ! -f "$TOOL_BIN_DIR/closure.jar" ]; then
    printf '%s\n' "Closure compiler is not installed, downloading..." > $LOG_FILE
#    $SCRIPT_BIN_DIR/helpers/download.sh "$CLOSURE_LATEST" "$TEMP_DIR/closure.tar.gz" 1>>/dev/null 2>>/dev/stdout | tee -a $LOG_FILE | cat 1>&2
    $SCRIPT_BIN_DIR/helpers/download.sh "$CLOSURE_LATEST" "$TEMP_DIR/closure.jar" 1>>/dev/null 2>>/dev/stdout | tee -a $LOG_FILE | cat 1>&2
    TEMPVAR_1="$PWD"
    cd "$TEMP_DIR"
#    tar xzf ./closure.tar.gz 
#    rm -f ./closure.tar.gz ./README.md ./COPYING
#    mv ./closure-compiler-v*.jar "$TOOL_BIN_DIR/closure.jar"
    mv ./closure.jar "$TOOL_BIN_DIR/closure.jar"
    cd "$TEMPVAR_1"
    unset TEMPVAR_1
fi
TEMPVAR_1="$PWD"
cd "$PROJECT_SOURCE_DIR"
FILES_TO_COMPILE="$(find ./ -type f -name "*.js" ! -name "*.min.js" ! -name "*.test.js" ! -path "*__tests__*" | sed -e "s'^\\./*''")"
FILES_TO_COPY="$(find ./ -type f ! -name ".gitignore" ! -name "*.js" ! -name "*.min.js" ! -name "*.test.js" ! -path "*__tests__*" | sed -e "s'^\\./*''")"
FILE_COUNT=$(printf '%s\n' "$FILES_TO_COMPILE" | wc -l | awk '{$1=$1};1')
cd "$TEMPVAR_1"
unset TEMPVAR_1

for f in $FILES_TO_COMPILE
do
    if $SCRIPT_BIN_DIR/helpers/file-modification-test.sh test "$f" $FILE_COUNT; then
        OUTPUT_FILE="$BIN_DIR/$(printf '%s\n' "$f" | sed -n 's|\.js|.min.js|p')"
        OUTPUT_FILE_DEBUG="$DEBUG_BIN_DIR/$f"
        OUTPUT_SOURCEMAP="$BIN_DIR/$(printf '%s\n' "$f" | sed -n 's|\.js|.map|p')"
        rm -rf "$OUTPUT_FILE" > /dev/null 2>&1
        printf '%s\n' "Packaging debug version of $f as $OUTPUT_FILE_DEBUG..." | tee -a $LOG_FILE
        printf '%s\n' "Compiling $f as $OUTPUT_FILE..." | tee -a $LOG_FILE
        mkdir -p "$(dirname "$OUTPUT_FILE")/"
        mkdir -p "$(dirname "$OUTPUT_FILE_DEBUG")/"
        if [ ! -f "$PROJECT_INCLUDE_DIR/$f" ]; then
            mkdir -p "$(dirname "$PROJECT_INCLUDE_DIR/$f")"
            touch "$PROJECT_INCLUDE_DIR/$f"
        fi

        SOURCE_CODE="$(cat "$PROJECT_SOURCE_DIR/$f")"

        WRAPPER="$CLOSURE_OUTPUT_WRAPPER_PREFIX$FILE_COUNT$CLOSURE_OUTPUT_WRAPPER_SUFFIX"
        DEBUG_PREFIX="$(printf '%s\n' "$WRAPPER" | sed 's/^\(.*\)%output%.*$/\1/g')"
        DEBUG_SUFFIX="$(printf '%s\n' "$WRAPPER" | sed 's/^.*%output%\(.*\)$/\1/g')"
        
		INCLUDE_LIST="--externs '$PROJECT_INCLUDE_DIR/shared.include.js' --externs '$PROJECT_INCLUDE_DIR/sabre.js'"
		FILES_TO_INCLUDE="$(printf '%s\n' "$SOURCE_CODE" | grep -E "//@include \[..*?\]" | sed -E "s|//@include \[(..*?)\]|\1.js|g" | tr '\r\n' ' ' | tr '\n' ' ')"
        SOURCE_CODE_DEBUG="$(printf '%s\n' "const DEBUG=true;"; printf '%s\n' "$SOURCE_CODE" | sed -E 's~//@include \[(..*?)\]~if(typeof require !== "function"){sabre.import("\1");}else{require("./\1.js");}~g')"
        SOURCE_CODE_BUILD="$(printf '%s\n' "const DEBUG=false;"; printf '%s\n' "$SOURCE_CODE" | sed -E 's~//@include \[(..*?)\]~if(typeof require !== "function"){sabre.import("\1");}else{require("./\1.min.js");}~g')"

        printf '%s\n' "$DEBUG_PREFIX" > "$OUTPUT_FILE_DEBUG"
        printf '%s\n' "$SOURCE_CODE_DEBUG" >> "$OUTPUT_FILE_DEBUG"
        printf '%s\n' "$DEBUG_SUFFIX" >> "$OUTPUT_FILE_DEBUG"
		
        for include in $FILES_TO_INCLUDE
		do
			if [ ! "$include" = "$f" ]; then
				INCLUDE_LIST="$INCLUDE_LIST --externs '$PROJECT_INCLUDE_DIR/$include'"
			fi
		done
        printf '%s\n' "$SOURCE_CODE_BUILD" | $SCRIPT_BIN_DIR/helpers/execute-java.sh -jar "\"$TOOL_BIN_DIR/closure.jar\"" $CLOSURE_TYPE_INF --jscomp_off=unknownDefines --jscomp_off=globalThis --jscomp_error=visibility --assume_function_wrapper --compilation_level=$CLOSURE_COMPILATION_LEVEL --warning_level=$CLOSURE_LOGGING_DETAIL --language_in=$CLOSURE_INPUT_LANGUAGE_VERSION --language_out=$CLOSURE_OUTPUT_LANGUAGE_VERSION --use_types_for_optimization=$CLOSURE_ENABLE_TYPED_OPTIMIZATION --assume_function_wrapper --output_wrapper="\"$CLOSURE_OUTPUT_WRAPPER_PREFIX$FILE_COUNT$CLOSURE_OUTPUT_WRAPPER_SUFFIX\"" $INCLUDE_LIST --js - --create_source_map "\"$OUTPUT_SOURCEMAP\"" --js_output_file "\"$OUTPUT_FILE\"" 2>&1 | $SCRIPT_BIN_DIR/helpers/error_formatter.sh closure "$PROJECT_SOURCE_DIR/$f" | tee -a $LOG_FILE
        
        sed -i "s|$OUTPUT_FILE|$(basename $OUTPUT_FILE)|g" "$OUTPUT_SOURCEMAP"
        sed -i "s|stdin|$(basename $f)|g" "$OUTPUT_SOURCEMAP"
        
        $SCRIPT_BIN_DIR/helpers/execute-toolscript.sh editsourcemap.js "$OUTPUT_SOURCEMAP" "$OUTPUT_SOURCEMAP" "$f" 1:0 0:0  2>&1 | tee -a $LOG_FILE

        printf '%s\n' "" >> "$OUTPUT_FILE"
        printf '%s\n' "//# sourceMappingURL=$(basename "$OUTPUT_SOURCEMAP")" >> "$OUTPUT_FILE"
    else
        printf '%s\n' "$f was not modified and theirfore was not recompiled." | tee -a $LOG_FILE
    fi
done
for f in $FILES_TO_COPY
do
    INPUT_FILE="$PROJECT_SOURCE_DIR/$f"
    OUTPUT_FILE="$BIN_DIR/$f"
    OUTPUT_FILE_DEBUG="$DEBUG_BIN_DIR/$f"
    rm -rf "$OUTPUT_FILE" > /dev/null 2>&1
    mkdir -p "$(dirname "$OUTPUT_FILE")" > /dev/null 2>&1
    cp "$INPUT_FILE" "$OUTPUT_FILE"
    rm -rf "$OUTPUT_FILE_DEBUG" > /dev/null 2>&1
    mkdir -p "$(dirname "$OUTPUT_FILE_DEBUG")" > /dev/null 2>&1
    cp "$INPUT_FILE" "$OUTPUT_FILE_DEBUG"
done
$SCRIPT_BIN_DIR/helpers/file-modification-test.sh init "$FILES_TO_COMPILE"