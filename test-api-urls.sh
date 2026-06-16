#!/bin/bash

echo "========================================"
echo "Testing API URLs"
echo "========================================"
echo ""

echo "1. Testing PayVia Staging..."
curl -I https://api.payvia.staging.ondeets.ai 2>&1 | head -1
echo ""

echo "2. Testing PayVia Production..."
curl -I https://api.payvia.ondeets.ai 2>&1 | head -1
echo ""

echo "3. Testing Digitzs v2 API..."
curl -I https://api.digitzs.com/v2 2>&1 | head -1
echo ""

echo "4. Testing Digitzs Base API..."
curl -I https://api.digitzs.com 2>&1 | head -1
echo ""

echo "========================================"
echo "Test Complete"
echo "========================================"
echo ""
echo "Expected Results:"
echo "  - Staging: Should return 200 or 404 (not 403)"
echo "  - Production: Should return 200 or 404 (not 403)"
echo "  - Digitzs: Should return 200 or 404"
echo ""
echo "If you see 403 Forbidden:"
echo "  - DNS might not be configured correctly"
echo "  - Vercel deployment might not be running"
echo "  - IP restrictions might be in place"
