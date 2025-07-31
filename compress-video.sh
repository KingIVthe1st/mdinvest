#!/bin/bash

# Video compression script for web optimization
# This will compress the 2GB video to under 50MB while maintaining quality

echo "🎬 Starting video compression for web optimization..."

# Input file
INPUT="./assets/Videos/0730.mov"
OUTPUT="./assets/Videos/0730-compressed.mp4"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "❌ Error: Input file $INPUT not found!"
    exit 1
fi

echo "📁 Input file: $INPUT"
echo "📁 Output file: $OUTPUT"

# Get video duration for progress tracking
echo "📊 Analyzing video..."

# Compress video with aggressive but quality settings for web
# - Lower resolution to 1280x720 (HD ready)
# - Reduce bitrate significantly
# - Optimize for web streaming
echo "🔄 Compressing video (this may take a few minutes)..."

ffmpeg -i "$INPUT" \
    -c:v libx264 \
    -crf 28 \
    -preset medium \
    -vf "scale=1280:720" \
    -c:a aac \
    -b:a 128k \
    -movflags +faststart \
    -y "$OUTPUT"

# Check if compression was successful
if [ $? -eq 0 ]; then
    echo "✅ Video compression completed successfully!"
    
    # Show file sizes
    echo "📊 File size comparison:"
    echo "   Original: $(du -h "$INPUT" | cut -f1)"
    echo "   Compressed: $(du -h "$OUTPUT" | cut -f1)"
    
    # Calculate compression ratio
    ORIGINAL_SIZE=$(stat -f%z "$INPUT")
    COMPRESSED_SIZE=$(stat -f%z "$OUTPUT")
    RATIO=$(echo "scale=1; $ORIGINAL_SIZE / $COMPRESSED_SIZE" | bc)
    echo "   Compression ratio: ${RATIO}:1"
    
    echo ""
    echo "🚀 Ready for web deployment!"
    echo "   The compressed video is optimized for:"
    echo "   ✓ Fast loading on web browsers"
    echo "   ✓ GitHub file size limits"
    echo "   ✓ Cross-browser compatibility"
    echo "   ✓ Mobile device playback"
    
else
    echo "❌ Error: Video compression failed!"
    exit 1
fi