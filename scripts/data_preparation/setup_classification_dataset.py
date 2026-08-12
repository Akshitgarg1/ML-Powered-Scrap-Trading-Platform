# scripts/setup_classification_dataset.py
"""
Setup classification dataset structure for fake logo detection and populate genuine logos from reference_logos
"""

import os
import shutil
from pathlib import Path

# Setup paths relative to script directory
BASE_DIR = Path(__file__).resolve().parents[2]
classification_base_dir = BASE_DIR / 'data' / 'logo_dataset' / 'classification'
reference_logo_dir = BASE_DIR / 'server' / 'ml_services' / 'logo_verifier' / 'reference_logos'

def setup_classification_structure():
    """Create the folder structure for classification dataset and copy genuine files"""
    
    brands = ['apple', 'samsung', 'nike', 'adidas', 'puma']
    
    print("📁 Setting up classification dataset structure...")
    
    for brand in brands:
        genuine_dir = classification_base_dir / brand / 'genuine'
        fake_dir = classification_base_dir / brand / 'fake'
        
        os.makedirs(genuine_dir, exist_ok=True)
        os.makedirs(fake_dir, exist_ok=True)
        print(f"✅ Created: {brand}/genuine/ and {brand}/fake/")

        # Automatically copy reference logos as genuine logos
        ref_brand_dir = reference_logo_dir / brand
        if ref_brand_dir.exists():
            copied_count = 0
            for filename in os.listdir(ref_brand_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    src_file = ref_brand_dir / filename
                    dest_file = genuine_dir / filename
                    shutil.copy2(src_file, dest_file)
                    copied_count += 1
            if copied_count > 0:
                print(f"   ➕ Copied {copied_count} reference logos to {brand}/genuine/")
            else:
                print(f"   ⚠️ No reference logos found to copy in {ref_brand_dir}")
        else:
            print(f"   ⚠️ Reference logo directory {ref_brand_dir} does not exist. Run generate_reference_logos.py first.")

    print(f"\n🎯 Dataset structure ready at: {classification_base_dir}")

if __name__ == "__main__":
    setup_classification_structure()