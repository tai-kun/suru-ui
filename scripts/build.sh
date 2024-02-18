#!/usr/bin/env bash

set -e

function cleanup() {
    if [ -f tsconfig.build.json ]; then
        rm tsconfig.build.json
    fi
}

trap cleanup EXIT

node ./scripts/build.js
