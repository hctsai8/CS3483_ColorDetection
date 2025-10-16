"""
Simple Color Detection System
A basic version that detects colors by clicking on objects in the camera feed.
"""

import cv2
import numpy as np
import webcolors
from typing import Tuple

class SimpleColorDetector:
    def __init__(self):
        # Camera setup
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Color detection parameters
        self.color_sample_radius = 15
        self.click_pos = None
        self.detected_color = None
        
    def mouse_callback(self, event, x, y, flags, param):
        """
        Handle mouse click events to detect color at clicked position
        """
        if event == cv2.EVENT_LBUTTONDOWN:
            print(f"Mouse clicked at position: ({x}, {y})")
            self.click_pos = (x, y)

    def get_color_name(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Get the closest color name for the given RGB color
        """
        try:
            # Try to get exact color name
            color_name = webcolors.rgb_to_name(rgb_color)
            return color_name
        except ValueError:
            # If exact match not found, find closest color
            try:
                # Use CSS3 colors for newer webcolors versions
                closest_name = self.closest_color(rgb_color)
                return closest_name
            except:
                # Fallback to basic color categorization
                return self.categorize_color(rgb_color)
    
    def closest_color(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Find the closest named color to the given RGB color
        """
        min_colors = {}
        
        # Try different color dictionaries based on webcolors version
        try:
            # For newer versions of webcolors
            color_dict = webcolors.CSS3_NAMES_TO_HEX
        except AttributeError:
            try:
                # Alternative for different versions
                color_dict = webcolors.css3_names_to_hex
            except AttributeError:
                # Fallback to basic colors
                color_dict = {
                    'red': '#ff0000', 'green': '#008000', 'blue': '#0000ff',
                    'yellow': '#ffff00', 'orange': '#ffa500', 'purple': '#800080',
                    'pink': '#ffc0cb', 'brown': '#a52a2a', 'black': '#000000',
                    'white': '#ffffff', 'gray': '#808080', 'cyan': '#00ffff',
                    'magenta': '#ff00ff', 'lime': '#00ff00', 'navy': '#000080'
                }
        
        for color_name, hex_color in color_dict.items():
            try:
                color_rgb = webcolors.hex_to_rgb(hex_color)
                rd = (color_rgb[0] - rgb_color[0]) ** 2
                gd = (color_rgb[1] - rgb_color[1]) ** 2
                bd = (color_rgb[2] - rgb_color[2]) ** 2
                min_colors[(rd + gd + bd)] = color_name
            except:
                continue
        
        if min_colors:
            return min_colors[min(min_colors.keys())]
        else:
            return self.categorize_color(rgb_color)
    
    def categorize_color(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Basic color categorization fallback
        """
        r, g, b = rgb_color
        
        # Simple color categorization logic
        if r > 200 and g > 200 and b > 200:
            return "white"
        elif r < 50 and g < 50 and b < 50:
            return "black"
        elif r > g and r > b:
            if g > 100:
                return "orange" if r > 200 else "red"
            else:
                return "red"
        elif g > r and g > b:
            return "green"
        elif b > r and b > g:
            return "blue"
        elif r > 150 and g > 150 and b < 100:
            return "yellow"
        elif r > 100 and g < 100 and b > 100:
            return "purple"
        else:
            return "gray"

    def rgb_to_hex(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Convert RGB color to hex format
        """
        return "#{:02x}{:02x}{:02x}".format(rgb_color[0], rgb_color[1], rgb_color[2])

    def extract_color_at_point(self, image, point: Tuple[int, int]) -> Tuple[int, int, int]:
        """
        Extract color from the image at the specified point
        """
        x, y = point
        h, w = image.shape[:2]
        
        # Ensure point is within image bounds with safety margin
        x = max(self.color_sample_radius, min(w - self.color_sample_radius - 1, x))
        y = max(self.color_sample_radius, min(h - self.color_sample_radius - 1, y))
        
        try:
            # Extract a small region around the point for better color sampling
            region = image[y-self.color_sample_radius:y+self.color_sample_radius,
                          x-self.color_sample_radius:x+self.color_sample_radius]
            
            if region.size == 0:
                # Fallback to single pixel if region is empty
                bgr = image[y, x]
                return (int(bgr[2]), int(bgr[1]), int(bgr[0]))  # BGR to RGB
            
            # Calculate average color in the region (BGR to RGB)
            avg_color = np.mean(region, axis=(0, 1))
            return (int(avg_color[2]), int(avg_color[1]), int(avg_color[0]))  # BGR to RGB
        except Exception as e:
            print(f"Error extracting color: {e}")
            # Fallback to center pixel
            bgr = image[y, x]
            return (int(bgr[2]), int(bgr[1]), int(bgr[0]))  # BGR to RGB

    def draw_color_info(self, frame, point: Tuple[int, int], color: Tuple[int, int, int]) -> Tuple[str, str]:
        """
        Draw color information on the frame
        """
        x, y = point
        
        # Get color name and hex code
        color_name = self.get_color_name(color)
        hex_code = self.rgb_to_hex(color)
        
        # Draw circle at clicked point
        cv2.circle(frame, (x, y), self.color_sample_radius, (0, 255, 0), 2)
        
        # Draw color information box
        info_text = [
            f"Color: {color_name}",
            f"RGB: {color}",
            f"Hex: {hex_code}"
        ]
        
        # Background rectangle for text
        rect_height = len(info_text) * 30 + 20
        cv2.rectangle(frame, (x + 30, y - 10), (x + 300, y + rect_height), (0, 0, 0), -1)
        cv2.rectangle(frame, (x + 30, y - 10), (x + 300, y + rect_height), (255, 255, 255), 2)
        
        # Draw text
        for i, text in enumerate(info_text):
            cv2.putText(frame, text, (x + 40, y + 20 + i * 25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Draw color sample
        color_bgr = (color[2], color[1], color[0])  # RGB to BGR for OpenCV
        cv2.rectangle(frame, (x + 250, y), (x + 290, y + 40), color_bgr, -1)
        cv2.rectangle(frame, (x + 250, y), (x + 290, y + 40), (255, 255, 255), 2)
        
        return color_name, hex_code

    def save_color_info(self):
        """
        Save the detected color information to a file
        """
        if self.detected_color:
            color, color_name, hex_code = self.detected_color
            with open("detected_colors.txt", "a") as f:
                f.write(f"Color: {color_name}, RGB: {color}, Hex: {hex_code}\n")
            print(f"Saved color: {color_name} ({hex_code})")

    def run(self):
        """
        Main function to run the simple color detection application
        """
        print("Simple Color Detection System Started!")
        print("Instructions:")
        print("- Click on objects in the video to detect their colors")
        print("- Press 's' to save the current detected color")
        print("- Press 'c' to clear selection")
        print("- Press 'q' to quit")
        
        # Set up mouse callback
        cv2.namedWindow('Simple Color Detection')
        cv2.setMouseCallback('Simple Color Detection', self.mouse_callback)
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to capture frame from camera")
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # If user clicked, detect color at that position
            if self.click_pos:
                try:
                    detected_color = self.extract_color_at_point(frame, self.click_pos)
                    color_name, hex_code = self.draw_color_info(frame, self.click_pos, detected_color)
                    self.detected_color = (detected_color, color_name, hex_code)
                except Exception as e:
                    print(f"Error detecting color: {e}")
                    self.click_pos = None
            
            # Add instruction text
            cv2.putText(frame, "Click on objects to detect color", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Display the frame
            cv2.imshow('Simple Color Detection', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s') and self.detected_color is not None:
                try:
                    self.save_color_info()
                except Exception as e:
                    print(f"Error saving color: {e}")
            elif key == ord('c'):  # Clear selection
                self.click_pos = None
                self.detected_color = None
        
        # Cleanup
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    detector = SimpleColorDetector()
    detector.run()