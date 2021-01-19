#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
popd

cp -r dp-design-system/dist/* build/
