#!/usr/bin/env bash
# BookNest Mini Pro - End-to-End Test Script

set +e

API_BASE="http://47.103.214.67/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

function test_api() {
  local desc=$1
  local url=$2
  local expect=$3
  local method=${4:-GET}
  local actual
  actual=$(curl -s -X "$method" -o /dev/null -w "%{http_code}" "$url" 2>&1 || echo "ERR")
  
  if [ "$actual" = "$expect" ]; then
    echo -e "${GREEN}✓${NC} $desc (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} $desc (expected HTTP $expect, got HTTP $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo "========================================"
echo "  BookNest Mini Pro - E2E Test Suite"
echo "  $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "  API: $API_BASE"
echo "========================================"
echo ""

echo "[1/5] Backend Health & Nginx"
test_api "Root health" "http://47.103.214.67/health" "200"
test_api "Nginx health" "http://47.103.214.67/health" "200"
echo ""

echo "[2/5] Core API Routes (auth required = 401 is correct)"
test_api "GET /api/v1/books" "$API_BASE/books" "401"
test_api "GET /api/v1/auth/me" "$API_BASE/auth/me" "401"
test_api "GET /api/v1/categories" "$API_BASE/categories" "401"
test_api "GET /api/v1/orders" "$API_BASE/orders" "401"
test_api "GET /api/v1/workspaces" "$API_BASE/workspaces" "401"
echo ""

echo "[3/5] Day 14-16 New Routes (POST routes)"
test_api "POST /api/v1/wechat-pay/prepay" "$API_BASE/wechat-pay/prepay" "401" "POST"
test_api "POST /api/v1/subscriptions/record" "$API_BASE/subscriptions/record" "401" "POST"
test_api "POST /api/v1/customer-service/events" "$API_BASE/customer-service/events" "401" "POST"
test_api "GET /api/v1/admin/checks" "$API_BASE/admin/checks" "401"
echo ""

echo "[4/5] Taro Build Check"
if [ -d "dist" ]; then
  echo -e "${GREEN}✓${NC} dist/ directory exists"
  PASS=$((PASS + 1))
  
  if [ -f "dist/app.js" ]; then
    echo -e "${GREEN}✓${NC} dist/app.js exists ($(du -h dist/app.js | cut -f1))"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} dist/app.js missing"
    FAIL=$((FAIL + 1))
  fi
  
  if [ -d "dist/sub" ]; then
    echo -e "${GREEN}✓${NC} dist/sub/ exists (subpackage output)"
    PASS=$((PASS + 1))
  else
    echo -e "${YELLOW}!${NC} dist/sub/ missing (subpackages not built)"
  fi
  
  if [ -f "dist/sub/books/pages/detail/index.js" ]; then
    echo -e "${GREEN}✓${NC} sub/books/detail/index.js exists"
    PASS=$((PASS + 1))
  else
    echo -e "${YELLOW}!${NC} sub/books/detail/index.js missing"
  fi
  
  if [ -f "dist/sub/orders/pages/result/index.js" ]; then
    echo -e "${GREEN}✓${NC} sub/orders/result/index.js exists"
    PASS=$((PASS + 1))
  else
    echo -e "${YELLOW}!${NC} sub/orders/result/index.js missing"
  fi
else
  echo -e "${YELLOW}!${NC} dist/ not found - run 'taro build --type weapp' first"
fi
echo ""

echo "[5/5] Source Files Check"
files_to_check=(
  "src/app.config.ts"
  "src/config/env.ts"
  "src/services/request.ts"
  "src/utils/image.ts"
  "src/platform/index.ts"
  "scripts/upload.cjs"
  "docs/TESTING_GUIDE.md"
)

for f in "${files_to_check[@]}"; do
  if [ -f "$f" ]; then
    echo -e "${GREEN}✓${NC} $f exists"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} $f missing"
    FAIL=$((FAIL + 1))
  fi
done
echo ""

echo "========================================"
echo -e "  Results: ${GREEN}PASS=$PASS${NC} ${RED}FAIL=$FAIL${NC}"
echo "========================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
