#!/bin/bash -eux

pushd sixteens
  npm audit --audit-level=high
popd