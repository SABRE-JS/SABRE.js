#!/bin/sh
. "$PWD/sbin/bootstrap.sh"


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
        if [ $STATE -eq 0 ]; then
            if (echo "$input_line" | grep -Eq "^\\s*.*?:[0-9]+:\\s+WARNING|ERROR\\s+-\\s+\\[.*?\\]\\s+.*\$"); then
                STATE=1
            fi
            echo "$input_line"
        elif [ $STATE -eq 1 ]; then
            STATE=2
        else
            STATE=0
            echo "    $(echo "$input_line" | sed "s/^\(\\s*\)\\^*/\1/" | wc -c)->$(echo "$input_line" | wc -c)"
        fi
    done
}

case $FORMATTER in
    closure)
        closure_error_formatter
        ;;
    *)
        echo "ERROR: Unknown error formatter" 1>&2
        default
        ;;
esac

    