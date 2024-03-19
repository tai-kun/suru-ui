#!/usr/bin/env bash

function cleanup() {
    if [ -d .cache/playwright ]; then
        rm -rf .cache/playwright
    fi
}

trap cleanup EXIT

npx playwright test -c config/playwright/ct.config.ts
