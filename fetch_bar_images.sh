#!/bin/bash

API_KEY="AIzaSyC0p7Cf7TRj-9ST8JcDYt0NmozNbR-hmd8"
PLACES_API="https://maps.googleapis.com/maps/api/place/textsearch/json"
PHOTO_API="https://maps.googleapis.com/maps/api/place/photo"

echo "Fetching bar images from Google Places API..."

# Create a temporary file for updated JSON
TEMP_FILE=$(mktemp)

# Read bars and fetch images
jq '.bars |= map(
  if .imageUrl then .
  else
    .
  end
)' data/bars_full.json > "$TEMP_FILE"

# Use jq to process each bar
cat data/bars_full.json | jq '.bars[] | {id, name, lat, lon}' | while read -r line; do
  if [ "$line" == "{" ]; then
    bar_json=""
  fi

  bar_json="$bar_json$line"

  if [ "$line" == "}" ]; then
    id=$(echo "$bar_json" | jq -r '.id')
    name=$(echo "$bar_json" | jq -r '.name')
    lat=$(echo "$bar_json" | jq -r '.lat')
    lon=$(echo "$bar_json" | jq -r '.lon')

    # Only fetch if we haven't already
    if ! grep -q "\"id\": $id" data/bars_full.json | grep -q "imageUrl"; then
      # Query Google Places
      response=$(curl -s "$PLACES_API?query=$(echo "$name bar San Francisco" | jq -sRr @uri)&location=$lat,$lon&radius=100&key=$API_KEY")

      photo_ref=$(echo "$response" | jq -r '.results[0].photos[0].photo_reference // empty')

      if [ ! -z "$photo_ref" ]; then
        image_url="$PHOTO_API?maxwidth=400&photoreference=$photo_ref&key=$API_KEY"
        echo "✓ Found image for: $name"
      fi
    fi

    bar_json=""
  fi
done

echo "Done! Run: git add data/bars_full.json && git commit -m 'Add bar images'"
