#!/bin/sh
. "$PWD/scripts/bootstrap.sh"


FORMATTER=$1

default(){
    while read -r input_line
    do
        echo "$input_line"
    done
}

closure_error_formatter(){
    STATE=0
    while IFS= read -r input_line
    do
        input_line="$(echo "$input_line" | sed "s'stdin'$1'")"
        if [ $STATE -eq 0 ]; then
            if (echo "$input_line" | grep -Eq "^\\s*.*?:[0-9]+:\\s+WARNING|ERROR\\s+-\\s+\\[.*?\\]\\s+.*\$"); then
                STATE=1
            fi
            echo "$input_line"
        elif [ $STATE -eq 1 ]; then
            STATE=2
        else
            STATE=0
            echo "    $(echo "$input_line" | sed "s/^\(\\s*\)\\^*/\1/" | wc -c | awk '{$1=$1};1')->$(echo "$input_line" | wc -c | awk '{$1=$1};1')"
        fi
    done
}

case $FORMATTER in
    closure)
        closure_error_formatter $2
        ;;
    *)
        echo "ERROR: Unknown error formatter" 1>&2
        default
        ;;
esac

    