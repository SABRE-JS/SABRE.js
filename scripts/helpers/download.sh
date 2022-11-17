#!/bin/sh
. "$PWD/scripts/bootstrap.sh"

if [ ! -x "$(command -v curl)" ]; then
    sudo apt-get update && sudo apt-get curl
fi
curl -s -S --proto -all,+http,+https,+QUIC "$1" -o "$2"
exit $?