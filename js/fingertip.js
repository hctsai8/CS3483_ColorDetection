const video = document.getElementById('video');
const colorCodeDisplay = document.getElementById('color-code');

// Create a canvas to process video frames
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Class for Fingertip Color Detection
class FingertipColorDetection {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cursor = document.getElementById('cursor');
        this.colorHistory = [];
        this.currentColor = null;
        this.isHandDetected = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadColorHistory();
        this.createColorDetectionPopup();
        this.initializeHandTracking();
    }

    initializeElements() {
        this.elements = {
            colorPreview: document.getElementById('color-preview'),
            hexValue: document.getElementById('hex-value'),
            rgbValue: document.getElementById('rgb-value'),
            hslValue: document.getElementById('hsl-value'),
            colorHistoryContainer: document.getElementById('color-history'),
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notification-text'),
            cameraStatus: document.getElementById('camera-status'),
            handStatus: document.getElementById('hand-status'),
            copyHexBtn: document.getElementById('copy-hex'),
            saveColorBtn: document.getElementById('save-color'),
            saveColorControlBtn: document.getElementById('save-color-control'),
            clearHistoryBtn: document.getElementById('clear-history')
        };

        // Debug: Check if notification elements exist
        console.log('Notification element:', this.elements.notification);
        console.log('Notification text element:', this.elements.notificationText);
        
        // If elements don't exist, log error
        if (!this.elements.notification || !this.elements.notificationText) {
            console.error('Notification elements not found in DOM');
        }
    }

    bindEvents() {
        this.elements.copyHexBtn.addEventListener('click', () => this.copyCurrentColor());
        this.elements.saveColorBtn.addEventListener('click', () => this.saveCurrentColor());
        this.elements.saveColorControlBtn.addEventListener('click', () => this.saveCurrentColor());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    createColorDetectionPopup() {
        this.colorPopup = document.createElement('div');
        this.colorPopup.className = 'color-detection-popup';
        this.colorPopup.innerHTML = `
            <button class="popup-close" title="Close">&times;</button>
            <div class="popup-header">
                <span>🖐️</span>
                Color Detected by Fingertip
            </div>
            <div class="popup-color-info">
                <div class="popup-color-swatch"></div>
                <div class="popup-color-details">
                    <div class="popup-color-value popup-hex"></div>
                    <div class="popup-color-value popup-rgb"></div>
                    <div class="popup-color-value popup-hsl"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.colorPopup);
        
        this.colorPopup.querySelector('.popup-close').addEventListener('click', () => {
            this.hideColorPopup();
        });
        
        this.popupTimeout = null;
    }

    initializeHandTracking() {
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        
        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        // Set up the camera
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({ image: this.video });
            },
            width: 1280,
            height: 720,
        });

        // Listen for hand landmarks
        this.hands.onResults((results) => this.onHandResults(results));
        
        // Start camera
        this.camera.start().then(() => {
            this.updateCameraStatus('🟢 Camera active', 'connected');
            this.showNotification('Hand tracking initialized! Point your index finger at colors.', 'success');
        }).catch((error) => {
            this.updateCameraStatus('🔴 Camera error', 'error');
            this.showNotification('Failed to access camera. Please check permissions.', 'error');
        });
    }

    onHandResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const indexFingerTip = landmarks[8]; // Index finger tip landmark

            // Convert normalized coordinates to video coordinates
            const videoRect = this.video.getBoundingClientRect();
            
            // PRECISION VARIABLES - Adjust these to improve cursor accuracy
            const OFFSET_X = -75;    // Horizontal offset adjustment (positive = right, negative = left)
            const OFFSET_Y = -150;   // Vertical offset adjustment (positive = down, negative = up)
            const SCALE_X = 1.0;     // Horizontal scaling factor
            const SCALE_Y = 1.0;     // Vertical scaling factor
            
            // DETECTION AREA EXPANSION - Allow cursor to be shown even when fingertip is near edges
            const DETECTION_MARGIN_X = 200; // Extra horizontal detection area (pixels)
            const DETECTION_MARGIN_Y = 300; // Extra vertical detection area (pixels)
            
            // Apply scaling and offset adjustments
            const x = (indexFingerTip.x * videoRect.width * SCALE_X) + OFFSET_X;
            const y = (indexFingerTip.y * videoRect.height * SCALE_Y) + OFFSET_Y;

            // Check if fingertip is within expanded detection area
            const fingertipX = indexFingerTip.x * videoRect.width;
            const fingertipY = indexFingerTip.y * videoRect.height;
            
            const isInExpandedArea = (
                fingertipX >= -DETECTION_MARGIN_X && 
                fingertipX <= videoRect.width + DETECTION_MARGIN_X &&
                fingertipY >= -DETECTION_MARGIN_Y && 
                fingertipY <= videoRect.height + DETECTION_MARGIN_Y
            );

            if (isInExpandedArea) {
                // Update cursor position
                this.updateCursor(x + videoRect.left, y + videoRect.top);
                
                // Detect color at cursor position
                this.detectColorAtCursor();
                
                if (!this.isHandDetected) {
                    this.isHandDetected = true;
                    this.updateHandStatus('🖐️ Hand detected - Move finger to detect colors', 'detected');
                    this.elements.saveColorControlBtn.disabled = false;
                }
            } else {
                // Fingertip is outside expanded detection area
                this.cursor.style.display = 'none';
                if (this.isHandDetected) {
                    this.isHandDetected = false;
                    this.updateHandStatus('🖐️ Move finger closer to video area', 'lost');
                    this.elements.saveColorControlBtn.disabled = true;
                }
            }
        } else {
            this.cursor.style.display = 'none';
            if (this.isHandDetected) {
                this.isHandDetected = false;
                this.updateHandStatus('🖐️ Show your index finger to the camera', 'lost');
                this.elements.saveColorControlBtn.disabled = true;
            }
        }
    }

    updateCursor(x, y) {
        // ADDITIONAL FINE-TUNING VARIABLES
        const CURSOR_FINE_TUNE_X = 0;  // Additional X adjustment
        const CURSOR_FINE_TUNE_Y = 0;  // Additional Y adjustment
        
        const finalX = x + CURSOR_FINE_TUNE_X;
        const finalY = y + CURSOR_FINE_TUNE_Y;
        
        // Always show cursor, even if it's slightly outside video bounds
        this.cursor.style.left = `${finalX}px`;
        this.cursor.style.top = `${finalY}px`;
        this.cursor.style.display = 'block';
        
        // Store cursor position for color detection
        this.cursorPosition = { x: finalX, y: finalY };
        
        // Debug: Log cursor position
        console.log(`Cursor position: (${finalX.toFixed(1)}, ${finalY.toFixed(1)})`);
    }

    detectColorAtCursor() {
        if (!this.cursorPosition || !this.video.videoWidth || !this.video.videoHeight) return;

        // Get cursor position relative to video
        const videoRect = this.video.getBoundingClientRect();
        const cursorRect = this.cursor.getBoundingClientRect();
        
        // Calculate the cursor's center position relative to the video
        const cursorCenterX = cursorRect.left + cursorRect.width / 2 - videoRect.left;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2 - videoRect.top;
        
        // Convert to video coordinates (normalized to video dimensions)
        const videoX = (cursorCenterX / videoRect.width) * this.video.videoWidth;
        const videoY = (cursorCenterY / videoRect.height) * this.video.videoHeight;
        
        // Ensure coordinates are within video bounds for color detection
        // Even if cursor is outside, we clamp to nearest edge pixel
        const x = Math.max(0, Math.min(Math.floor(videoX), this.video.videoWidth - 1));
        const y = Math.max(0, Math.min(Math.floor(videoY), this.video.videoHeight - 1));

        try {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            const pixelData = this.ctx.getImageData(x, y, 1, 1).data;
            const [r, g, b] = pixelData;

            this.updateColorDisplay(r, g, b);
            
            // Debug: Log the detection coordinates
            console.log(`Detecting color at cursor position: video(${x}, ${y}), cursor(${cursorCenterX.toFixed(1)}, ${cursorCenterY.toFixed(1)})`);
        } catch (error) {
            console.error('Error detecting color at cursor:', error);
        }
    }

    updateColorDisplay(r, g, b) {
        const hex = this.rgbToHex(r, g, b);
        const hsl = this.rgbToHsl(r, g, b);
        
        this.elements.colorPreview.style.backgroundColor = hex;
        this.elements.hexValue.textContent = hex;
        this.elements.rgbValue.textContent = `${r}, ${g}, ${b}`;
        this.elements.hslValue.textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
        
        this.currentColor = { r, g, b, hex, hsl };
    }

    copyCurrentColor() {
        if (!this.currentColor) {
            this.showNotification('No color to copy', 'error');
            return;
        }
        
        this.copyToClipboard(this.currentColor.hex);
    }

    saveCurrentColor() {
        if (!this.currentColor) {
            this.showNotification('No color to save', 'error');
            return;
        }
        
        const colorData = {
            ...this.currentColor,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        if (!this.colorHistory.some(color => color.hex === colorData.hex)) {
            this.colorHistory.unshift(colorData);
            
            if (this.colorHistory.length > 12) {
                this.colorHistory = this.colorHistory.slice(0, 12);
            }
            
            this.updateColorHistory();
            this.saveColorHistory();
            this.showColorPopup(colorData);
            
            this.elements.colorPreview.classList.add('active');
            setTimeout(() => this.elements.colorPreview.classList.remove('active'), 300);
        } else {
            this.showNotification('Color already in history', 'warning');
        }
    }

    showColorPopup(colorData) {
        const swatch = this.colorPopup.querySelector('.popup-color-swatch');
        const hexEl = this.colorPopup.querySelector('.popup-hex');
        const rgbEl = this.colorPopup.querySelector('.popup-rgb');
        const hslEl = this.colorPopup.querySelector('.popup-hsl');
        
        swatch.style.backgroundColor = colorData.hex;
        hexEl.textContent = `HEX: ${colorData.hex}`;
        rgbEl.textContent = `RGB: ${colorData.r}, ${colorData.g}, ${colorData.b}`;
        hslEl.textContent = `HSL: ${colorData.hsl.h}°, ${colorData.hsl.s}%, ${colorData.hsl.l}%`;
        
        this.colorPopup.classList.add('show');
        
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
        }
        
        this.popupTimeout = setTimeout(() => {
            this.hideColorPopup();
        }, 3000);
    }

    hideColorPopup() {
        this.colorPopup.classList.remove('show');
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
            this.popupTimeout = null;
        }
    }

    updateColorHistory() {
        this.elements.colorHistoryContainer.innerHTML = '';
        
        this.colorHistory.forEach((color) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item fade-in';
            historyItem.style.backgroundColor = color.hex;
            historyItem.setAttribute('data-color', color.hex);
            historyItem.title = `${color.hex} - Click to copy`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = 'Delete this color';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteColor(color.id);
            });
            
            historyItem.addEventListener('click', () => {
                this.copyToClipboard(color.hex);
                this.updateColorDisplay(color.r, color.g, color.b);
            });
            
            historyItem.appendChild(deleteBtn);
            this.elements.colorHistoryContainer.appendChild(historyItem);
        });
        
        const countDisplay = document.createElement('div');
        countDisplay.className = 'history-count';
        countDisplay.textContent = `${this.colorHistory.length}/12 colors`;
        this.elements.colorHistoryContainer.appendChild(countDisplay);
    }

    deleteColor(colorId) {
        const colorIndex = this.colorHistory.findIndex(color => color.id === colorId);
        if (colorIndex !== -1) {
            const deletedColor = this.colorHistory[colorIndex];
            this.colorHistory.splice(colorIndex, 1);
            this.updateColorHistory();
            this.saveColorHistory();
            this.showNotification(`Color ${deletedColor.hex} deleted`, 'success');
        }
    }

    clearHistory() {
        this.colorHistory = [];
        this.updateColorHistory();
        this.saveColorHistory();
        this.showNotification('Color history cleared', 'success');
    }

    copyToClipboard(text) {
        console.log('Attempting to copy to clipboard:', text); // Debug log
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Successfully copied to clipboard'); // Debug log
                this.showNotification(`${text} copied to clipboard!`, 'success');
            }).catch((error) => {
                console.error('Failed to copy to clipboard:', error); // Debug log
                this.showNotification('Failed to copy to clipboard', 'error');
            });
        } else {
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification(`${text} copied to clipboard!`, 'success');
            } catch (error) {
                console.error('Fallback copy failed:', error);
                this.showNotification('Failed to copy to clipboard', 'error');
            }
        }
    }

    updateCameraStatus(status, type) {
        this.elements.cameraStatus.textContent = status;
        this.elements.cameraStatus.className = `camera-status ${type}`;
    }

    updateHandStatus(status, type) {
        this.elements.handStatus.textContent = status;
        this.elements.handStatus.className = `hand-status ${type}`;
    }

    handleKeyboard(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.saveCurrentColor();
                break;
            case 'KeyC':
                if (event.ctrlKey && this.currentColor) {
                    event.preventDefault();
                    this.copyCurrentColor();
                }
                break;
        }
    }

    showNotification(message, type = 'success') {
        console.log('showNotification called with:', message, type); // Debug log
        
        // Check if elements exist
        if (!this.elements.notification || !this.elements.notificationText) {
            console.error('Notification elements not available');
            return;
        }

        try {
            // Set the notification content
            this.elements.notificationText.textContent = message;
            
            // Set the notification class
            this.elements.notification.className = `notification ${type}`;
            
            // Show the notification
            this.elements.notification.classList.remove('hidden');
            
            console.log('Notification should be visible now'); // Debug log
            
            // Hide after 3 seconds
            setTimeout(() => {
                if (this.elements.notification) {
                    this.elements.notification.classList.add('hidden');
                    console.log('Notification hidden'); // Debug log
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error in showNotification:', error);
        }
    }

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
        localStorage.setItem('fingertipColorHistory', JSON.stringify(this.colorHistory));
    }

    loadColorHistory() {
        const saved = localStorage.getItem('fingertipColorHistory');
        if (saved) {
            this.colorHistory = JSON.parse(saved);
            this.updateColorHistory();
        }
    }

    cleanup() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FingertipColorDetection();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });
});
