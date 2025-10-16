const video = document.getElementById('video');
const colorCodeDisplay = document.getElementById('color-code');

// Access the user's camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error('Error accessing the camera:', err);
    });

// Create a canvas to process video frames
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Function to detect color at a specific position
function detectColorAt(x, y) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the pixel data at the specified position
    const pixelData = ctx.getImageData(x, y, 1, 1).data;

    // Convert the pixel data to a hex color code
    const detectedColorHex = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;
    const detectedColorRGB = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

    // Update the color display
    colorCodeDisplay.textContent = `${detectedColorHex} / ${detectedColorRGB}`;
    document.getElementById('color-display').style.backgroundColor = detectedColorHex;
}

// Function to add a color to the history
function addColorToHistory(colorHex, colorRGB) {
    const historyContainer = document.getElementById('color-history');
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    colorItem.style.backgroundColor = colorHex;
    colorItem.textContent = `${colorHex} / ${colorRGB}`;
    historyContainer.prepend(colorItem); // Add the new color to the top

    // Limit the history to the latest 10 colors
    while (historyContainer.children.length > 10) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
}

// Event listener for mouse movement over the video
video.addEventListener('mousemove', (event) => {
    const rect = video.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * (video.videoWidth / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (video.videoHeight / rect.height));
    detectColorAt(x, y);
});

// Event listener for mouse click on the video
video.addEventListener('click', (event) => {
    const rect = video.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * (video.videoWidth / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (video.videoHeight / rect.height));
    detectColorAt(x, y);

    // Add the detected color to the history
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const detectedColorHex = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;
    const detectedColorRGB = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    addColorToHistory(detectedColorHex, detectedColorRGB);
});
