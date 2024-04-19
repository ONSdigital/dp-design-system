#!/bin/bash -eux

pushd dp-design-system
  npm install --unsafe-perm
  npm run lint
popd
