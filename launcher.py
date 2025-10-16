"""
Color Detection System Launcher
Helps users choose and launch the appropriate version of the color detection system
"""

import sys
import subprocess
import os

def check_dependencies():
    """Check if required dependencies are installed"""
    missing_deps = []
    
    try:
        import cv2
        print("✓ OpenCV installed")
    except ImportError:
        missing_deps.append("opencv-python")
    
    try:
        import numpy
        print("✓ NumPy installed")
    except ImportError:
        missing_deps.append("numpy")
    
    try:
        import webcolors
        print("✓ webcolors installed")
    except ImportError:
        missing_deps.append("webcolors")
    
    # Check Python version for MediaPipe compatibility
    python_version = sys.version_info
    mediapipe_compatible = python_version.major == 3 and 8 <= python_version.minor <= 11
    
    try:
        import mediapipe
        print("✓ MediaPipe installed (gesture recognition available)")
        mediapipe_available = True
    except ImportError:
        if mediapipe_compatible:
            print("⚠ MediaPipe not installed (but compatible with your Python version)")
            missing_deps.append("mediapipe")
        else:
            print(f"⚠ MediaPipe not compatible with Python {python_version.major}.{python_version.minor}")
            print("  MediaPipe requires Python 3.8-3.11")
            print("  Advanced OpenCV mode available instead")
        mediapipe_available = False
    
    return missing_deps, mediapipe_available, mediapipe_compatible

def install_dependencies(missing_deps):
    """Install missing dependencies"""
    if not missing_deps:
        return True
    
    print(f"\nMissing dependencies: {', '.join(missing_deps)}")
    choice = input("Would you like to install them now? (y/n): ").lower()
    
    if choice == 'y':
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing_deps)
            print("Dependencies installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("Failed to install dependencies. Please install them manually:")
            print(f"pip install {' '.join(missing_deps)}")
            return False
    else:
        print("Please install dependencies manually before running the application.")
        return False

def show_menu(mediapipe_available, mediapipe_compatible):
    """Show the main menu"""
    print("\n" + "="*50)
    print("    COLOR DETECTION SYSTEM")
    print("="*50)
    print("Choose an option:")
    
    if mediapipe_available:
        print("1. MediaPipe Mode (hand tracking)")
    else:
        print("1. OpenCV Advanced Mode (motion/skin detection)")
    
    print("2. Simple Mode (click-based detection)")
    print("3. Demo Mode (test color utilities)")
    print("4. Camera Test")
    print("5. Install/Update Dependencies")
    print("6. Exit")
    print("="*50)
    
    if not mediapipe_compatible:
        print("Note: MediaPipe requires Python 3.8-3.11")
        print(f"Your Python version: {sys.version_info.major}.{sys.version_info.minor}")
        print("Using OpenCV-based alternatives for advanced features")

def run_application(mode, mediapipe_available):
    """Run the selected application mode"""
    try:
        if mode == 1:
            if mediapipe_available:
                print("Starting MediaPipe Color Detection...")
                subprocess.run([sys.executable, "color_detection.py"])
            else:
                print("Starting OpenCV Advanced Color Detection...")
                subprocess.run([sys.executable, "opencv_color_detection.py"])
        elif mode == 2:
            print("Starting Simple Color Detection...")
            subprocess.run([sys.executable, "simple_color_detection.py"])
        elif mode == 3:
            print("Starting Demo Mode...")
            subprocess.run([sys.executable, "demo.py"])
        elif mode == 4:
            print("Starting Camera Test...")
            subprocess.run([sys.executable, "test_camera.py"])
    except FileNotFoundError as e:
        print(f"Error: Could not find the application file. {e}")
    except Exception as e:
        print(f"Error running application: {e}")

def main():
    """Main launcher function"""
    print("Color Detection System Launcher")
    print("Checking system compatibility...")
    
    # Check dependencies
    missing_deps, mediapipe_available, mediapipe_compatible = check_dependencies()
    
    if missing_deps:
        # Only try to install compatible dependencies
        compatible_deps = [dep for dep in missing_deps if dep != "mediapipe" or mediapipe_compatible]
        if compatible_deps and install_dependencies(compatible_deps):
            # Re-check after installation
            missing_deps, mediapipe_available, mediapipe_compatible = check_dependencies()
    
    print("\nSystem ready!")
    
    while True:
        show_menu(mediapipe_available, mediapipe_compatible)
        
        try:
            choice = int(input("\nEnter your choice (1-6): "))
        except ValueError:
            print("Invalid input. Please enter a number.")
            continue
        
        if choice == 1:
            run_application(1, mediapipe_available)
        elif choice == 2:
            run_application(2, mediapipe_available)
        elif choice == 3:
            run_application(3, mediapipe_available)
        elif choice == 4:
            run_application(4, mediapipe_available)
        elif choice == 5:
            # Install compatible dependencies
            if mediapipe_compatible:
                all_deps = ["opencv-python", "mediapipe", "numpy", "webcolors", "Pillow"]
            else:
                all_deps = ["opencv-python", "numpy", "webcolors", "Pillow"]
                print("Skipping MediaPipe (incompatible with your Python version)")
            install_dependencies(all_deps)
            missing_deps, mediapipe_available, mediapipe_compatible = check_dependencies()
        elif choice == 6:
            print("Thank you for using Color Detection System!")
            break
        else:
            print("Invalid choice. Please select 1-6.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()