#!/usr/bin/env python3
"""
Generate iOS App Icons for ByteWise Nutritionist
Creates yellow background icons with BW text
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Create the base directory path
base_dir = "ios/App/App/Assets.xcassets/AppIcon.appiconset"

# Define all required icon sizes
icon_sizes = [
    ("AppIcon-20.png", 20),
    ("AppIcon-20@2x.png", 40),
    ("AppIcon-20@3x.png", 60),
    ("AppIcon-29.png", 29),
    ("AppIcon-29@2x.png", 58),
    ("AppIcon-29@3x.png", 87),
    ("AppIcon-40.png", 40),
    ("AppIcon-40@2x.png", 80),
    ("AppIcon-40@3x.png", 120),
    ("AppIcon-60@2x.png", 120),
    ("AppIcon-60@3x.png", 180),
    ("AppIcon-76.png", 76),
    ("AppIcon-76@2x.png", 152),
    ("AppIcon-83.5@2x.png", 167),
    ("AppIcon-512@2x.png", 1024)
]

def create_icon(size):
    """Create an icon with ByteWise branding"""
    # Create a new image with ByteWise yellow background
    img = Image.new('RGB', (size, size), color='#faed39')
    draw = ImageDraw.Draw(img)
    
    # Add "BW" text in blue
    text = "BW"
    
    # Try to use a font, fallback to default if not available
    try:
        # Attempt to use a bold font
        font_size = int(size * 0.4)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Use default font if system font not available
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2)
    
    # Draw the text in ByteWise blue
    draw.text(position, text, fill='#1f4aa6', font=font)
    
    return img

def main():
    print("🎨 Generating ByteWise Nutritionist iOS Icons...")
    
    # Ensure the directory exists
    os.makedirs(base_dir, exist_ok=True)
    
    # Generate each icon
    for filename, size in icon_sizes:
        filepath = os.path.join(base_dir, filename)
        icon = create_icon(size)
        icon.save(filepath, "PNG")
        print(f"✓ Generated {filename} ({size}x{size})")
    
    print("\n✅ All icons generated successfully!")
    print("\nNext steps:")
    print("1. In Xcode: Product → Clean Build Folder (Shift+Cmd+K)")
    print("2. Product → Build (Cmd+B)")

if __name__ == "__main__":
    main()