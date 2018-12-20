#!/usr/bin/env bash

# Builds and pushes the docker image.
#
# Usage:
#   ./build-docker.sh [VER]
#
# Where VER defaults to the version specified in package.json
#
# The docker image will be tagged with the specified VER followed by the current git hash.

set -e

REPO="691216021071.dkr.ecr.us-east-1.amazonaws.com"
name="react-quantadex"

if [[ "${1}" == "" ]]; then
    VER="$(sed -nE '/version/{s/.*:\s*"(.*)",/\1/p;q}' package.json)"
    VER=${VER:-0.0}
else
    VER="${1}"
fi

# if [[ $(git diff --stat) != '' ]]; then
#     echo "The current git directory is dirty. Please stash, commit or remove your changes. (Hint: git diff --stat)"
#     exit 1
# fi

VER=${VER}-$(git rev-parse --short HEAD)

image="$REPO/$name:$VER"
dockerfile="Dockerfile"

$(aws ecr get-login --no-include-email --region us-east-1)

echo "Build: $name"
echo "Image: $image"
if [[ $(aws ecr describe-repositories | grep $name | wc -l) = "0" ]]; then
   aws ecr create-repository --repository-name $name
fi

docker build -t $image -f $dockerfile .
docker tag $image $REPO/$name:latest
docker tag $image $name:latest

if [[ ${NOPUSH:-"0"} == "0" ]]; then
  docker push $image
  docker push $REPO/$name:latest
else
  echo "push skipped (NOPUSH=${NOPUSH})"
fi

echo "... done: $image"
echo
