"""
Color Utilities Module
Contains utility functions for color conversion and analysis
"""

import numpy as np
import webcolors
from typing import Tuple, Dict, List
import colorsys

class ColorUtils:
    """
    Utility class for color operations and conversions
    """
    
    @staticmethod
    def rgb_to_hex(rgb_color: Tuple[int, int, int]) -> str:
        """Convert RGB color to hexadecimal color code"""
        return "#{:02x}{:02x}{:02x}".format(rgb_color[0], rgb_color[1], rgb_color[2])
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
        """Convert hexadecimal color code to RGB"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    @staticmethod
    def rgb_to_hsv(rgb_color: Tuple[int, int, int]) -> Tuple[int, int, int]:
        """Convert RGB to HSV color space"""
        r, g, b = [x/255.0 for x in rgb_color]
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        return (int(h*360), int(s*100), int(v*100))
    
    @staticmethod
    def hsv_to_rgb(hsv_color: Tuple[int, int, int]) -> Tuple[int, int, int]:
        """Convert HSV to RGB color space"""
        h, s, v = hsv_color[0]/360.0, hsv_color[1]/100.0, hsv_color[2]/100.0
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        return (int(r*255), int(g*255), int(b*255))
    
    @staticmethod
    def rgb_to_hsl(rgb_color: Tuple[int, int, int]) -> Tuple[int, int, int]:
        """Convert RGB to HSL color space"""
        r, g, b = [x/255.0 for x in rgb_color]
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        return (int(h*360), int(s*100), int(l*100))
    
    @staticmethod
    def get_color_name(rgb_color: Tuple[int, int, int]) -> str:
        """
        Get the closest color name for an RGB color
        """
        try:
            color_name = webcolors.rgb_to_name(rgb_color)
        except ValueError:
            # Find closest color
            min_colors = {}
            for key, name in webcolors.CSS3_HEX_TO_NAMES.items():
                r_c, g_c, b_c = webcolors.hex_to_rgb(key)
                rd = (r_c - rgb_color[0]) ** 2
                gd = (g_c - rgb_color[1]) ** 2
                bd = (b_c - rgb_color[2]) ** 2
                min_colors[(rd + gd + bd)] = name
            color_name = min_colors[min(min_colors.keys())]
        return color_name
    
    @staticmethod
    def get_complementary_color(rgb_color: Tuple[int, int, int]) -> Tuple[int, int, int]:
        """
        Get the complementary color (opposite on color wheel)
        """
        h, s, v = ColorUtils.rgb_to_hsv(rgb_color)
        complement_h = (h + 180) % 360
        return ColorUtils.hsv_to_rgb((complement_h, s, v))
    
    @staticmethod
    def get_color_palette(base_color: Tuple[int, int, int], scheme: str = "monochromatic") -> List[Tuple[int, int, int]]:
        """
        Generate a color palette based on the base color
        
        Args:
            base_color: RGB tuple of the base color
            scheme: Color scheme type ("monochromatic", "analogous", "triadic", "complementary")
        
        Returns:
            List of RGB color tuples
        """
        h, s, v = ColorUtils.rgb_to_hsv(base_color)
        palette = [base_color]
        
        if scheme == "monochromatic":
            # Vary lightness and saturation
            for i in range(1, 5):
                new_s = max(10, min(100, s + (i * 15)))
                new_v = max(20, min(100, v + (i * 10)))
                palette.append(ColorUtils.hsv_to_rgb((h, new_s, new_v)))
        
        elif scheme == "analogous":
            # Colors adjacent on the color wheel
            for offset in [-30, -15, 15, 30]:
                new_h = (h + offset) % 360
                palette.append(ColorUtils.hsv_to_rgb((new_h, s, v)))
        
        elif scheme == "triadic":
            # Colors evenly spaced on the color wheel
            for offset in [120, 240]:
                new_h = (h + offset) % 360
                palette.append(ColorUtils.hsv_to_rgb((new_h, s, v)))
        
        elif scheme == "complementary":
            # Base color and its complement
            complement = ColorUtils.get_complementary_color(base_color)
            palette.append(complement)
            # Add split complementary
            for offset in [150, 210]:
                new_h = (h + offset) % 360
                palette.append(ColorUtils.hsv_to_rgb((new_h, s, v)))
        
        return palette
    
    @staticmethod
    def color_distance(color1: Tuple[int, int, int], color2: Tuple[int, int, int]) -> float:
        """
        Calculate the Euclidean distance between two RGB colors
        """
        return np.sqrt(sum((c1 - c2) ** 2 for c1, c2 in zip(color1, color2)))
    
    @staticmethod
    def is_light_color(rgb_color: Tuple[int, int, int]) -> bool:
        """
        Determine if a color is light or dark based on luminance
        """
        # Calculate relative luminance
        r, g, b = [x/255.0 for x in rgb_color]
        luminance = 0.299 * r + 0.587 * g + 0.114 * b
        return luminance > 0.5
    
    @staticmethod
    def get_contrast_color(rgb_color: Tuple[int, int, int]) -> Tuple[int, int, int]:
        """
        Get black or white color for best contrast with the given color
        """
        return (0, 0, 0) if ColorUtils.is_light_color(rgb_color) else (255, 255, 255)
    
    @staticmethod
    def blend_colors(color1: Tuple[int, int, int], color2: Tuple[int, int, int], ratio: float = 0.5) -> Tuple[int, int, int]:
        """
        Blend two colors together
        
        Args:
            color1: First RGB color
            color2: Second RGB color
            ratio: Blend ratio (0.0 = all color1, 1.0 = all color2)
        
        Returns:
            Blended RGB color
        """
        ratio = max(0.0, min(1.0, ratio))  # Clamp ratio between 0 and 1
        blended = tuple(int(c1 * (1 - ratio) + c2 * ratio) for c1, c2 in zip(color1, color2))
        return blended

class ColorPalette:
    """
    Class to manage color palettes and collections
    """
    
    def __init__(self):
        self.colors: List[Dict] = []
    
    def add_color(self, rgb_color: Tuple[int, int, int], name: str = None):
        """
        Add a color to the palette
        """
        if name is None:
            name = ColorUtils.get_color_name(rgb_color)
        
        color_info = {
            'rgb': rgb_color,
            'hex': ColorUtils.rgb_to_hex(rgb_color),
            'hsv': ColorUtils.rgb_to_hsv(rgb_color),
            'hsl': ColorUtils.rgb_to_hsl(rgb_color),
            'name': name
        }
        self.colors.append(color_info)
    
    def remove_color(self, index: int):
        """
        Remove a color from the palette by index
        """
        if 0 <= index < len(self.colors):
            self.colors.pop(index)
    
    def get_palette_info(self) -> List[Dict]:
        """
        Get all colors in the palette with their information
        """
        return self.colors
    
    def save_palette(self, filename: str):
        """
        Save the palette to a file
        """
        with open(filename, 'w') as f:
            f.write("Color Palette\n")
            f.write("=" * 40 + "\n")
            for i, color in enumerate(self.colors, 1):
                f.write(f"\nColor {i}: {color['name']}\n")
                f.write(f"RGB: {color['rgb']}\n")
                f.write(f"HEX: {color['hex']}\n")
                f.write(f"HSV: {color['hsv']}\n")
                f.write(f"HSL: {color['hsl']}\n")
                f.write("-" * 30 + "\n")
    
    def clear_palette(self):
        """
        Clear all colors from the palette
        """
        self.colors.clear()