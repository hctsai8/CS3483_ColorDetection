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
    
    try:
        import mediapipe
        print("✓ MediaPipe installed (advanced mode available)")
        mediapipe_available = True
    except ImportError:
        print("⚠ MediaPipe not installed (advanced mode unavailable)")
        missing_deps.append("mediapipe")
        mediapipe_available = False
    
    return missing_deps, mediapipe_available

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

def show_menu():
    """Show the main menu"""
    print("\n" + "="*50)
    print("    COLOR DETECTION SYSTEM")
    print("="*50)
    print("Choose an option:")
    print("1. Advanced Mode (with gesture recognition)")
    print("2. Simple Mode (click-based detection)")
    print("3. Demo Mode (test color utilities)")
    print("4. Camera Test")
    print("5. Install/Update Dependencies")
    print("6. Exit")
    print("="*50)

def run_application(mode):
    """Run the selected application mode"""
    try:
        if mode == 1:
            print("Starting Advanced Color Detection...")
            subprocess.run([sys.executable, "color_detection.py"])
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
    missing_deps, mediapipe_available = check_dependencies()
    
    if missing_deps:
        if not install_dependencies(missing_deps):
            return
        # Re-check after installation
        missing_deps, mediapipe_available = check_dependencies()
    
    print("\nSystem ready!")
    
    while True:
        show_menu()
        
        if not mediapipe_available:
            print("Note: Advanced mode unavailable (MediaPipe not installed)")
        
        try:
            choice = int(input("\nEnter your choice (1-6): "))
        except ValueError:
            print("Invalid input. Please enter a number.")
            continue
        
        if choice == 1:
            if mediapipe_available:
                run_application(1)
            else:
                print("Advanced mode requires MediaPipe. Please install it first (option 5).")
        elif choice == 2:
            run_application(2)
        elif choice == 3:
            run_application(3)
        elif choice == 4:
            run_application(4)
        elif choice == 5:
            # Force re-check and installation
            all_deps = ["opencv-python", "mediapipe", "numpy", "webcolors", "Pillow"]
            install_dependencies(all_deps)
            missing_deps, mediapipe_available = check_dependencies()
        elif choice == 6:
            print("Thank you for using Color Detection System!")
            break
        else:
            print("Invalid choice. Please select 1-6.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()