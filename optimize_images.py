
import os
from PIL import Image

# Directory containing images
IMAGE_DIR = r"a:\Main portfolio fol\portfolio\photos"

# Supported extensions
EXTENSIONS = ('.jpg', '.jpeg', '.png')

def convert_to_webp(directory):
    print(f"Scanning {directory}...")
    for filename in os.listdir(directory):
        if filename.lower().endswith(EXTENSIONS):
            filepath = os.path.join(directory, filename)
            filename_no_ext = os.path.splitext(filename)[0]
            webp_path = os.path.join(directory, f"{filename_no_ext}.webp")
            
            # Skip if webp already exists (optional, but good for idempotency)
            # if os.path.exists(webp_path):
            #     print(f"Skipping {filename}, WebP exists.")
            #     continue

            try:
                with Image.open(filepath) as img:
                    # Resize if too large (e.g. > 1920px width) to further save space
                    if img.width > 1920:
                        ratio = 1920 / img.width
                        new_height = int(img.height * ratio)
                        img = img.resize((1920, new_height), Image.Resampling.LANCZOS)
                        print(f"Resized {filename} to 1920px width.")

                    # Save as WebP
                    img.save(webp_path, 'webp', quality=80, optimize=True)
                    
                    old_size = os.path.getsize(filepath)
                    new_size = os.path.getsize(webp_path)
                    savings = (old_size - new_size) / old_size * 100
                    
                    print(f"Converted {filename}: {old_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({savings:.1f}% saved)")
            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

if __name__ == "__main__":
    convert_to_webp(IMAGE_DIR)
