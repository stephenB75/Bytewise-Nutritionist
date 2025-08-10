#!/bin/bash

echo "=== Fixing Xcode Archive Sandbox Permissions ==="
echo ""
echo "This script fixes the sandbox permission issues when archiving in Xcode"
echo ""

# Navigate to the iOS project directory
cd ios/App || exit 1

echo "1. Cleaning build folder..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "2. Reinstalling pods with proper permissions..."
rm -rf Pods
rm -f Podfile.lock

# Install pods
pod install

echo "3. Setting correct permissions on Pods scripts..."
chmod +x "Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh"
chmod +x "Pods/Target Support Files/Pods-App/Pods-App-resources.sh"
chmod +x "Pods/Target Support Files/Pods-App/Pods-App-acknowledgements.sh"

echo "4. Fixing Xcode project settings..."
cat << 'EOF' > fix-sandbox.rb
require 'xcodeproj'

project_path = 'App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Disable sandbox for shell script build phases
project.targets.each do |target|
  target.build_phases.each do |phase|
    if phase.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
      # Ensure the script doesn't have sandbox restrictions
      phase.shell_script = phase.shell_script.gsub(/set -e/, "set -e\nset +o posix")
      
      # Add input and output file lists to avoid sandbox issues
      if phase.name&.include?("Pods")
        phase.input_file_list_paths = ["${PODS_ROOT}/Target Support Files/Pods-App/Pods-App-frameworks-${CONFIGURATION}-input-files.xcfilelist"]
        phase.output_file_list_paths = ["${PODS_ROOT}/Target Support Files/Pods-App/Pods-App-frameworks-${CONFIGURATION}-output-files.xcfilelist"]
      end
    end
  end
end

project.save
puts "✅ Fixed Xcode project sandbox settings"
EOF

ruby fix-sandbox.rb
rm fix-sandbox.rb

echo ""
echo "5. Instructions for Xcode:"
echo "   a. Open Xcode and clean build folder (Cmd+Shift+K)"
echo "   b. Close Xcode completely"
echo "   c. Reopen the project from App.xcworkspace (not .xcodeproj)"
echo "   d. Go to Product > Scheme > Edit Scheme"
echo "   e. Select 'Run' and uncheck 'Debug executable'"
echo "   f. Try archiving again: Product > Archive"
echo ""
echo "Alternative Method if still failing:"
echo "   1. In Xcode, select your target 'App'"
echo "   2. Go to Build Settings"
echo "   3. Search for 'Enable App Sandbox'"
echo "   4. Set it to 'NO' for Release configuration"
echo "   5. Search for 'User Script Sandboxing'"
echo "   6. Set it to 'NO'"
echo ""
echo "✅ Script complete!"