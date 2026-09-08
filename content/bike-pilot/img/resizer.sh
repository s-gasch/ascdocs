#!/bin/bash

INPUT="icon.png"
OUTPUT_DIR="icons"

mkdir -p "$OUTPUT_DIR"

# Favicon
sips -z 16 16   "$INPUT" --out "$OUTPUT_DIR/favicon-16x16.png"
sips -z 32 32   "$INPUT" --out "$OUTPUT_DIR/favicon-32x32.png"
sips -z 48 48   "$INPUT" --out "$OUTPUT_DIR/favicon-48x48.png"

# Apple
sips -z 180 180 "$INPUT" --out "$OUTPUT_DIR/apple-touch-icon.png"

# Android / PWA
sips -z 192 192 "$INPUT" --out "$OUTPUT_DIR/android-chrome-192x192.png"
sips -z 512 512 "$INPUT" --out "$OUTPUT_DIR/android-chrome-512x512.png"

magick \
  "$OUTPUT_DIR/favicon-16x16.png" \
  "$OUTPUT_DIR/favicon-32x32.png" \
  "$OUTPUT_DIR/favicon-48x48.png" \
  "$OUTPUT_DIR/favicon.ico"
  
echo "Done! Icons generated in: $OUTPUT_DIR"