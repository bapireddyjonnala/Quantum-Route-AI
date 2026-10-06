import os
import json
from typing import Dict, Any, Optional
from models import ShopLocation

SHOP_FILE = os.path.join(os.path.dirname(__file__), "shop.json")

# Default initial shop configuration
DEFAULT_SHOP = {
    "shop_name": "Vijayawada Central Warehouse",
    "address": "MG Road, Vijayawada, Andhra Pradesh",
    "latitude": 16.5062,
    "longitude": 80.6480
}

_current_shop: Optional[Dict[str, Any]] = None

def load_shop_location() -> Optional[Dict[str, Any]]:
    global _current_shop
    if os.path.exists(SHOP_FILE):
        try:
            with open(SHOP_FILE, "r", encoding="utf-8") as f:
                _current_shop = json.load(f)
                return _current_shop
        except Exception as e:
            print(f"Error loading shop.json: {e}")
    
    # Initialize with default if file doesn't exist
    _current_shop = dict(DEFAULT_SHOP)
    save_shop_location(_current_shop)
    return _current_shop

def save_shop_location(shop_data: Dict[str, Any]) -> Dict[str, Any]:
    global _current_shop
    _current_shop = shop_data
    try:
        with open(SHOP_FILE, "w", encoding="utf-8") as f:
            json.dump(shop_data, f, indent=2)
    except Exception as e:
        print(f"Error saving shop.json: {e}")
    return _current_shop

def get_shop_location() -> Optional[Dict[str, Any]]:
    global _current_shop
    if _current_shop is None:
        return load_shop_location()
    return _current_shop

def update_shop_location(shop_data: ShopLocation) -> Dict[str, Any]:
    data_dict = shop_data.model_dump()
    return save_shop_location(data_dict)

# Load on startup
load_shop_location()
