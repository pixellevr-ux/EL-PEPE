#!/bin/sh
export PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright-browsers
mkdir -p $PLAYWRIGHT_BROWSERS_PATH
npx -y playwright@latest install --with-deps chromium
npm install
