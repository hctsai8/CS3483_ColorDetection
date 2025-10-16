"""
Color Distinction Function with Gesture Recognition
Utilizing advanced camera technology and gesture recognition to identify colors in real-time.
When users point to an object, the system detects the color at the fingertip and displays its corresponding color code.
"""

import cv2
import mediapipe as mp
import numpy as np
import webcolors
from typing import Tuple, Optional
import math

class ColorDetector:
    def __init__(self):
        # Initialize MediaPipe hands
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Camera setup
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Color detection parameters
        self.color_sample_radius = 15
        self.detected_color = None
        self.color_name = ""
        self.color_code = ""
        
    def get_fingertip_position(self, landmarks, image_shape) -> Optional[Tuple[int, int]]:
        """
        Get the position of the index finger tip from hand landmarks
        """
        if landmarks:
            # Index finger tip is landmark 8
            index_tip = landmarks.landmark[8]
            h, w = image_shape[:2]
            x = int(index_tip.x * w)
            y = int(index_tip.y * h)
            return (x, y)
        return None
    
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
            # Try to get exact color name
            color_name = webcolors.rgb_to_name(rgb_color)
        except ValueError:
            # If exact match not found, find closest color
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
    
    def draw_color_info(self, image, fingertip_pos: Tuple[int, int], color: Tuple[int, int, int]):
        """
        Draw color information on the image
        """
        x, y = fingertip_pos
        
        # Draw circle at fingertip
        cv2.circle(image, (x, y), self.color_sample_radius, (0, 255, 0), 2)
        cv2.circle(image, (x, y), 3, (0, 255, 0), -1)
        
        # Get color information
        color_name = self.rgb_to_color_name(color)
        hex_code = self.rgb_to_hex(color)
        hsv_color = self.rgb_to_hsv(color)
        
        # Create info panel
        panel_width = 400
        panel_height = 200
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
        
        # Instructions
        cv2.putText(panel, "Point your index finger at an object", (20, 130), font, 0.5, (200, 200, 200), 1)
        cv2.putText(panel, "to detect its color", (20, 150), font, 0.5, (200, 200, 200), 1)
        cv2.putText(panel, "Press 'q' to quit, 's' to save color", (20, 170), font, 0.5, (200, 200, 200), 1)
        
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
            f.write("-" * 30 + "\n")
        print(f"Color information saved: {color_name} - {hex_code}")
    
    def run(self):
        """
        Main function to run the color detection application
        """
        print("Color Detection System Started!")
        print("Instructions:")
        print("- Point your index finger at objects to detect their colors")
        print("- Press 's' to save the current detected color")
        print("- Press 'q' to quit")
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to capture frame from camera")
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process hand landmarks
            results = self.hands.process(rgb_frame)
            
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Draw hand landmarks
                    self.mp_drawing.draw_landmarks(
                        frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                    
                    # Get fingertip position
                    fingertip_pos = self.get_fingertip_position(hand_landmarks, frame.shape)
                    
                    if fingertip_pos:
                        # Extract color at fingertip
                        detected_color = self.extract_color_at_point(frame, fingertip_pos)
                        
                        # Draw color information
                        self.color_name, self.color_code = self.draw_color_info(
                            frame, fingertip_pos, detected_color)
                        self.detected_color = detected_color
            
            # Display the frame
            cv2.imshow('Color Detection System', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s') and self.detected_color is not None:
                self.save_color_info(self.color_name, self.color_code, self.detected_color)
        
        # Cleanup
        self.cap.release()
        cv2.destroyAllWindows()

def main():
    """
    Main function to initialize and run the color detector
    """
    try:
        detector = ColorDetector()
        detector.run()
    except KeyboardInterrupt:
        print("\nApplication interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()