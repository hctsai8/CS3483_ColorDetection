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
        this.pausedCanvas = document.getElementById('paused-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.pausedCtx = this.pausedCanvas.getContext('2d');
        this.colorHistory = [];
        this.isPaused = false;
        this.currentColor = null;
        this.stream = null;
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseOverVideo = false;
        this.isCameraInitialized = false;
        this.permissionGranted = false;
        
        this.createColorDetectionPopup();
        this.initializeElements();
        this.bindEvents();
        this.loadColorHistory();
        this.checkCameraPermissions();
    }

    createColorDetectionPopup() {
        // Create popup element
        this.colorPopup = document.createElement('div');
        this.colorPopup.className = 'color-detection-popup';
        this.colorPopup.innerHTML = `
            <button class="popup-close" title="Close">&times;</button>
            <div class="popup-header">
                <span>🎨</span>
                Color Detected & Saved
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
        
        // Bind close button
        this.colorPopup.querySelector('.popup-close').addEventListener('click', () => {
            this.hideColorPopup();
        });
        
        // Auto-hide after delay
        this.popupTimeout = null;
    }

    initializeElements() {
        this.elements = {
            pauseBtn: document.getElementById('pause-btn'),
            clearHistoryBtn: document.getElementById('clear-history'),
            copyHexBtn: document.getElementById('copy-hex'),
            saveColorBtn: document.getElementById('save-color'),
            colorPreview: document.getElementById('color-preview'),
            hexValue: document.getElementById('hex-value'),
            rgbValue: document.getElementById('rgb-value'),
            hslValue: document.getElementById('hsl-value'),
            colorHistoryContainer: document.getElementById('color-history'),
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notification-text'),
            cameraStatus: document.getElementById('camera-status'),
            videoWrapper: document.querySelector('.video-wrapper')
        };
    }

    bindEvents() {
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.elements.copyHexBtn.addEventListener('click', () => this.copyCurrentColor());
        this.elements.saveColorBtn.addEventListener('click', () => this.saveCurrentColor());
        
        // Mouse tracking on video
        this.video.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.video.addEventListener('mouseenter', () => this.isMouseOverVideo = true);
        this.video.addEventListener('mouseleave', () => this.isMouseOverVideo = false);
        this.video.addEventListener('click', (e) => this.handleVideoClick(e));
        
        // Mouse tracking on paused canvas
        this.pausedCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.pausedCanvas.addEventListener('mouseenter', () => this.isMouseOverVideo = true);
        this.pausedCanvas.addEventListener('mouseleave', () => this.isMouseOverVideo = false);
        this.pausedCanvas.addEventListener('click', (e) => this.handleVideoClick(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Handle video events
        this.video.addEventListener('loadedmetadata', () => this.onVideoLoaded());
        this.video.addEventListener('error', (e) => this.onVideoError(e));
    }

    async checkCameraPermissions() {
        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                
                switch (permission.state) {
                    case 'granted':
                        this.permissionGranted = true;
                        this.startCamera();
                        break;
                    case 'denied':
                        this.updateCameraStatus('🔴 Camera permission denied', 'error');
                        this.showNotification('Camera access denied. Please enable camera permissions in browser settings.', 'error');
                        break;
                    case 'prompt':
                        this.startCamera();
                        break;
                }

                permission.addEventListener('change', () => {
                    if (permission.state === 'granted' && !this.isCameraInitialized) {
                        this.permissionGranted = true;
                        this.startCamera();
                    } else if (permission.state === 'denied') {
                        this.handleCameraError(new Error('Camera permission denied'));
                        this.stopCamera();
                    }
                });
            } else {
                setTimeout(() => {
                    this.startCamera();
                }, 100);
            }
        } catch (error) {
            console.warn('Permissions API not fully supported:', error);
            setTimeout(() => {
                this.startCamera();
            }, 100);
        }
    }

    async startCamera() {
        if (this.isCameraInitialized || this.stream) {
            console.log('Camera already initialized or stream exists');
            return;
        }

        try {
            this.updateCameraStatus('🔴 Connecting to camera...', 'connecting');
            
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera access not supported in this browser');
            }

            let constraints = {
                video: {
                    width: { ideal: 1280, min: 320 },
                    height: { ideal: 720, min: 240 }
                }
            };

            try {
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                this.permissionGranted = true;
            } catch (error) {
                if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                    console.warn('Camera constraints too restrictive, trying basic setup:', error);
                    constraints = { video: true };
                    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                    this.permissionGranted = true;
                } else {
                    throw error;
                }
            }
            
            this.video.srcObject = this.stream;
            this.isCameraInitialized = true;
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.handleCameraError(error);
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('Camera track stopped:', track.kind);
            });
            this.stream = null;
        }
        this.isCameraInitialized = false;
        this.video.srcObject = null;
    }

    onVideoLoaded() {
        console.log('Video loaded successfully');
        console.log('Video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
        
        if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
            console.error('Video dimensions are zero');
            this.handleCameraError(new Error('Invalid video dimensions'));
            return;
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.pausedCanvas.width = this.video.videoWidth;
        this.pausedCanvas.height = this.video.videoHeight;
        
        this.updateCameraStatus('🟢 Camera active', 'connected');
        this.showNotification('Camera started successfully! Move mouse over video to detect colors.', 'success');
    }

    onVideoError(event) {
        console.error('Video error:', event);
        this.handleCameraError(new Error('Video playback error'));
    }

    handleCameraError(error) {
        let errorMessage = 'Failed to access camera. ';
        let suggestions = [];
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage += 'Camera permission was denied.';
            suggestions = [
                '1. Click the camera icon in the address bar',
                '2. Select "Always allow" for this site',
                '3. Refresh the page'
            ];
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage += 'No camera device found.';
            suggestions = [
                '1. Make sure your camera is connected',
                '2. Check if camera drivers are installed',
                '3. Try refreshing the page'
            ];
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Camera not supported in this browser.';
            suggestions = [
                '1. Try using Chrome or Edge browser',
                '2. Make sure you\'re using HTTPS',
                '3. Update your browser'
            ];
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage += 'Camera is being used by another application.';
            suggestions = [
                '1. Close other camera applications',
                '2. Close other browser tabs using camera',
                '3. Restart your browser'
            ];
        } else if (error.name === 'OverconstrainedError') {
            errorMessage += 'Camera constraints not supported.';
            suggestions = [
                '1. Your camera may not support the required resolution',
                '2. Try refreshing the page',
                '3. Try a different browser'
            ];
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
            suggestions = [
                '1. Refresh the page',
                '2. Check camera permissions',
                '3. Try a different browser'
            ];
        }
        
        this.updateCameraStatus('🔴 Camera error', 'error');
        this.showNotification(errorMessage, 'error');
        
        setTimeout(() => {
            this.showNotification(suggestions.join(' | '), 'error');
        }, 4000);
        
        this.isCameraInitialized = false;
    }

    handleMouseMove(event) {
        if (!this.video.videoWidth || !this.video.videoHeight) return;

        const rect = event.target.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mousePosition.x = Math.floor((event.clientX - rect.left) * scaleX);
        this.mousePosition.y = Math.floor((event.clientY - rect.top) * scaleY);
        
        this.detectColorAtPosition();
    }

    detectColorAtPosition() {
        if (!this.isMouseOverVideo || this.mousePosition.x < 0 || this.mousePosition.y < 0) return;
        if (!this.video.videoWidth || !this.video.videoHeight) return;

        try {
            if (this.isPaused) {
                const imageData = this.pausedCtx.getImageData(this.mousePosition.x, this.mousePosition.y, 1, 1);
                const [r, g, b] = imageData.data;
                this.updateColorDisplay(r, g, b);
            } else {
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                const imageData = this.ctx.getImageData(this.mousePosition.x, this.mousePosition.y, 1, 1);
                const [r, g, b] = imageData.data;
                this.updateColorDisplay(r, g, b);
            }
        } catch (error) {
            console.error('Error detecting color:', error);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            try {
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                this.pausedCtx.drawImage(this.canvas, 0, 0);
                
                this.video.style.display = 'none';
                this.pausedCanvas.style.display = 'block';
                
                if (this.isMouseOverVideo) {
                    this.detectColorAtPosition();
                }
            } catch (error) {
                console.error('Error pausing video:', error);
                this.showNotification('Error pausing video', 'error');
                return;
            }
            
            this.elements.pauseBtn.innerHTML = '<span class="btn-icon">▶️</span> Resume Video';
            this.elements.videoWrapper.classList.add('paused');
            this.updateCameraStatus('⏸️ Video paused', 'paused');
            this.showNotification('Video paused - frame captured', 'success');
        } else {
            this.pausedCanvas.style.display = 'none';
            this.video.style.display = 'block';
            
            this.elements.pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause Video';
            this.elements.videoWrapper.classList.remove('paused');
            this.updateCameraStatus('🟢 Camera active', 'connected');
            this.showNotification('Video resumed', 'success');
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

    handleVideoClick(event) {
        // Get the color at click position
        if (!this.video.videoWidth || !this.video.videoHeight) return;

        const rect = event.target.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const clickX = Math.floor((event.clientX - rect.left) * scaleX);
        const clickY = Math.floor((event.clientY - rect.top) * scaleY);

        try {
            let r, g, b;
            
            if (this.isPaused) {
                const imageData = this.pausedCtx.getImageData(clickX, clickY, 1, 1);
                [r, g, b] = imageData.data;
            } else {
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                const imageData = this.ctx.getImageData(clickX, clickY, 1, 1);
                [r, g, b] = imageData.data;
            }
            
            // Update current color display
            this.updateColorDisplay(r, g, b);
            
            // Save the color and show popup
            this.saveCurrentColorWithPopup();
            
        } catch (error) {
            console.error('Error detecting color on click:', error);
        }
    }

    saveCurrentColorWithPopup() {
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
            
            // Show popup with color info
            this.showColorPopup(colorData);
            
            // Visual feedback on color preview
            this.elements.colorPreview.classList.add('active');
            setTimeout(() => this.elements.colorPreview.classList.remove('active'), 300);
        } else {
            this.showNotification('Color already in history', 'warning');
        }
    }

    showColorPopup(colorData) {
        // Update popup content
        const swatch = this.colorPopup.querySelector('.popup-color-swatch');
        const hexEl = this.colorPopup.querySelector('.popup-hex');
        const rgbEl = this.colorPopup.querySelector('.popup-rgb');
        const hslEl = this.colorPopup.querySelector('.popup-hsl');
        
        swatch.style.backgroundColor = colorData.hex;
        hexEl.textContent = `HEX: ${colorData.hex}`;
        rgbEl.textContent = `RGB: ${colorData.r}, ${colorData.g}, ${colorData.b}`;
        hslEl.textContent = `HSL: ${colorData.hsl.h}°, ${colorData.hsl.s}%, ${colorData.hsl.l}%`;
        
        // Show popup
        this.colorPopup.classList.add('show');
        
        // Clear existing timeout
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
        }
        
        // Auto-hide after 3 seconds
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

    saveCurrentColor() {
        // This is for the save button - no popup
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
            this.showNotification(`Color ${colorData.hex} saved!`, 'success');
            
            this.elements.colorPreview.classList.add('active');
            setTimeout(() => this.elements.colorPreview.classList.remove('active'), 300);
        } else {
            this.showNotification('Color already in history', 'warning');
        }
    }

    updateColorHistory() {
        this.elements.colorHistoryContainer.innerHTML = '';
        
        this.colorHistory.forEach((color, index) => {
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
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(`${text} copied to clipboard!`, 'success');
        }).catch(() => {
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }

    updateCameraStatus(status, type) {
        this.elements.cameraStatus.textContent = status;
        this.elements.cameraStatus.className = `camera-status ${type}`;
    }

    handleKeyboard(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.saveCurrentColor();
                break;
            case 'KeyP':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.togglePause();
                }
                break;
            case 'KeyC':
                if (event.ctrlKey && this.currentColor) {
                    event.preventDefault();
                    this.copyCurrentColor();
                }
                break;
            case 'KeyR':
                if (event.ctrlKey && event.shiftKey) {
                    event.preventDefault();
                    this.retryCamera();
                    this.showNotification('Retrying camera connection...', 'success');
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

    retryCamera() {
        this.stopCamera();
        setTimeout(() => {
            this.startCamera();
        }, 1000);
    }

    cleanup() {
        this.stopCamera();
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
        }
    }
}

// Initialize the app when DOM is fully loaded - SINGLE INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const app = new ColorDetectionApp();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });
    
    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('Page hidden');
        } else {
            console.log('Page visible');
        }
    });
});
