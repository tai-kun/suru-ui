#!/usr/bin/env bash

set -e

function cleanup() {
    if [ -f src/icons/build/main.mjs ]; then
        rm src/icons/build/main.mjs
    fi
}

trap cleanup EXIT

npx esbuild src/icons/build/main.ts \
    --outfile=src/icons/build/main.mjs \
    --define:cfgTest=undefined \
    --define:process.env.NODE_ENV=\"production\" \
    --bundle \
    --sourcemap=inline \
    --format=esm \
    --platform=node \
    --target=es2022 \
    --packages=external

node --enable-source-maps src/icons/build/main.mjs
