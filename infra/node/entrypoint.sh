#!/bin/sh
set -e

cd /var/www/html

echo "==> Installing npm dependencies..."
npm install

echo "==> Building client bundle (public/build)..."
npm run build

echo "==> Building SSR bundle (bootstrap/ssr)..."
npm run build:ssr

echo "==> Starting Inertia SSR server on :13714..."
# createServer in @inertiajs/core defaults to host 0.0.0.0 / port 13714
node bootstrap/ssr/ssr.js &
SSR_PID=$!

# Wait until the SSR server answers /health so we fail fast if it crashed
echo "==> Waiting for SSR server to become ready..."
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    if node -e 'fetch("http://127.0.0.1:13714/health").then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))' 2>/dev/null; then
        echo "==> SSR server is ready."
        break
    fi
    if ! kill -0 "$SSR_PID" 2>/dev/null; then
        echo "==> SSR server exited unexpectedly (see logs above)." >&2
        exit 1
    fi
    sleep 1
done

echo "==> Starting Vite dev server on :5173..."
exec npm run dev -- --host 0.0.0.0
