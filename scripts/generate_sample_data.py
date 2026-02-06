# scripts/generate_sample_data.py
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

def generate_sample_data(n_samples=1000):
    """Generate realistic sample product data"""
    
    categories = {
        'Laptop': {
            'brands': ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'],
            'base_price_range': (30000, 150000)
        },
        'Mobile': {
            'brands': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo'],
            'base_price_range': (8000, 100000)
        },
        'Furniture': {
            'brands': ['IKEA', 'Godrej', 'Durian', 'Urban Ladder', 'Pepperfry', 'Generic'],
            'base_price_range': (3000, 50000)
        },
        'Bike': {
            'brands': ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha'],
            'base_price_range': (30000, 200000)
        },
        'Camera': {
            'brands': ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
            'base_price_range': (15000, 150000)
        }
    }
    
    conditions = ['Excellent', 'Good', 'Fair', 'Poor']
    condition_multipliers = {
        'Excellent': 0.85,
        'Good': 0.65,
        'Fair': 0.45,
        'Poor': 0.25
    }
    
    products = []
    
    for i in range(n_samples):
        category = random.choice(list(categories.keys()))
        brand = random.choice(categories[category]['brands'])
        
        min_price, max_price = categories[category]['base_price_range']
        original_price = random.randint(min_price, max_price)
        
        age_years = round(random.uniform(0, 5), 2)
        condition = random.choice(conditions)
        
        age_depreciation = max(0.3, 1 - (age_years * 0.15))
        condition_multiplier = condition_multipliers[condition]
        
        resale_price = int(original_price * condition_multiplier * age_depreciation)
        noise = random.uniform(-0.1, 0.1)
        resale_price = int(resale_price * (1 + noise))
        
        if category in ['Laptop', 'Mobile', 'Camera']:
            usage_hours = int(age_years * 365 * random.uniform(2, 8))
        else:
            usage_hours = 0
        
        product = {
            'product_id': f'PROD_{i+1:05d}',
            'category': category,
            'brand': brand,
            'original_price': original_price,
            'age_years': age_years,
            'condition': condition,
            'usage_hours': usage_hours,
            'resale_price': resale_price,
            'location': random.choice(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Pune']),
            'has_warranty': random.choice([True, False]),
            'has_box': random.choice([True, False]),
            'created_at': (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
        }
        
        products.append(product)
    
    df = pd.DataFrame(products)
    
    # Create directory if it doesn't exist
    os.makedirs('data/raw', exist_ok=True)
    
    # Save to CSV
    df.to_csv('data/raw/product_data.csv', index=False)
    
    print(f"✅ Generated {n_samples} sample products")
    print(f"✅ Data saved to: data/raw/product_data.csv")
    print(f"\n📊 Dataset Preview:")
    print(df.head(10))
    print(f"\n📈 Statistics:")
    print(df.describe())
    
    return df

if __name__ == "__main__":
    generate_sample_data(n_samples=1000)