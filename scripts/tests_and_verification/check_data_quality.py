import pandas as pd
import os
import sys
from pathlib import Path

def check_csv_quality():
    print("--- DATASET QUALITY CHECK ---")
    BASE_DIR = Path(__file__).resolve().parents[2]
    datasets = {
        "Price": BASE_DIR / 'data' / 'raw' / 'price_prediction' / 'product_data.csv',
        "Logo": BASE_DIR / 'data' / 'logo_dataset' / 'classification'
    }
    
    for name, path in datasets.items():
        path = Path(path)
        if not path.exists():
            print(f"[MISSING] {name} Dataset at {path}")
            continue
            
        try:
            if path.is_file():
                df = pd.read_csv(path)
                print(f"[OK] {name} Dataset: {len(df)} rows, Columns: {list(df.columns)}")
                null_count = df.isnull().sum().sum()
                if null_count > 0:
                    print(f"    [WARNING] Found {null_count} missing values.")
                else:
                    print(f"    [INFO] No missing values found.")
            else:
                # Logo directory
                total_files = sum(len(files) for _, _, files in os.walk(path))
                print(f"[OK] {name} Dataset Directory: {total_files} total files at {path}")
                
        except Exception as e:
            print(f"[ERROR] Loading {name} dataset: {e}")

if __name__ == "__main__":
    check_csv_quality()

