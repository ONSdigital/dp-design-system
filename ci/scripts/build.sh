#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
  npm run build
  SHORT_REF=`git rev-parse --short HEAD`
popd

cp -r dp-design-system/dist/css/main.css build/$SHORT_REF