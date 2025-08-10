#!/usr/bin/env python3
"""
Generate all required icon sizes for ByteWise Nutritionist PWA
"""

from PIL import Image
import os

# Source image
source_image = "public/icon-original.png"
output_dir = "public/icons"

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Open the source image
img = Image.open(source_image)

# Convert to RGBA if not already
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Icon sizes needed for PWA and various platforms
icon_sizes = [
    # Favicons
    (16, "favicon-16x16.png"),
    (32, "favicon-32x32.png"),
    (48, "icon-48x48.png"),
    
    # PWA icons
    (72, "icon-72x72.png"),
    (96, "icon-96x96.png"),
    (128, "icon-128x128.png"),
    (144, "icon-144x144.png"),
    (152, "icon-152x152.png"),
    (192, "icon-192x192.png"),
    (384, "icon-384x384.png"),
    (512, "icon-512x512.png"),
    
    # Apple Touch Icons
    (57, "apple-touch-icon-57x57.png"),
    (60, "apple-touch-icon-60x60.png"),
    (72, "apple-touch-icon-72x72.png"),
    (76, "apple-touch-icon-76x76.png"),
    (114, "apple-touch-icon-114x114.png"),
    (120, "apple-touch-icon-120x120.png"),
    (144, "apple-touch-icon-144x144.png"),
    (152, "apple-touch-icon-152x152.png"),
    (180, "apple-touch-icon-180x180.png"),
    
    # Android Chrome icons
    (192, "android-chrome-192x192.png"),
    (512, "android-chrome-512x512.png"),
    
    # Microsoft Tile
    (144, "mstile-144x144.png"),
    (150, "mstile-150x150.png"),
    (310, "mstile-310x310.png"),
]

# Generate all icon sizes
for size, filename in icon_sizes:
    # Create a resized version maintaining aspect ratio
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save the resized image
    output_path = os.path.join(output_dir, filename)
    resized.save(output_path, "PNG", optimize=True)
    print(f"Generated: {output_path} ({size}x{size})")

# Also copy original as icon-512.png in root for backward compatibility
img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save("public/icon-512.png", "PNG", optimize=True)
print("Generated: public/icon-512.png (512x512)")

# Generate icon-192.png in root for backward compatibility
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save("public/icon-192.png", "PNG", optimize=True)
print("Generated: public/icon-192.png (192x192)")

print("\n✅ All app icons generated successfully!")
print("📱 Icons are ready for PWA, iOS, Android, and web use")