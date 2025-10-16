# MediaPipe Compatibility Guide

## Issue: MediaPipe Installation Failed

If you encountered this error:
```
ERROR: Could not find a version that satisfies the requirement mediapipe (from versions: none)
ERROR: No matching distribution found for mediapipe
```

**This is a known compatibility issue with newer Python versions.**

## Understanding the Problem

MediaPipe currently supports **Python 3.8 through 3.11 only**. If you have Python 3.12, 3.13, or newer, MediaPipe cannot be installed.

## Solutions (Choose One)

### Option 1: Use OpenCV Advanced Mode (Recommended)
This provides similar functionality using only OpenCV:

```bash
python opencv_color_detection.py
```

**Features:**
- Motion-based pointing detection
- Skin color detection for hand tracking
- Multiple detection modes (press 'm' to switch)
- Works with ALL Python versions (3.7+)

### Option 2: Use Simple Click Mode
The most compatible option:

```bash
python simple_color_detection.py
```

**Features:**
- Click-based color detection
- Same color analysis capabilities
- Works on any system with basic OpenCV

### Option 3: Use the Smart Launcher
The launcher automatically detects your Python version and offers compatible options:

```bash
python launcher.py
```

Or on Windows, double-click: `run_color_detection.bat`

### Option 4: Install Compatible Python (Advanced Users)
If you specifically need MediaPipe:

1. Download Python 3.11 from [python.org](https://python.org)
2. Install in a separate directory
3. Create a virtual environment:
   ```bash
   python3.11 -m venv mediapipe_env
   source mediapipe_env/bin/activate  # Linux/Mac
   # or
   mediapipe_env\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

## Feature Comparison

| Feature | MediaPipe Mode | OpenCV Advanced | Simple Mode |
|---------|---------------|----------------|-------------|
| Python Version | 3.8-3.11 | 3.7+ | 3.7+ |
| Gesture Recognition | ✅ Fingertip | ✅ Motion/Skin | ❌ |
| Hand Tracking | ✅ Full landmarks | ✅ Basic | ❌ |
| Color Detection | ✅ | ✅ | ✅ |
| Performance | Medium | High | Highest |
| Ease of Use | High | Medium | Highest |

## Recommendation

For Python 3.13 users (like yourself), we recommend:

1. **Start with OpenCV Advanced Mode** for gesture-like functionality
2. **Fall back to Simple Mode** if you encounter any issues
3. **Use the launcher** to easily switch between modes

## Testing Your Setup

Run this command to check your system compatibility:
```bash
python launcher.py
```

The launcher will:
- Detect your Python version
- Check installed dependencies
- Recommend the best mode for your system
- Offer to install compatible packages only

## Need Help?

- Run `python test_camera.py` to test camera functionality
- Run `python demo.py` for interactive color testing
- Check the main README.md for detailed documentation

Remember: The OpenCV Advanced Mode provides excellent color detection capabilities and works perfectly with your Python 3.13 installation!