#!/usr/bin/env bash
# Start a local server for the app. Then open http://localhost:8000
# For phone testing, in a second terminal run:  cloudflared tunnel --url http://localhost:8000
set -e
PORT="${1:-8000}"
echo "Serving on http://localhost:$PORT  (Ctrl+C to stop)"
python3 -m http.server "$PORT"
