#!/bin/sh

set -eu

PORT="${1:-8000}"

cd "$(dirname "$0")"
ruby -run -e httpd . -p "$PORT"
