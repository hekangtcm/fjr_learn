#!/usr/bin/env bash
# BookNest Mini Pro - End-to-End Test Script
# Usage: bash scripts/e2e-test.sh

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
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1 || echo "ERR")
  
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

echo "[1/4] Backend Health Check"
test_api "Root health" "http://47.103.214.67/health" "200"
test_api "API books (auth required)" "$API_BASE/books" "401"
test_api "API auth me (auth required)" "$API_BASE/auth/me" "401"
test_api "API categories" "$API_BASE/categories" "401"
echo ""

echo "[2/4] Nginx / Static Assets"
test_api "Nginx health" "http://47.103.214.67/health" "200"
echo ""

echo "[3/4] Taro Build Check"
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

echo "[4/4] Source Files Check"
files_to_check=(
  "src/app.config.ts"
  "src/config/env.ts"
  "src/services/request.ts"
  "src/utils/image.ts"
  "src/platform/index.ts"
  "scripts/upload.cjs"
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
