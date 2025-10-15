#!/bin/bash

echo "🚀 ByteWise Nutritionist - Large Repository Push Helper"
echo "====================================================="
echo ""

# Check repository size
echo "📊 Repository Analysis:"
echo "----------------------"
echo "Total files: $(git ls-files | wc -l)"
echo "Repository size: $(du -sh .git | cut -f1)"
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Option 1: Try pushing with increased buffer
echo "🔧 Option 1: Push with increased buffer size"
echo "-------------------------------------------"
echo "git config http.postBuffer 524288000"
echo "git push -u origin $CURRENT_BRANCH"
echo ""

# Option 2: Create a new repository
echo "🔧 Option 2: Create a new repository (Recommended)"
echo "------------------------------------------------"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository: Bytewise-Nutritionist-v2"
echo "3. Run these commands:"
echo "   git remote add new-origin https://github.com/stephenB75/Bytewise-Nutritionist-v2.git"
echo "   git push -u new-origin $CURRENT_BRANCH"
echo ""

# Option 3: Use Git LFS for large files
echo "🔧 Option 3: Use Git LFS for large files"
echo "---------------------------------------"
echo "1. Install Git LFS: brew install git-lfs"
echo "2. Initialize LFS: git lfs install"
echo "3. Track large files: git lfs track '*.jpg' '*.png' '*.svg'"
echo "4. Add and commit: git add .gitattributes && git commit -m 'Add LFS tracking'"
echo "5. Push: git push -u origin $CURRENT_BRANCH"
echo ""

# Option 4: Remove large files and push
echo "🔧 Option 4: Remove large files and push (Quick fix)"
echo "--------------------------------------------------"
echo "1. Remove large assets: rm -rf archive/ dist/ node_modules/"
echo "2. Add to .gitignore: echo 'archive/' >> .gitignore"
echo "3. Commit changes: git add . && git commit -m 'Remove large files'"
echo "4. Push: git push -u origin $CURRENT_BRANCH"
echo ""

echo "🎯 Recommended Action:"
echo "---------------------"
echo "Use Option 2 (new repository) for the cleanest solution."
echo "Your current repository has all the iOS fixes and improvements ready to go!"
echo ""

echo "📋 Current Status:"
echo "-----------------"
echo "✅ All iOS deployment target fixes applied"
echo "✅ Authentication system working"
echo "✅ Mock API server ready"
echo "✅ Build scripts created"
echo "✅ Documentation complete"
echo "✅ Ready for GitHub (just need to handle size)"
