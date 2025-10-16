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
- Python 3.7 or higher
- Webcam/Camera
- Windows/Mac/Linux operating system

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

### Advanced Gesture Recognition Mode

Run the main color detection system with hand tracking:

```bash
python color_detection.py
```

**Instructions:**
- Point your index finger at objects in the camera view
- The system will detect the color at your fingertip location
- Color information is displayed in real-time on screen
- Press 's' to save the current detected color to file
- Press 'q' to quit the application

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
├── color_detection.py          # Main application with gesture recognition
├── simple_color_detection.py   # Simple click-based version
├── color_utils.py              # Color utility functions and palette management
├── requirements.txt            # Python dependencies
├── README.md                  # This file
└── detected_colors.txt        # Saved color history (created when colors are saved)
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

### Camera Issues
- Ensure your webcam is properly connected and not used by other applications
- Try different camera indices if default camera (0) doesn't work
- Check camera permissions in your system settings

### MediaPipe Installation Issues
- If MediaPipe fails to install, use the simple click mode instead
- Ensure you have the correct Python version (3.7-3.11 recommended)
- Try installing MediaPipe separately: `pip install mediapipe`

### Performance Issues
- Reduce camera resolution in the code if needed
- Close other applications using the camera
- Use simple_color_detection.py for better performance on older systems

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