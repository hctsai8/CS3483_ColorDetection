const video = document.getElementById('video');
const colorCodeDisplay = document.getElementById('color-code');

// Create a canvas to process video frames
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

// Set up the camera
const camera = new Camera(video, {
    onFrame: async () => {
        await hands.send({ image: video });
    },
    width: 1280,
    height: 720,
});
camera.start();

// Create a cursor element
const cursor = document.createElement('div');
cursor.id = 'cursor';
document.getElementById('video-container').appendChild(cursor);

// Function to detect color at the cursor's position
function detectColorAtCursor() {
    const cursorRect = cursor.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();

    // Calculate the cursor's position relative to the video
    const x = Math.floor((cursorRect.left + cursorRect.width / 2 - videoRect.left) * (video.videoWidth / videoRect.width));
    const y = Math.floor((cursorRect.top + cursorRect.height / 2 - videoRect.top) * (video.videoHeight / videoRect.height));

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the pixel data at the cursor's position
    const pixelData = ctx.getImageData(x, y, 1, 1).data;

    // Convert the pixel data to a hex color code
    const detectedColorHex = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;
    const detectedColorRGB = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

    // Update the color display
    colorCodeDisplay.textContent = `${detectedColorHex} / ${detectedColorRGB}`;
    document.getElementById('color-display').style.backgroundColor = detectedColorHex;
}

// Fine-tuning offsets for cursor alignment
const CURSOR_OFFSET_X = -100; // Adjust this value to move the cursor horizontally
const CURSOR_OFFSET_Y = -100;  // Adjust this value to move the cursor vertically

// Function to update the cursor position
function updateCursor(x, y) {
    const videoRect = video.getBoundingClientRect();

    // Adjust the cursor position to align with the fingertip
    const adjustedX = x + videoRect.left + CURSOR_OFFSET_X; // Apply horizontal offset
    const adjustedY = y + videoRect.top + CURSOR_OFFSET_Y;  // Apply vertical offset

    cursor.style.left = `${adjustedX}px`;
    cursor.style.top = `${adjustedY}px`;
    cursor.style.display = 'block'; // Ensure the cursor is visible
}

// Listen for hand landmarks
hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexFingerTip = landmarks[8]; // Index finger tip landmark

        // Convert normalized coordinates to video coordinates
        const x = Math.floor(indexFingerTip.x * video.videoWidth);
        const y = Math.floor(indexFingerTip.y * video.videoHeight);

        // Update the cursor position
        updateCursor(x, y);

        // Detect the color at the cursor's position
        detectColorAtCursor();
    } else {
        cursor.style.display = 'none'; // Hide the cursor if no hand is detected
    }
});
