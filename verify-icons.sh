#!/bin/bash

echo "=== Icon Verification Report ==="
echo ""
echo "Development Icons:"
echo "- apple-icon.png: $([ -f "public/apple-icon.png" ] && echo "✓ Present" || echo "✗ Missing")"
echo "- apple-touch-icon.png: $([ -f "public/apple-touch-icon.png" ] && echo "✓ Present" || echo "✗ Missing")"
echo ""
echo "Production Icons (dist/public):"
echo "- apple-icon.png: $([ -f "dist/public/apple-icon.png" ] && echo "✓ Present" || echo "✗ Missing")"
echo "- apple-touch-icon.png: $([ -f "dist/public/apple-touch-icon.png" ] && echo "✓ Present" || echo "✗ Missing")"
echo ""
echo "HTML References:"
echo "Development (index.html):"
grep "apple-touch-icon" index.html | head -2
echo ""
echo "Production (dist/public/index.html):"
grep "apple-touch-icon" dist/public/index.html | head -2
echo ""
echo "Manifest.json Icons:"
grep -A2 "apple-icon" public/manifest.json | head -5
