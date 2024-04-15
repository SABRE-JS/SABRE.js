#!/bin/sh
. "$PWD/scripts/bootstrap.sh"

LOG_FILE="$PROJECT_ROOT/dependencies.log"
if [ ! -d "$TEMP_DIR/codepage" ]; then
    rm -rf "$TEMP_DIR/codepage"
    git clone "https://git.sheetjs.com/sheetjs/js-codepage.git" "$TEMP_DIR/codepage"
fi
pushd "$TEMP_DIR/codepage"
printf '%s\n' "Building codepage dependency..." | tee -a $LOG_FILE
git pull 2>&1 | tee -a $LOG_FILE
make 2>&1 | tee -a $LOG_FILE
bash make.sh "$TOOL_DATA_DIR/codepage.csv" "$TEMP_DIR/codepage.js" cptable 2>&1 | tee -a $LOG_FILE
printf '%s\n' '(function(){' > "$PROJECT_SOURCE_DIR/lib/codepage.js"
cat "$TEMP_DIR/codepage.js" "$TEMP_DIR/codepage/cputils.js" | sed "s#require\('./cptable'\)#cptable#" | sed 's#root\.cptable#root["cptable"]#' | sed 's#cptable = factory(cptable)#root["cptable"] = factory(cptable)#' | sed 's#cpt\.utils#cpt["utils"]#' | sed 's#{ decode: decode, encode: encode, hascp: hascp, magic: magic, cache:cache }#{ "decode": decode, "encode": encode, "hascp": hascp, "magic": magic, "cache":cache }#' >> "$PROJECT_SOURCE_DIR/lib/codepage.js"
printf '%s\n' '}).call(sabre);' >> "$PROJECT_SOURCE_DIR/lib/codepage.js"
rm -f "$TEMP_DIR/codepage.js"
printf '%s\n' "Finished building codepage dependency." | tee -a $LOG_FILE
popd