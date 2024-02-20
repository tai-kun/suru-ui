#!/usr/bin/env bash

set -e

function cleanup() {
    if [ -f src/theme/build/main.mjs ]; then
        rm src/theme/build/main.mjs
    fi
}

trap cleanup EXIT

npx esbuild src/theme/build/main.ts \
    --outfile=src/theme/build/main.mjs \
    --define:cfgTest=undefined \
    --define:process.env.NODE_ENV=\"production\" \
    --bundle \
    --sourcemap=inline \
    --format=esm \
    --platform=node \
    --target=es2022

node --enable-source-maps src/theme/build/main.mjs
