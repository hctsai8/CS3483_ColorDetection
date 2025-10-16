# CS3483 Color Detection System

A real-time color detection system utilizing advanced camera technology and gesture recognition. The system accurately identifies colors when users point to objects, displaying corresponding color codes on the screen for easy reference and selection.

## Features

- **Real-time Color Detection**: Instantly identifies colors from live camera feed
- **Gesture Recognition**: Uses MediaPipe for hand tracking and fingertip detection
- **Multiple Color Formats**: Displays RGB, HEX, HSV, and HSL color values
- **Color Name Recognition**: Identifies closest named colors using CSS3 color names
- **Color Palette Generation**: Creates harmonious color schemes (monochromatic, analogous, triadic, complementary)
- **Color History**: Save detected colors for future reference
- **Simple Click Mode**: Alternative mode for systems without gesture recognition

## Installation

### Prerequisites
- Python 3.7 or higher (3.13+ supported)
- Webcam/Camera
- Windows/Mac/Linux operating system

### Python Version Compatibility
- **Python 3.8-3.11**: Full MediaPipe gesture recognition available
- **Python 3.12+**: OpenCV-based advanced detection (motion/skin detection)
- **All versions**: Simple click-based detection always available

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hctsai8/CS3483_ColorDetection.git
   cd CS3483_ColorDetection
   ```

2. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

   Or install packages individually:
   ```bash
   pip install opencv-python mediapipe numpy webcolors Pillow
   ```

## Usage

### Advanced Detection Modes

#### MediaPipe Gesture Recognition (Python 3.8-3.11)
```bash
python color_detection.py
```
- Point your index finger at objects
- Real-time fingertip tracking
- Most accurate gesture recognition

#### OpenCV Advanced Detection (All Python versions)
```bash
python opencv_color_detection.py
```
- Motion-based pointing detection
- Skin color detection
- Multiple detection modes (press 'm' to switch)

**Instructions:**
- Move your hand to point at objects
- Press 'm' to cycle through detection modes
- Press 's' to save detected colors
- Press 'q' to quit

### Simple Click Mode

For systems with limited processing power or MediaPipe installation issues:

```bash
python simple_color_detection.py
```

**Instructions:**
- Click on objects in the camera view to detect their colors
- Color information is displayed after clicking
- Press 's' to save the detected color
- Press 'c' to clear the current selection
- Press 'q' to quit

## File Structure

```
CS3483_ColorDetection/
├── color_detection.py          # MediaPipe-based gesture recognition (Python 3.8-3.11)
├── opencv_color_detection.py   # OpenCV-based advanced detection (all Python versions)
├── simple_color_detection.py   # Simple click-based version
├── color_utils.py              # Color utility functions and palette management
├── demo.py                     # Interactive demo and testing
├── launcher.py                 # Smart launcher with compatibility detection
├── test_camera.py              # Camera functionality test
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── run_color_detection.bat     # Windows launcher
├── QUICK_START.md              # Quick usage guide
├── README.md                   # This file
└── detected_colors.txt         # Saved color history (created when colors are saved)
```

## Key Components

### 1. ColorDetector Class (color_detection.py)
- **Hand Tracking**: Uses MediaPipe for real-time hand landmark detection
- **Fingertip Detection**: Identifies index finger tip position
- **Color Sampling**: Extracts average color from a region around the fingertip
- **Real-time Display**: Shows color information with visual feedback

### 2. SimpleColorDetector Class (simple_color_detection.py)
- **Mouse Interaction**: Click-based color detection
- **Simplified Interface**: Easier to use on various systems
- **Same Color Analysis**: Provides identical color information as advanced mode

### 3. ColorUtils Module (color_utils.py)
- **Color Conversions**: RGB ↔ HEX ↔ HSV ↔ HSL conversions
- **Color Analysis**: Distance calculation, contrast detection, luminance analysis
- **Palette Generation**: Creates color harmonies and schemes
- **Color Naming**: Matches colors to standard CSS3 color names

## Color Information Displayed

For each detected color, the system shows:
- **Color Name**: Closest CSS3 color name
- **RGB Values**: Red, Green, Blue components (0-255)
- **HEX Code**: Hexadecimal color representation (#RRGGBB)
- **HSV Values**: Hue, Saturation, Value representation
- **Visual Sample**: Colored rectangle showing the detected color

## Troubleshooting

### MediaPipe Installation Issues
**Problem**: `ERROR: Could not find a version that satisfies the requirement mediapipe`

**Solution**: MediaPipe requires Python 3.8-3.11. Check your Python version:
```bash
python --version
```

**Options:**
1. **Use OpenCV Advanced Mode**: Run `python opencv_color_detection.py` (works with all Python versions)
2. **Use Simple Mode**: Run `python simple_color_detection.py`
3. **Install Compatible Python**: Download Python 3.11 from python.org if you need MediaPipe

### Camera Issues
- Ensure your webcam is properly connected and not used by other applications
- Try different camera indices if default camera (0) doesn't work
- Check camera permissions in your system settings
- Run `python test_camera.py` to diagnose camera problems

### Performance Issues
- Use Simple Mode for best performance on older systems
- Close other applications using the camera
- Reduce camera resolution in config.py if needed

### Python Version Compatibility
- **Python 3.13+**: OpenCV advanced mode and simple mode available
- **Python 3.8-3.11**: All modes including MediaPipe available
- **Python 3.7**: Simple mode and basic OpenCV features available

## Technical Details

### Color Detection Algorithm
1. **Image Capture**: Captures frames from webcam at 30 FPS
2. **Hand Detection**: Uses MediaPipe Hands for landmark detection
3. **Fingertip Localization**: Identifies index finger tip coordinates
4. **Color Sampling**: Averages color values in a circular region around fingertip
5. **Color Analysis**: Converts to multiple color spaces and finds nearest named color
6. **Display**: Overlays color information on the video feed

### Supported Color Spaces
- **RGB**: Standard red-green-blue representation
- **HEX**: Web-standard hexadecimal notation
- **HSV**: Hue-saturation-value (useful for color analysis)
- **HSL**: Hue-saturation-lightness (alternative representation)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source. Feel free to use and modify for educational and commercial purposes.

## Author

Created for CS3483 - Computer Vision and Image Processing Course