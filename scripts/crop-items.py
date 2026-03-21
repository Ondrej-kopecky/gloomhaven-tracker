"""
Auto-crop item card photos.
Finds the card (brown rectangle on white/light background),
crops to it, and saves to output folder.
"""
import cv2
import numpy as np
import os
import sys

INPUT_DIR = "C:/Web-haven/gloomhaven/fotky-predmety"
OUTPUT_DIR = "C:/Web-haven/gloomhaven/public/img/items"

os.makedirs(OUTPUT_DIR, exist_ok=True)

files = sorted(
    [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))],
    key=lambda x: int(os.path.splitext(x)[0]) if os.path.splitext(x)[0].isdigit() else 0
)

print(f"Found {len(files)} images to process")

success = 0
failed = []

for fname in files:
    path = os.path.join(INPUT_DIR, fname)
    img = cv2.imread(path)
    if img is None:
        failed.append(fname)
        continue

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Threshold: card is darker than white background
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        # Fallback: just save as-is with minor crop
        failed.append(fname)
        continue

    # Find largest contour (the card)
    largest = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest)
    img_area = img.shape[0] * img.shape[1]

    # Card should be at least 10% of image
    if area < img_area * 0.1:
        failed.append(fname)
        continue

    # Get bounding rect
    x, y, w, h = cv2.boundingRect(largest)

    # Add small padding (2px)
    pad = 2
    x = max(0, x - pad)
    y = max(0, y - pad)
    w = min(img.shape[1] - x, w + 2 * pad)
    h = min(img.shape[0] - y, h + 2 * pad)

    # Crop
    cropped = img[y:y+h, x:x+w]

    # Get item number from filename
    item_id = os.path.splitext(fname)[0]

    # Save as JPG with good quality
    out_name = f"{item_id}.jpg"
    out_path = os.path.join(OUTPUT_DIR, out_name)
    cv2.imwrite(out_path, cropped, [cv2.IMWRITE_JPEG_QUALITY, 85])

    success += 1
    if success % 20 == 0:
        print(f"  Processed {success}...")

print(f"\nDone! {success} cropped, {len(failed)} failed")
if failed:
    print(f"Failed: {', '.join(failed)}")
