#!/usr/bin/env python3
"""
Fetch Google Places images for all bars in bars_full.json
"""
import json
import requests
import time

API_KEY = "AIzaSyC0p7Cf7TRj-9ST8JcDYt0NmozNbR-hmd8"  # Replace with your new API key
PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PHOTO_API_URL = "https://maps.googleapis.com/maps/api/place/photo"

def fetch_bar_image(bar_name, lat, lon):
    """Fetch image URL for a bar using Google Places API"""
    try:
        # Search for the bar
        search_params = {
            'query': f"{bar_name} bar San Francisco CA",
            'key': API_KEY,
            'location': f"{lat},{lon}",
            'radius': 100  # Search within 100m
        }

        response = requests.get(PLACES_API_URL, params=search_params)
        results = response.json()

        if results['results']:
            place = results['results'][0]
            if 'photos' in place and place['photos']:
                photo_ref = place['photos'][0]['photo_reference']
                # Build photo URL
                photo_url = f"{PHOTO_API_URL}?maxwidth=400&photoreference={photo_ref}&key={API_KEY}"
                return photo_url
    except Exception as e:
        print(f"Error fetching image for {bar_name}: {e}")

    return None

def main():
    # Load bars data
    with open('data/bars_full.json', 'r') as f:
        data = json.load(f)

    bars = data if isinstance(data, list) else data.get('bars', [])

    print(f"Fetching images for {len(bars)} bars...")

    updated_count = 0
    for i, bar in enumerate(bars):
        if i % 10 == 0:
            print(f"Progress: {i}/{len(bars)}")

        # Skip if already has image
        if 'imageUrl' in bar and bar['imageUrl']:
            continue

        image_url = fetch_bar_image(bar['name'], bar['lat'], bar['lon'])
        if image_url:
            bar['imageUrl'] = image_url
            updated_count += 1

        # Rate limiting - be nice to the API
        time.sleep(0.5)

    # Save updated data
    output = {'bars': bars} if not isinstance(data, list) else bars
    with open('data/bars_full.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nDone! Updated {updated_count} bars with images")

if __name__ == '__main__':
    main()
