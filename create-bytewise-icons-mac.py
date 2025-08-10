#!/usr/bin/env python3
"""
ByteWise Nutritionist Icon Generator for Mac
Run this directly on your Mac to create all needed icons
"""

from PIL import Image, ImageDraw, ImageFont
import os
import json

def create_bytewise_icon(size):
    """Create a ByteWise branded icon with yellow background and BW text"""
    # Create image with ByteWise yellow background
    img = Image.new('RGBA', (size, size), '#faed39')
    draw = ImageDraw.Draw(img)
    
    # Try to use a good font, fallback to default if not available
    font_size = int(size * 0.35)
    try:
        # Try system fonts
        for font_path in [
            '/System/Library/Fonts/Helvetica.ttc',
            '/Library/Fonts/Arial.ttf',
            '/System/Library/Fonts/Avenir.ttc'
        ]:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
                break
        else:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Draw "BW" text in ByteWise blue
    text = "BW"
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - bbox[1]
    
    # Draw text in ByteWise blue
    draw.text((x, y), text, fill='#1f4aa6', font=font)
    
    return img

# Get the path to the Assets folder
home = os.path.expanduser("~")
assets_path = os.path.join(
    home, 
    "Library/Mobile Documents/com~apple~CloudDocs/Downloads/Bytewise-Nutritionist",
    "ios/App/App/Assets.xcassets/AppIcon.appiconset"
)

# Create directory if it doesn't exist
os.makedirs(assets_path, exist_ok=True)

print("Creating ByteWise branded icons...")
print(f"Output path: {assets_path}")

# Define all required icon sizes
icon_configs = [
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
    ("AppIcon-512@2x.png", 1024),
]

# Generate all icons
for filename, size in icon_configs:
    icon = create_bytewise_icon(size)
    output_path = os.path.join(assets_path, filename)
    icon.save(output_path, "PNG")
    print(f"✅ Created {filename} ({size}x{size})")

# Create Contents.json
contents = {
    "images": [
        {"size": "20x20", "idiom": "iphone", "filename": "AppIcon-20@2x.png", "scale": "2x"},
        {"size": "20x20", "idiom": "iphone", "filename": "AppIcon-20@3x.png", "scale": "3x"},
        {"size": "29x29", "idiom": "iphone", "filename": "AppIcon-29@2x.png", "scale": "2x"},
        {"size": "29x29", "idiom": "iphone", "filename": "AppIcon-29@3x.png", "scale": "3x"},
        {"size": "40x40", "idiom": "iphone", "filename": "AppIcon-40@2x.png", "scale": "2x"},
        {"size": "40x40", "idiom": "iphone", "filename": "AppIcon-40@3x.png", "scale": "3x"},
        {"size": "60x60", "idiom": "iphone", "filename": "AppIcon-60@2x.png", "scale": "2x"},
        {"size": "60x60", "idiom": "iphone", "filename": "AppIcon-60@3x.png", "scale": "3x"},
        {"size": "20x20", "idiom": "ipad", "filename": "AppIcon-20.png", "scale": "1x"},
        {"size": "20x20", "idiom": "ipad", "scale": "2x"},
        {"size": "29x29", "idiom": "ipad", "filename": "AppIcon-29.png", "scale": "1x"},
        {"size": "29x29", "idiom": "ipad", "scale": "2x"},
        {"size": "40x40", "idiom": "ipad", "filename": "AppIcon-40.png", "scale": "1x"},
        {"size": "40x40", "idiom": "ipad", "scale": "2x"},
        {"size": "76x76", "idiom": "ipad", "filename": "AppIcon-76.png", "scale": "1x"},
        {"size": "76x76", "idiom": "ipad", "filename": "AppIcon-76@2x.png", "scale": "2x"},
        {"size": "83.5x83.5", "idiom": "ipad", "filename": "AppIcon-83.5@2x.png", "scale": "2x"},
        {"size": "1024x1024", "idiom": "ios-marketing", "filename": "AppIcon-512@2x.png", "scale": "1x"}
    ],
    "info": {"version": 1, "author": "xcode"}
}

contents_path = os.path.join(assets_path, "Contents.json")
with open(contents_path, 'w') as f:
    json.dump(contents, f, indent=2)
print(f"✅ Created Contents.json")

print("\n🎉 All ByteWise icons created successfully!")
print(f"\nVerifying: {len(icon_configs)} PNG files created")
os.system(f'ls "{assets_path}"/*.png | wc -l')
print("\nNow open Xcode and build your project!")