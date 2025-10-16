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
            self.click_pos = (x, y)
    
    def extract_color_at_point(self, image, point: Tuple[int, int]) -> Tuple[int, int, int]:
        """
        Extract color from the image at the specified point
        """
        x, y = point
        h, w = image.shape[:2]
        
        # Ensure point is within image bounds
        x = max(self.color_sample_radius, min(w - self.color_sample_radius, x))
        y = max(self.color_sample_radius, min(h - self.color_sample_radius, y))
        
        # Extract a small region around the point for better color sampling
        region = image[y-self.color_sample_radius:y+self.color_sample_radius,
                      x-self.color_sample_radius:x+self.color_sample_radius]
        
        # Calculate average color in the region (BGR to RGB)
        avg_color = np.mean(region, axis=(0, 1))
        return (int(avg_color[2]), int(avg_color[1]), int(avg_color[0]))  # BGR to RGB
    
    def rgb_to_color_name(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Convert RGB color to the closest color name
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
    
    def rgb_to_hex(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Convert RGB color to hexadecimal color code
        """
        return "#{:02x}{:02x}{:02x}".format(rgb_color[0], rgb_color[1], rgb_color[2])
    
    def draw_color_info(self, image, click_pos: Tuple[int, int], color: Tuple[int, int, int]):
        """
        Draw color information on the image
        """
        x, y = click_pos
        
        # Draw circle at click position
        cv2.circle(image, (x, y), self.color_sample_radius, (0, 255, 0), 2)
        cv2.circle(image, (x, y), 3, (0, 255, 0), -1)
        
        # Get color information
        color_name = self.rgb_to_color_name(color)
        hex_code = self.rgb_to_hex(color)
        
        # Create info panel
        panel_width = 400
        panel_height = 150
        panel = np.zeros((panel_height, panel_width, 3), dtype=np.uint8)
        panel[:] = (50, 50, 50)  # Dark gray background
        
        # Color sample rectangle
        color_rect_height = 60
        panel[20:20+color_rect_height, 20:120] = (color[2], color[1], color[0])  # RGB to BGR
        cv2.rectangle(panel, (20, 20), (120, 20+color_rect_height), (255, 255, 255), 2)
        
        # Text information
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        text_color = (255, 255, 255)
        
        # Color name
        cv2.putText(panel, f"Color: {color_name}", (140, 40), font, font_scale, text_color, 1)
        
        # RGB values
        cv2.putText(panel, f"RGB: ({color[0]}, {color[1]}, {color[2]})", (140, 60), font, font_scale, text_color, 1)
        
        # Hex code
        cv2.putText(panel, f"HEX: {hex_code}", (140, 80), font, font_scale, text_color, 1)
        
        # Instructions
        cv2.putText(panel, "Click on objects to detect their colors", (20, 110), font, 0.5, (200, 200, 200), 1)
        cv2.putText(panel, "Press 'q' to quit, 's' to save color", (20, 130), font, 0.5, (200, 200, 200), 1)
        
        # Overlay panel on image
        h, w = image.shape[:2]
        panel_y = h - panel_height - 10
        panel_x = 10
        
        image[panel_y:panel_y+panel_height, panel_x:panel_x+panel_width] = panel
        
        return color_name, hex_code
    
    def run(self):
        """
        Main function to run the simple color detection application
        """
        print("Simple Color Detection System Started!")
        print("Instructions:")
        print("- Click on objects in the video to detect their colors")
        print("- Press 's' to save the current detected color")
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
                detected_color = self.extract_color_at_point(frame, self.click_pos)
                color_name, hex_code = self.draw_color_info(frame, self.click_pos, detected_color)
                self.detected_color = (detected_color, color_name, hex_code)
            
            # Add crosshair at mouse position for better targeting
            cv2.putText(frame, "Click on objects to detect color", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Display the frame
            cv2.imshow('Simple Color Detection', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s') and self.detected_color is not None:
                self.save_color_info()
            elif key == ord('c'):  # Clear selection
                self.click_pos = None
                self.detected_color = None
        
        # Cleanup
        self.cap.release()
        cv2.destroyAllWindows()
    
    def save_color_info(self):
        """
        Save detected color information to a file
        """
        if self.detected_color:
            color, color_name, hex_code = self.detected_color
            with open("detected_colors.txt", "a") as f:
                f.write(f"Color: {color_name}\n")
                f.write(f"RGB: ({color[0]}, {color[1]}, {color[2]})\n")
                f.write(f"HEX: {hex_code}\n")
                f.write("-" * 30 + "\n")
            print(f"Color information saved: {color_name} - {hex_code}")

def main():
    """
    Main function to initialize and run the simple color detector
    """
    try:
        detector = SimpleColorDetector()
        detector.run()
    except KeyboardInterrupt:
        print("\nApplication interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()