#!/usr/bin/env bash

set -e

function cleanup() {
    if [ -f tsconfig.build.json ]; then
        rm tsconfig.build.json
    fi
}

trap cleanup EXIT

# reset

if [ -d dist ]; then
    rm -rf dist
fi

# build scripts

node ./scripts/build.js

# build types

cp config/build/tsconfig.build.json tsconfig.build.json
npx tsc -p tsconfig.build.json

# copy css

(cd src && find . -name '*.css' -exec sh -c '
    for file do
        mkdir -p "../dist/$(dirname "$file")"
        cp "$file" "../dist/$file"
    done
' sh {} +)

# copy LICENSE

(cd src && find . -name 'LICENSE' -exec sh -c '
    for file do
        mkdir -p "../dist/$(dirname "$file")"
        cp "$file" "../dist/$file"
    done
' sh {} +)

# remove dev files

rm -r dist/icons/build
rm -r dist/theme/build
