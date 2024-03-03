#!/usr/bin/env bash

rc=0

node scripts/check-exports.js || rc=$?
node scripts/check-external-deps.js || rc=$?

exit $rc
