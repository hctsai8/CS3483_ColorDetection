"""
Demo Script for Color Detection System
Tests the color detection functionality and demonstrates features
"""

import cv2
import numpy as np
from color_utils import ColorUtils, ColorPalette

def create_test_image():
    """
    Create a test image with various colors for testing
    """
    # Create a 600x800 image with different colored sections
    test_image = np.zeros((600, 800, 3), dtype=np.uint8)
    
    # Define colors and their positions
    colors = [
        ((255, 0, 0), (0, 0, 200, 150)),      # Red
        ((0, 255, 0), (200, 0, 200, 150)),    # Green
        ((0, 0, 255), (400, 0, 200, 150)),    # Blue
        ((255, 255, 0), (600, 0, 200, 150)),  # Yellow
        ((255, 0, 255), (0, 150, 200, 150)),  # Magenta
        ((0, 255, 255), (200, 150, 200, 150)), # Cyan
        ((128, 0, 128), (400, 150, 200, 150)), # Purple
        ((255, 165, 0), (600, 150, 200, 150)), # Orange
        ((255, 192, 203), (0, 300, 200, 150)), # Pink
        ((165, 42, 42), (200, 300, 200, 150)), # Brown
        ((128, 128, 128), (400, 300, 200, 150)), # Gray
        ((0, 0, 0), (600, 300, 200, 150)),    # Black
        ((255, 255, 255), (0, 450, 200, 150)), # White
        ((0, 128, 0), (200, 450, 200, 150)),  # Dark Green
        ((139, 69, 19), (400, 450, 200, 150)), # Saddle Brown
        ((75, 0, 130), (600, 450, 200, 150)), # Indigo
    ]
    
    # Fill the image with colors
    for (b, g, r), (x, y, w, h) in colors:
        test_image[y:y+h, x:x+w] = (b, g, r)  # BGR format for OpenCV
        
        # Add color name text
        color_name = ColorUtils.get_color_name((r, g, b))
        text_color = ColorUtils.get_contrast_color((r, g, b))
        cv2.putText(test_image, color_name, (x + 10, y + 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, 
                   (text_color[2], text_color[1], text_color[0]), 2)
        
        # Add RGB values
        cv2.putText(test_image, f"RGB: ({r},{g},{b})", (x + 10, y + 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, 
                   (text_color[2], text_color[1], text_color[0]), 1)
        
        # Add HEX code
        hex_code = ColorUtils.rgb_to_hex((r, g, b))
        cv2.putText(test_image, hex_code, (x + 10, y + 90), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, 
                   (text_color[2], text_color[1], text_color[0]), 1)
    
    return test_image

def demo_color_utilities():
    """
    Demonstrate color utility functions
    """
    print("=== Color Utilities Demo ===\n")
    
    # Test color
    test_color = (255, 100, 50)  # RGB
    print(f"Test Color RGB: {test_color}")
    
    # Conversions
    hex_color = ColorUtils.rgb_to_hex(test_color)
    hsv_color = ColorUtils.rgb_to_hsv(test_color)
    hsl_color = ColorUtils.rgb_to_hsl(test_color)
    color_name = ColorUtils.get_color_name(test_color)
    
    print(f"HEX: {hex_color}")
    print(f"HSV: {hsv_color}")
    print(f"HSL: {hsl_color}")
    print(f"Color Name: {color_name}")
    
    # Complementary color
    complement = ColorUtils.get_complementary_color(test_color)
    print(f"Complementary Color: {complement}")
    
    # Color analysis
    is_light = ColorUtils.is_light_color(test_color)
    contrast_color = ColorUtils.get_contrast_color(test_color)
    print(f"Is Light Color: {is_light}")
    print(f"Best Contrast Color: {contrast_color}")
    
    # Color palettes
    print("\n=== Color Palettes ===")
    palettes = ["monochromatic", "analogous", "triadic", "complementary"]
    
    for scheme in palettes:
        palette = ColorUtils.get_color_palette(test_color, scheme)
        print(f"\n{scheme.capitalize()} Palette:")
        for i, color in enumerate(palette):
            print(f"  Color {i+1}: {color} - {ColorUtils.get_color_name(color)}")

def demo_color_palette_manager():
    """
    Demonstrate ColorPalette class functionality
    """
    print("\n=== Color Palette Manager Demo ===\n")
    
    # Create a new palette
    palette = ColorPalette()
    
    # Add some colors
    colors_to_add = [
        ((255, 0, 0), "Custom Red"),
        ((0, 255, 0), "Custom Green"),
        ((0, 0, 255), "Custom Blue"),
        ((255, 255, 0), None),  # Will use automatic naming
    ]
    
    for color_info in colors_to_add:
        if color_info[1]:
            palette.add_color(color_info[0], color_info[1])
        else:
            palette.add_color(color_info[0])
    
    # Display palette information
    palette_info = palette.get_palette_info()
    print("Current Palette:")
    for i, color in enumerate(palette_info, 1):
        print(f"Color {i}: {color['name']}")
        print(f"  RGB: {color['rgb']}")
        print(f"  HEX: {color['hex']}")
        print(f"  HSV: {color['hsv']}")
        print(f"  HSL: {color['hsl']}")
        print()
    
    # Save palette
    palette.save_palette("demo_palette.txt")
    print("Palette saved to 'demo_palette.txt'")

def interactive_color_test():
    """
    Interactive test using the test image
    """
    print("\n=== Interactive Color Test ===")
    print("Click on different colored sections to test color detection")
    print("Press 'q' to quit")
    
    # Create test image
    test_image = create_test_image()
    
    def mouse_callback(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            # Get color at clicked position (BGR to RGB)
            bgr_color = test_image[y, x]
            rgb_color = (int(bgr_color[2]), int(bgr_color[1]), int(bgr_color[0]))
            
            # Analyze color
            color_name = ColorUtils.get_color_name(rgb_color)
            hex_code = ColorUtils.rgb_to_hex(rgb_color)
            hsv_color = ColorUtils.rgb_to_hsv(rgb_color)
            
            print(f"\nClicked at ({x}, {y})")
            print(f"Color: {color_name}")
            print(f"RGB: {rgb_color}")
            print(f"HEX: {hex_code}")
            print(f"HSV: {hsv_color}")
            
            # Draw circle at clicked position
            cv2.circle(test_image, (x, y), 10, (255, 255, 255), 2)
            cv2.circle(test_image, (x, y), 2, (0, 0, 0), -1)
    
    # Set up window and mouse callback
    cv2.namedWindow('Color Test Image')
    cv2.setMouseCallback('Color Test Image', mouse_callback)
    
    while True:
        cv2.imshow('Color Test Image', test_image)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):  # Reset image
            test_image = create_test_image()
    
    cv2.destroyAllWindows()

def main():
    """
    Main demo function
    """
    print("Color Detection System Demo")
    print("=" * 40)
    
    try:
        # Demonstrate color utilities
        demo_color_utilities()
        
        # Demonstrate palette manager
        demo_color_palette_manager()
        
        # Interactive test
        interactive_color_test()
        
    except Exception as e:
        print(f"Demo error: {e}")
        print("Make sure OpenCV is properly installed.")

if __name__ == "__main__":
    main()