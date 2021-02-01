#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
  npm run build
  SHORT_REF=`git rev-parse --short HEAD`
popd

mkdir build/$SHORT_REF
cp  dp-design-system/dist/css/main.css build/$SHORT_REF/main.css