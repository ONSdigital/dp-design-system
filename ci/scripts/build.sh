#!/bin/bash -eux

pushd sixteens
  npm install --unsafe-perm
popd

cp -r sixteens/dist/* build/
