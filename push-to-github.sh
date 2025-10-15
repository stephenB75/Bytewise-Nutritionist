#!/bin/bash

echo "🚀 ByteWise Nutritionist - Push to GitHub"
echo "========================================"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

echo ""
echo "🔧 Setting up GitHub remote..."

# Update remote URL
git remote set-url origin "https://github.com/$GITHUB_USERNAME/Bytewise-Nutritionist.git"

echo "✅ Remote URL updated to: https://github.com/$GITHUB_USERNAME/Bytewise-Nutritionist.git"
echo ""

# Check if repository exists
echo "🔍 Checking if repository exists..."
if curl -s "https://api.github.com/repos/$GITHUB_USERNAME/Bytewise-Nutritionist" | grep -q "Not Found"; then
    echo "❌ Repository not found. Please create it first:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Name: Bytewise-Nutritionist"
    echo "   3. Description: AI-powered nutrition tracking app with iOS deployment target fixes"
    echo "   4. Make it Public or Private"
    echo "   5. DO NOT initialize with README, .gitignore, or license"
    echo ""
    read -p "Press Enter after creating the repository..."
fi

echo ""
echo "📤 Pushing to GitHub..."

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "📋 Repository Details:"
    echo "   URL: https://github.com/$GITHUB_USERNAME/Bytewise-Nutritionist"
    echo "   Commits: $(git rev-list --count HEAD)"
    echo "   Files: $(git ls-files | wc -l)"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Visit: https://github.com/$GITHUB_USERNAME/Bytewise-Nutritionist"
    echo "   2. Verify all files are uploaded"
    echo "   3. Test iOS build: cd ios && ./fix-ios-deployment-target.sh"
    echo "   4. Open in Xcode: open ios/App/App.xcodeproj"
    echo ""
    echo "✨ Your ByteWise Nutritionist app is now on GitHub!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   1. Repository exists on GitHub"
    echo "   2. You have write access"
    echo "   3. Internet connection is working"
    echo ""
    echo "🔧 Manual push command:"
    echo "   git push -u origin main"
fi
