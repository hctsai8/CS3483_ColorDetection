# Color Detection System Configuration

# Camera Settings
CAMERA_INDEX = 0
CAMERA_WIDTH = 1280
CAMERA_HEIGHT = 720
CAMERA_FPS = 30

# Color Detection Settings
COLOR_SAMPLE_RADIUS = 15
MIN_DETECTION_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.5

# Display Settings
WINDOW_NAME = "Color Detection System"
FONT_SCALE = 0.6
FONT_THICKNESS = 1
PANEL_WIDTH = 400
PANEL_HEIGHT = 200

# Color Analysis Settings
MAX_NUM_HANDS = 1
ENABLE_HAND_LANDMARKS = True
FLIP_HORIZONTAL = True

# File Settings
OUTPUT_FILE = "detected_colors.txt"
PALETTE_FILE = "color_palette.txt"

# UI Colors (BGR format for OpenCV)
UI_BACKGROUND_COLOR = (50, 50, 50)
UI_TEXT_COLOR = (255, 255, 255)
UI_ACCENT_COLOR = (0, 255, 0)
UI_ERROR_COLOR = (0, 0, 255)