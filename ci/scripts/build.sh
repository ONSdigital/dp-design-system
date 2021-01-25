#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
  npm run build
  SHORT_REF=`git rev-parse --short HEAD`
popd

mkdir $SHORT_REF
cp -r dp-design-system/dist/css/main.css $SHORT_REF/main.css