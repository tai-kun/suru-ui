#!/usr/bin/env bash

rc=0

node scripts/check-exports.js || rc=$?

exit $rc
