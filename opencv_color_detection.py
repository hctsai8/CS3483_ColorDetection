"""
Advanced Color Detection with OpenCV-based Hand Detection
Alternative to MediaPipe for Python 3.13+ compatibility
Uses skin color detection and motion tracking for gesture recognition
"""

import cv2
import numpy as np
import webcolors
from typing import Tuple, Optional, List
import math

class AdvancedColorDetector:
    def __init__(self):
        # Camera setup
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Color detection parameters
        self.color_sample_radius = 15
        self.detected_color = None
        self.color_name = ""
        self.color_code = ""
        
        # Hand detection parameters
        self.hand_cascade = None
        self.skin_detector = SkinDetector()
        self.motion_detector = MotionDetector()
        
        # Tracking variables
        self.pointing_position = None
        self.detection_mode = "motion"  # "motion", "skin", "click"
        
        # Load hand cascade if available
        try:
            cascade_path = cv2.data.haarcascades + 'haarcascade_hand.xml'
            self.hand_cascade = cv2.CascadeClassifier(cascade_path)
        except:
            # If hand cascade not available, we'll use other methods
            pass
    
    def get_pointing_position_motion(self, frame, prev_frame):
        """
        Detect pointing position using motion detection
        """
        return self.motion_detector.detect_pointing_motion(frame, prev_frame)
    
    def get_pointing_position_skin(self, frame):
        """
        Detect pointing position using skin color detection
        """
        return self.skin_detector.detect_fingertip(frame)
    
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
        
        # Calculate average color in the region
        avg_color = np.mean(region, axis=(0, 1))
        return tuple(map(int, avg_color))
    
    def rgb_to_color_name(self, rgb_color: Tuple[int, int, int]) -> str:
        """
        Convert RGB color to the closest color name
        """
        try:
            color_name = webcolors.rgb_to_name(rgb_color)
        except ValueError:
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
    
    def rgb_to_hsv(self, rgb_color: Tuple[int, int, int]) -> Tuple[int, int, int]:
        """
        Convert RGB to HSV color space
        """
        rgb_normalized = np.array([[rgb_color]], dtype=np.uint8)
        hsv = cv2.cvtColor(rgb_normalized, cv2.COLOR_RGB_HSV)[0][0]
        return tuple(map(int, hsv))
    
    def draw_color_info(self, image, pointing_pos: Tuple[int, int], color: Tuple[int, int, int]):
        """
        Draw color information on the image
        """
        x, y = pointing_pos
        
        # Draw circle at pointing position
        cv2.circle(image, (x, y), self.color_sample_radius, (0, 255, 0), 2)
        cv2.circle(image, (x, y), 3, (0, 255, 0), -1)
        
        # Get color information
        color_name = self.rgb_to_color_name(color)
        hex_code = self.rgb_to_hex(color)
        hsv_color = self.rgb_to_hsv(color)
        
        # Create info panel
        panel_width = 400
        panel_height = 220
        panel = np.zeros((panel_height, panel_width, 3), dtype=np.uint8)
        panel[:] = (50, 50, 50)  # Dark gray background
        
        # Color sample rectangle
        color_rect_height = 60
        panel[20:20+color_rect_height, 20:120] = color[::-1]  # BGR for OpenCV
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
        
        # HSV values
        cv2.putText(panel, f"HSV: ({hsv_color[0]}, {hsv_color[1]}, {hsv_color[2]})", (140, 100), font, font_scale, text_color, 1)
        
        # Detection mode
        cv2.putText(panel, f"Mode: {self.detection_mode.title()}", (140, 120), font, font_scale, (0, 255, 255), 1)
        
        # Instructions
        cv2.putText(panel, "Move your hand to point at objects", (20, 150), font, 0.5, (200, 200, 200), 1)
        cv2.putText(panel, "Press 'm' to change detection mode", (20, 170), font, 0.5, (200, 200, 200), 1)
        cv2.putText(panel, "Press 's' to save, 'q' to quit", (20, 190), font, 0.5, (200, 200, 200), 1)
        
        # Overlay panel on image
        h, w = image.shape[:2]
        panel_y = h - panel_height - 10
        panel_x = 10
        
        # Ensure panel fits in image
        if panel_y < 0:
            panel_y = 10
        if panel_x + panel_width > w:
            panel_x = w - panel_width - 10
            
        image[panel_y:panel_y+panel_height, panel_x:panel_x+panel_width] = panel
        
        return color_name, hex_code
    
    def save_color_info(self, color_name: str, hex_code: str, rgb_color: Tuple[int, int, int]):
        """
        Save detected color information to a file
        """
        with open("detected_colors.txt", "a") as f:
            hsv_color = self.rgb_to_hsv(rgb_color)
            f.write(f"Color: {color_name}\n")
            f.write(f"RGB: ({rgb_color[0]}, {rgb_color[1]}, {rgb_color[2]})\n")
            f.write(f"HEX: {hex_code}\n")
            f.write(f"HSV: ({hsv_color[0]}, {hsv_color[1]}, {hsv_color[2]})\n")
            f.write(f"Detection Mode: {self.detection_mode}\n")
            f.write("-" * 30 + "\n")
        print(f"Color information saved: {color_name} - {hex_code}")
    
    def run(self):
        """
        Main function to run the advanced color detection application
        """
        print("Advanced Color Detection System Started!")
        print("Instructions:")
        print("- Move your hand to point at objects for color detection")
        print("- Press 'm' to cycle through detection modes")
        print("- Press 's' to save the current detected color")
        print("- Press 'q' to quit")
        
        prev_frame = None
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to capture frame from camera")
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Store previous frame for motion detection
            if prev_frame is None:
                prev_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                continue
            
            # Detect pointing position based on current mode
            if self.detection_mode == "motion":
                pointing_pos = self.get_pointing_position_motion(frame, prev_frame)
            elif self.detection_mode == "skin":
                pointing_pos = self.get_pointing_position_skin(frame)
            else:  # click mode
                pointing_pos = self.pointing_position
            
            if pointing_pos:
                # Extract color at pointing position
                detected_color = self.extract_color_at_point(frame, pointing_pos)
                
                # Draw color information
                self.color_name, self.color_code = self.draw_color_info(
                    frame, pointing_pos, detected_color)
                self.detected_color = detected_color
            
            # Add mode indicator
            cv2.putText(frame, f"Detection Mode: {self.detection_mode.title()}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Display the frame
            cv2.imshow('Advanced Color Detection', frame)
            
            # Update previous frame
            prev_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s') and self.detected_color is not None:
                self.save_color_info(self.color_name, self.color_code, self.detected_color)
            elif key == ord('m'):
                # Cycle through detection modes
                modes = ["motion", "skin", "click"]
                current_index = modes.index(self.detection_mode)
                self.detection_mode = modes[(current_index + 1) % len(modes)]
                print(f"Switched to {self.detection_mode} detection mode")
                if self.detection_mode == "click":
                    cv2.setMouseCallback('Advanced Color Detection', self.mouse_callback)
        
        # Cleanup
        self.cap.release()
        cv2.destroyAllWindows()
    
    def mouse_callback(self, event, x, y, flags, param):
        """
        Handle mouse clicks for click mode
        """
        if event == cv2.EVENT_LBUTTONDOWN:
            self.pointing_position = (x, y)


class SkinDetector:
    """
    Skin color detection for hand tracking
    """
    
    def __init__(self):
        # HSV ranges for skin color detection
        self.lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        self.upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    def detect_skin(self, frame):
        """
        Detect skin regions in the frame
        """
        # Convert to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Create skin mask
        skin_mask = cv2.inRange(hsv, self.lower_skin, self.upper_skin)
        
        # Apply morphological operations to clean up the mask
        kernel = np.ones((3, 3), np.uint8)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
        
        return skin_mask
    
    def detect_fingertip(self, frame):
        """
        Detect fingertip position using skin detection and contour analysis
        """
        skin_mask = self.detect_skin(frame)
        
        # Find contours
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Find the largest contour (assumed to be the hand)
        largest_contour = max(contours, key=cv2.contourArea)
        
        if cv2.contourArea(largest_contour) < 1000:  # Minimum area threshold
            return None
        
        # Find the topmost point of the contour (likely fingertip)
        topmost = tuple(largest_contour[largest_contour[:, :, 1].argmin()][0])
        
        return topmost


class MotionDetector:
    """
    Motion-based pointing detection
    """
    
    def __init__(self):
        self.prev_gray = None
        self.motion_threshold = 30
    
    def detect_pointing_motion(self, frame, prev_frame):
        """
        Detect pointing position using motion analysis
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        if prev_frame is None:
            return None
        
        # Calculate frame difference
        diff = cv2.absdiff(prev_frame, gray)
        
        # Threshold the difference
        _, thresh = cv2.threshold(diff, self.motion_threshold, 255, cv2.THRESH_BINARY)
        
        # Find contours of moving regions
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Find the largest moving region
        largest_contour = max(contours, key=cv2.contourArea)
        
        if cv2.contourArea(largest_contour) < 500:  # Minimum area threshold
            return None
        
        # Get the centroid of the motion
        M = cv2.moments(largest_contour)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            return (cx, cy)
        
        return None


def main():
    """
    Main function to initialize and run the advanced color detector
    """
    try:
        detector = AdvancedColorDetector()
        detector.run()
    except KeyboardInterrupt:
        print("\nApplication interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()