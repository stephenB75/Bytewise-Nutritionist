#!/bin/bash

echo "🔍 iOS Build Validation for ByteWise Nutritionist"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any errors are found
ERRORS_FOUND=0

# Function to check a condition
check_condition() {
    local condition=$1
    local success_msg=$2
    local error_msg=$3
    
    if eval "$condition"; then
        echo -e "${GREEN}✅ $success_msg${NC}"
    else
        echo -e "${RED}❌ $error_msg${NC}"
        ERRORS_FOUND=1
    fi
}

# Check if Node modules are installed
echo ""
echo "📦 Checking Node Dependencies..."
check_condition "[ -d 'node_modules' ]" \
    "Node modules installed" \
    "Node modules not found. Run: npm install"

# Check if Capacitor is installed
check_condition "[ -f 'node_modules/@capacitor/cli/package.json' ]" \
    "Capacitor CLI installed" \
    "Capacitor CLI not found. Run: npm install"

# Check if iOS project exists
echo ""
echo "📱 Checking iOS Project Structure..."
check_condition "[ -d 'ios/App' ]" \
    "iOS project directory exists" \
    "iOS project not found. Run: npx cap add ios"

check_condition "[ -f 'ios/App/App.xcodeproj/project.pbxproj' ]" \
    "Xcode project file exists" \
    "Xcode project file missing"

check_condition "[ -f 'ios/App/Podfile' ]" \
    "Podfile exists" \
    "Podfile missing"

# Check Capacitor config
echo ""
echo "⚙️ Checking Capacitor Configuration..."
check_condition "[ -f 'capacitor.config.ts' ]" \
    "Capacitor config exists" \
    "Capacitor config missing"

# Validate capacitor config has correct app ID
if [ -f "capacitor.config.ts" ]; then
    if grep -q "appId: 'com.bytewise.nutritionist'" capacitor.config.ts; then
        echo -e "${GREEN}✅ App ID correctly set${NC}"
    else
        echo -e "${YELLOW}⚠️  App ID may need verification${NC}"
    fi
fi

# Check build output directory
echo ""
echo "🏗️ Checking Build Output..."
check_condition "[ -d 'dist/public' ]" \
    "Build output directory exists" \
    "Build output missing. Run: npm run build"

# Check for common iOS plugin issues
echo ""
echo "🔌 Checking Capacitor Plugins..."
PLUGINS=(
    "@capacitor/camera"
    "@capacitor/filesystem"
    "@capacitor/haptics"
    "@capacitor/keyboard"
    "@capacitor/local-notifications"
    "@capacitor/push-notifications"
    "@capacitor/splash-screen"
    "@capacitor/status-bar"
)

for plugin in "${PLUGINS[@]}"; do
    if [ -d "node_modules/$plugin" ]; then
        echo -e "${GREEN}✅ $plugin installed${NC}"
    else
        echo -e "${RED}❌ $plugin missing${NC}"
        ERRORS_FOUND=1
    fi
done

# Check deployment target consistency
echo ""
echo "🎯 Checking Deployment Targets..."
if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
    PROJ_TARGET=$(grep "IPHONEOS_DEPLOYMENT_TARGET" ios/App/App.xcodeproj/project.pbxproj | head -1 | sed 's/.*= \(.*\);/\1/')
    POD_TARGET=$(grep "platform :ios" ios/App/Podfile | sed "s/.*'\(.*\)'.*/\1/")
    
    if [ "$PROJ_TARGET" = "$POD_TARGET" ]; then
        echo -e "${GREEN}✅ Deployment targets match (iOS $PROJ_TARGET)${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment target mismatch: Project=$PROJ_TARGET, Podfile=$POD_TARGET${NC}"
    fi
fi

# Check if running on macOS
echo ""
echo "💻 Checking Build Environment..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${GREEN}✅ Running on macOS${NC}"
    
    # Check for Xcode
    if command -v xcodebuild &> /dev/null; then
        XCODE_VERSION=$(xcodebuild -version | head -1)
        echo -e "${GREEN}✅ $XCODE_VERSION installed${NC}"
    else
        echo -e "${RED}❌ Xcode not found${NC}"
        ERRORS_FOUND=1
    fi
    
    # Check for CocoaPods
    if command -v pod &> /dev/null; then
        POD_VERSION=$(pod --version)
        echo -e "${GREEN}✅ CocoaPods $POD_VERSION installed${NC}"
    else
        echo -e "${YELLOW}⚠️  CocoaPods not installed. Run: sudo gem install cocoapods${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Not on macOS. iOS building requires macOS with Xcode${NC}"
fi

# Final summary
echo ""
echo "=================================================="
if [ $ERRORS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✨ Validation Complete! No critical issues found.${NC}"
    echo ""
    echo "Next steps:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "1. Run: ./ios-build.sh"
        echo "2. Open Xcode and configure signing"
        echo "3. Build and archive for distribution"
    else
        echo "1. Transfer project to macOS machine"
        echo "2. Run: ./ios-build.sh"
        echo "3. Follow Xcode build process"
    fi
else
    echo -e "${RED}⚠️  Issues found that need to be resolved${NC}"
    echo "Please fix the errors above before attempting to build"
fi

exit $ERRORS_FOUND