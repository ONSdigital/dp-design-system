#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
  npm run build
  SHORT_REF=`git rev-parse --short HEAD`
popd

mkdir build/$SHORT_REF
cp -a dp-design-system/dist/assets/. build/$SHORT_REF
