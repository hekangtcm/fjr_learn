cd "$(dirname "$0")"

echo "Starting BookNest backend + frontend..."

cd backend
npm run dev > /tmp/booknest-backend.log 2>&1 &
BACKEND_PID=$!

cd ../frontend
npm run dev > /tmp/booknest-frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID (port 4000)"
echo "Frontend PID: $FRONTEND_PID (port 4001)"
echo ""
echo "Logs:"
echo "  tail -f /tmp/booknest-backend.log"
echo "  tail -f /tmp/booknest-frontend.log"
echo ""
echo "Press Ctrl+C to stop both"
wait $BACKEND_PID $FRONTEND_PID
