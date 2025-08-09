#!/usr/bin/env python3
"""
Generate iOS app icons from ByteWise Nutritionist logo
Works on macOS without additional dependencies
"""

import os
import subprocess
import sys

def generate_icon(source, size, output):
    """Generate a single icon using sips (built into macOS)"""
    cmd = [
        'sips', '-z', str(size), str(size), 
        source, '--out', output
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Generated: {output} ({size}x{size})")
        else:
            print(f"❌ Failed: {output} - {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    return True

def main():
    # Define the source and all required icon sizes
    icons_dir = "ios/App/App/Assets.xcassets/AppIcon.appiconset"
    source_file = os.path.join(icons_dir, "AppIcon-512@2x.png")
    
    # Check if source exists
    if not os.path.exists(source_file):
        print(f"❌ Source file not found: {source_file}")
        print("Make sure you're running this from your project root directory")
        sys.exit(1)
    
    print("🎨 Generating iOS icons from ByteWise Nutritionist logo...")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"📱 Source: {source_file}")
    print("")
    
    # Define all required icon sizes
    icons = [
        # iPhone icons
        (40, "AppIcon-20@2x.png"),
        (60, "AppIcon-20@3x.png"),
        (58, "AppIcon-29@2x.png"),
        (87, "AppIcon-29@3x.png"),
        (80, "AppIcon-40@2x.png"),
        (120, "AppIcon-40@3x.png"),
        (120, "AppIcon-60@2x.png"),
        (180, "AppIcon-60@3x.png"),
        # iPad icons
        (20, "AppIcon-20.png"),
        (29, "AppIcon-29.png"),
        (40, "AppIcon-40.png"),
        (76, "AppIcon-76.png"),
        (152, "AppIcon-76@2x.png"),
        (167, "AppIcon-83.5@2x.png"),
    ]
    
    success_count = 0
    for size, filename in icons:
        output_path = os.path.join(icons_dir, filename)
        if generate_icon(source_file, size, output_path):
            success_count += 1
    
    print("")
    print(f"✨ Generated {success_count}/{len(icons)} icons successfully!")
    
    if success_count == len(icons):
        print("")
        print("📋 Next steps:")
        print("1. In Xcode: Clean Build Folder (Shift+Cmd+K)")
        print("2. Build again (Cmd+B)")
        print("")
        print("Your ByteWise branded icons are ready! 🚀")
    else:
        print("")
        print("⚠️  Some icons failed to generate.")
        print("Try running: python3 generate-ios-icons.py")

if __name__ == "__main__":
    main()