#!/bin/bash -eux

pushd dp-design-system
  npm audit --audit-level=high
popd