"""
Camera Test Script
Simple script to test if the camera is working properly
"""

import cv2

def test_camera():
    """Test camera functionality"""
    print("Testing camera...")
    print("Press 'q' to quit")
    
    # Try to open camera
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open camera")
        return False
    
    print("Camera opened successfully!")
    print("Camera resolution:", int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), "x", int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Error: Could not read frame")
            break
        
        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Add text overlay
        cv2.putText(frame, "Camera Test - Press 'q' to quit", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Display frame
        cv2.imshow('Camera Test', frame)
        
        # Check for quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("Camera test completed")
    return True

if __name__ == "__main__":
    test_camera()