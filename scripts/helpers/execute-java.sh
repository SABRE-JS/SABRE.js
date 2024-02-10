#!/bin/sh
. "$PWD/scripts/bootstrap.sh"

IKVM_DOWNLOAD_URL="http://www.frijters.net/ikvmbin-8.1.5717.0.zip"

USED_JVM="java"
JVM_SETTINGS="-server -XX:+TieredCompilation"

BACKUP_PATH="$PATH"
export PATH="$PATH:$TOOL_BIN_DIR"

if [ -x "$(command -v ikvm)" ]; then
    USED_JVM="ikvm"
    JVM_SETTINGS=""
elif [ ! -x "$(command -v java)" -a -x "$(command -v mono)" ]; then
    USED_JVM="ikvm"
    JVM_SETTINGS=""
    $SCRIPT_BIN_DIR/helpers/download.sh "$IKVM_DOWNLOAD_URL" "$TEMP_DIR/ikvm.zip"
    TEMPVAR_1="$PWD"
    cd "$TEMP_DIR"
    unzip ./ikvm.zip -d ./ikvm
    TEMPVAR_2=$(find ./ikvm -name "ikvm-*" -type d)
    cd $TEMPVAR_2
    mv -f ./* "$TEMP_DIR/ikvm"
    cd "$TEMP_DIR"
    mv ./ikvm/bin-x64/JVM.DLL ./ikvm/bin
    rm -rf ./ikvm.zip ./ikvm/lib ./ikvm/bin-x86 ./ikvm/bin-x64 ./ikvm/LICENSE ./ikvm/THIRD_PARTY_README ./ikvm/TRADEMARK $TEMPVAR_2
    unset TEMPVAR_2
    mv -f ./ikvm "$TOOL_BIN_DIR/ikvm_files"
    cd "$TEMPVAR_1"
    unset TEMPVAR_1
    printf '%s\n' "#!/bin/sh" > "$TOOL_BIN_DIR/ikvm"
    printf '%s\n' "mono --gc=sgen \"\$(dirname \"\$(readlink -f \"\$0\")\")/ikvm_files/bin/ikvm.exe\" \$@" >> "$TOOL_BIN_DIR/ikvm"
    chmod +x "$TOOL_BIN_DIR/ikvm"
elif ! [ -x "$(command -v java)" ]; then
    printf '%s\n' "JVM not present and mono-runtime is not installed, please install one or the other."
    exit 3
fi
#printf '%s\n' "Compile Command: \"$USED_JVM $JVM_SETTINGS $@\""
eval "$USED_JVM $JVM_SETTINGS $@"
RESULT_CODE=$?

export PATH="$BACKUP_PATH"
exit $RESULT_CODE