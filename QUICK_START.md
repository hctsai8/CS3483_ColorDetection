# Quick Start Guide

## Getting Started

### Option 1: Windows Users (Easiest)
1. Double-click `run_color_detection.bat`
2. Follow the on-screen menu

### Option 2: Command Line
1. Open terminal/command prompt
2. Navigate to the project folder
3. Run: `python launcher.py`

### Option 3: Direct Application Launch
- Advanced mode: `python color_detection.py`
- Simple mode: `python simple_color_detection.py`
- Demo mode: `python demo.py`
- Camera test: `python test_camera.py`

## Application Modes

### 1. Advanced Mode (Recommended)
- **File**: `color_detection.py`
- **Features**: Hand tracking, fingertip detection, real-time gesture recognition
- **Requirements**: MediaPipe library
- **Usage**: Point your index finger at objects to detect colors

### 2. Simple Mode
- **File**: `simple_color_detection.py`
- **Features**: Click-based color detection
- **Requirements**: Only OpenCV and basic libraries
- **Usage**: Click on objects in the video to detect colors

### 3. Demo Mode
- **File**: `demo.py`
- **Features**: Test color utilities, interactive color palette
- **Usage**: Experiment with color conversion and analysis functions

### 4. Camera Test
- **File**: `test_camera.py`
- **Features**: Verify camera functionality
- **Usage**: Simple camera feed test

## Controls

### Advanced Mode
- Point index finger at objects
- Press 's' to save detected color
- Press 'q' to quit

### Simple Mode
- Click on objects to detect color
- Press 's' to save detected color
- Press 'c' to clear selection
- Press 'q' to quit

### Demo Mode
- Click on colored sections
- Press 'r' to reset
- Press 'q' to quit

## Troubleshooting

### Camera Not Working
1. Ensure webcam is connected
2. Close other applications using the camera
3. Run `python test_camera.py` to diagnose

### Import Errors
1. Run `python launcher.py` and choose option 5 to install dependencies
2. Or manually install: `pip install -r requirements.txt`

### Performance Issues
1. Use Simple Mode for better performance
2. Reduce camera resolution in config.py
3. Close unnecessary applications

## Output Files
- `detected_colors.txt`: Saved color history
- `demo_palette.txt`: Demo color palette
- `color_palette.txt`: Custom color palettes