#!/usr/bin/env bash

count=1

for file in *; do
  [[ -f "$file" ]] || continue

  case "${file,,}" in
  *.jpg | *.jpeg | *.png | *.gif | *.webp | *.bmp | *.tiff | *.avif)
    ext="${file##*.}"
    mv -- "$file" "${count}.${ext}"
    ((count++))
    ;;
  esac
done
