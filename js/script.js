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

class ColorDetectionApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.colorHistory = [];
        this.isDetectionActive = false;
        this.animationFrame = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadColorHistory();
    }

    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            captureBtn: document.getElementById('capture-btn'),
            clearHistoryBtn: document.getElementById('clear-history'),
            colorPreview: document.getElementById('color-preview'),
            hexValue: document.getElementById('hex-value'),
            rgbValue: document.getElementById('rgb-value'),
            hslValue: document.getElementById('hsl-value'),
            colorHistoryContainer: document.getElementById('color-history'),
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notification-text')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startCamera());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseDetection());
        this.elements.captureBtn.addEventListener('click', () => this.captureColor());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Click on video to detect color at that point
        this.video.addEventListener('click', (e) => this.detectColorAtPoint(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    facingMode: 'environment'
                } 
            });
            
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.startDetection();
                this.updateButtonStates(true);
                this.showNotification('Camera started successfully!', 'success');
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showNotification('Failed to access camera. Please check permissions.', 'error');
        }
    }

    startDetection() {
        this.isDetectionActive = true;
        this.detectColor();
    }

    pauseDetection() {
        this.isDetectionActive = !this.isDetectionActive;
        
        if (this.isDetectionActive) {
            this.detectColor();
            this.elements.pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
            this.showNotification('Detection resumed', 'success');
        } else {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            this.elements.pauseBtn.innerHTML = '<span class="btn-icon">▶️</span> Resume';
            this.showNotification('Detection paused', 'success');
        }
    }

    detectColor() {
        if (!this.isDetectionActive) return;

        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Get color from center of video
        const centerX = Math.floor(this.canvas.width / 2);
        const centerY = Math.floor(this.canvas.height / 2);
        
        const imageData = this.ctx.getImageData(centerX, centerY, 1, 1);
        const [r, g, b] = imageData.data;
        
        this.updateColorDisplay(r, g, b);
        
        this.animationFrame = requestAnimationFrame(() => this.detectColor());
    }

    detectColorAtPoint(event) {
        if (!this.video.videoWidth) return;

        const rect = this.video.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);
        
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.ctx.getImageData(x, y, 1, 1);
        const [r, g, b] = imageData.data;
        
        this.updateColorDisplay(r, g, b);
        this.captureColor();
        
        // Visual feedback
        this.elements.colorPreview.classList.add('active');
        setTimeout(() => this.elements.colorPreview.classList.remove('active'), 300);
    }

    updateColorDisplay(r, g, b) {
        const hex = this.rgbToHex(r, g, b);
        const hsl = this.rgbToHsl(r, g, b);
        
        this.elements.colorPreview.style.backgroundColor = hex;
        this.elements.hexValue.textContent = hex;
        this.elements.rgbValue.textContent = `${r}, ${g}, ${b}`;
        this.elements.hslValue.textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
        
        // Store current color for capture
        this.currentColor = { r, g, b, hex };
    }

    captureColor() {
        if (!this.currentColor) return;
        
        const colorData = {
            ...this.currentColor,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        // Avoid duplicates
        if (!this.colorHistory.some(color => color.hex === colorData.hex)) {
            this.colorHistory.unshift(colorData);
            
            // Limit history size
            if (this.colorHistory.length > 50) {
                this.colorHistory = this.colorHistory.slice(0, 50);
            }
            
            this.updateColorHistory();
            this.saveColorHistory();
            this.showNotification(`Color ${colorData.hex} captured!`, 'success');
        } else {
            this.showNotification('Color already in history', 'warning');
        }
    }

    updateColorHistory() {
        this.elements.colorHistoryContainer.innerHTML = '';
        
        this.colorHistory.forEach(color => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item fade-in';
            historyItem.style.backgroundColor = color.hex;
            historyItem.setAttribute('data-color', color.hex);
            historyItem.title = `${color.hex} - Click to copy`;
            
            historyItem.addEventListener('click', () => {
                this.copyToClipboard(color.hex);
                this.updateColorDisplay(color.r, color.g, color.b);
            });
            
            this.elements.colorHistoryContainer.appendChild(historyItem);
        });
    }

    clearHistory() {
        this.colorHistory = [];
        this.updateColorHistory();
        this.saveColorHistory();
        this.showNotification('Color history cleared', 'success');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(`${text} copied to clipboard!`, 'success');
        }).catch(() => {
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }

    updateButtonStates(cameraActive) {
        this.elements.startBtn.disabled = cameraActive;
        this.elements.pauseBtn.disabled = !cameraActive;
        this.elements.captureBtn.disabled = !cameraActive;
        
        if (cameraActive) {
            this.elements.startBtn.innerHTML = '<span class="btn-icon">✅</span> Camera Active';
        }
    }

    handleKeyboard(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.captureColor();
                break;
            case 'KeyP':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.pauseDetection();
                }
                break;
            case 'KeyC':
                if (event.ctrlKey && this.currentColor) {
                    event.preventDefault();
                    this.copyToClipboard(this.currentColor.hex);
                }
                break;
        }
    }

    showNotification(message, type = 'success') {
        this.elements.notificationText.textContent = message;
        this.elements.notification.className = `notification ${type}`;
        this.elements.notification.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.notification.classList.add('hidden');
        }, 3000);
    }

    // Utility functions
    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("").toUpperCase();
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    saveColorHistory() {
        localStorage.setItem('colorHistory', JSON.stringify(this.colorHistory));
    }

    loadColorHistory() {
        const saved = localStorage.getItem('colorHistory');
        if (saved) {
            this.colorHistory = JSON.parse(saved);
            this.updateColorHistory();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorDetectionApp();
});
