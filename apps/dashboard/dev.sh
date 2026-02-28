#!/usr/bin/env bash
ulimit -n 65536 2>/dev/null || ulimit -n 10240 2>/dev/null || true
exec next dev --port 3000 --hostname 127.0.0.1 "$@"
