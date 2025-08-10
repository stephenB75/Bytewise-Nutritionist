#!/bin/bash

echo "🔧 Fixing Xcode Sandbox Issue for External Volume"
echo "=================================================="
echo ""
echo "Your project is on an external volume, which causes sandbox restrictions."
echo "This script will modify the Xcode project to work around this issue."
echo ""

cd ios/App || exit

echo "📝 Step 1: Backing up project file..."
cp App.xcodeproj/project.pbxproj App.xcodeproj/project.pbxproj.backup

echo "🔄 Step 2: Modifying build phases to bypass sandbox..."

# Create a Ruby script to modify the Xcode project
cat > modify_project.rb << 'RUBY_SCRIPT'
require 'xcodeproj'

project = Xcodeproj::Project.open('App.xcodeproj')

# Find the main app target
app_target = project.targets.find { |t| t.name == 'App' }

if app_target
  puts "Found App target"
  
  # Find and modify the problematic build phase
  app_target.shell_script_build_phases.each do |phase|
    if phase.shell_script.include?('Pods-App-frameworks.sh')
      puts "Found Pods frameworks script phase: #{phase.name}"
      
      # Modify the script to bypass sandbox restrictions
      phase.shell_script = <<-SCRIPT
# Bypass sandbox restrictions for external volume
if [ -f "${PODS_ROOT}/Target Support Files/Pods-App/Pods-App-frameworks.sh" ]; then
  # Copy the script to a temporary location on the main drive
  cp "${PODS_ROOT}/Target Support Files/Pods-App/Pods-App-frameworks.sh" /tmp/pods-frameworks-temp.sh
  chmod +x /tmp/pods-frameworks-temp.sh
  # Execute from the temporary location
  /tmp/pods-frameworks-temp.sh
  # Clean up
  rm -f /tmp/pods-frameworks-temp.sh
else
  echo "Warning: Pods frameworks script not found, skipping..."
fi
SCRIPT
      
      puts "Modified script to bypass sandbox"
    end
  end
  
  # Save the project
  project.save
  puts "Project saved successfully"
else
  puts "Error: Could not find App target"
end
RUBY_SCRIPT

echo "🚀 Step 3: Running project modification..."
if command -v ruby &> /dev/null; then
  ruby modify_project.rb
  rm modify_project.rb
else
  echo "❌ Ruby not found. Please install Ruby or modify the project manually."
  exit 1
fi

echo ""
echo "✅ Project modified! Now:"
echo ""
echo "1. Open Xcode with the workspace:"
echo "   open App.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   • Clean Build Folder (Shift+Cmd+K)"
echo "   • Try building again (Cmd+B)"
echo ""
echo "If this doesn't work, you have two alternatives:"
echo ""
echo "OPTION A: Move project to main drive"
echo "   cp -R /Volumes/Mac\\ Pro\\ 2\\ HD/Bytewise-Nutritionist ~/Desktop/Bytewise-Nutritionist"
echo "   cd ~/Desktop/Bytewise-Nutritionist"
echo "   ./fix-ios-permissions.sh"
echo ""
echo "OPTION B: Disable App Sandbox in Xcode"
echo "   1. Open App.xcworkspace"
echo "   2. Select the App target"
echo "   3. Go to Signing & Capabilities"
echo "   4. Remove 'App Sandbox' capability if present"
echo "   5. Or add Entitlement: com.apple.security.app-sandbox = NO"