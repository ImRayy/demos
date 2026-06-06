#!/bin/bash

# Script to rename image files in the current directory sequentially
# Usage: ./sh/renumber_images.sh [START_NUMBER]
# Default: START_NUMBER=1

# Set default start number
START_NUMBER=${1:-1}

# Find all image files (supports .jpg, .jpeg, .png, .gif, .webp, .bmp, .tiff, .svg)
find . -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" -o -name "*.bmp" -o -name "*.tiff" -o -name "*.svg" \) | while read file; do
    # Get original filename without extension
    basename_no_ext=$(basename "$file")
    # Generate new filename with sequential number
    new_number=$((START_NUMBER + $RANDOM % 1000))  # Random offset for uniqueness
    new_filename="Image_$new_number.$basename_no_ext"
    # Create output filename in the same directory
    output_file="${file%.jpg|.jpeg|.png|.gif|.webp|.bmp|.tiff|.svg}"
    # Rename file
    mv "$file" "$output_file"
done

echo "Renaming complete. Processed $((find . -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" -o -name "*.bmp" -o -name "*.tiff" -o -name "*.svg" \) | wc -l)) images."
