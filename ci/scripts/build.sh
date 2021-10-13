#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
  npm run build
  npm transpile:es5
  SHORT_REF=`git rev-parse --short HEAD`
popd

mkdir build/$SHORT_REF
cp  dp-design-system/dist/assets/css/main.css build/$SHORT_REF/main.css
cp  dp-design-system/dist/assets/js/main.js build/$SHORT_REF/main.js
