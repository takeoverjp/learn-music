#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
root=$(pwd)

if [ ! -s dist/index.html ]; then
  echo "Missing dist/index.html. Run npm run build before running E2E." >&2
  exit 1
fi

image=$(docker build --quiet --platform linux/amd64 -f e2e/Dockerfile .)
mkdir -p playwright-report test-results

exec docker run --rm --init --platform linux/amd64 --shm-size=1g \
  --user "$(id -u):$(id -g)" \
  --env HOME=/tmp --env CI \
  --mount "type=bind,source=$root/dist,target=/app/dist,readonly" \
  --mount "type=bind,source=$root/e2e,target=/app/e2e" \
  --mount "type=bind,source=$root/playwright-report,target=/app/playwright-report" \
  --mount "type=bind,source=$root/test-results,target=/app/test-results" \
  "$image" "$@"
