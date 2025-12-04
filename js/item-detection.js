class ItemDetection {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.selectedItemImage = document.getElementById('selected-item-image');
        this.overlayItemName = document.getElementById('overlay-item-name');
        this.itemGallery = document.getElementById('item-gallery');
        this.currentItemName = document.getElementById('current-item-name');
        this.currentPosition = document.getElementById('current-position');
        this.imagePlaceholder = document.getElementById('image-placeholder');
        this.itemPreviewOverlay = document.getElementById('item-preview-overlay');
        this.imageContainer = document.getElementById('item-image-container');
        this.overlayLabel = document.getElementById('item-overlay-label');
        this.dragHandle = document.getElementById('drag-handle');
        
        this.currentItemImage = null;
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        this.currentSize = 'medium';
        this.isDragging = false;
        this.startMousePos = { x: 0, y: 0 };
        this.startItemPos = { x: 0, y: 0 };
        
        this.init();
    }

    async init() {
        await this.setupCamera();
        this.setupEventListeners();
        this.setupHoverEffects();
        this.setupDragAndDrop();
        this.loadGalleryImages();
        this.hideOverlay();
    }

    setupHoverEffects() {
        // Add hover effects to the item container
        if (this.imageContainer) {
            this.imageContainer.addEventListener('mouseenter', () => {
                this.onItemHover();
            });

            this.imageContainer.addEventListener('mouseleave', () => {
                this.onItemLeave();
            });
        }
    }

    onItemHover() {
        // Add hover class for additional styling if needed
        this.imageContainer.classList.add('hovered');
        
        // Optional: Add some visual feedback
        console.log('Hovering over item:', this.overlayItemName.textContent);
    }

    onItemLeave() {
        // Remove hover class
        this.imageContainer.classList.remove('hovered');
    }

    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            this.video.srcObject = stream;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            });
            
            document.getElementById('camera-indicator').textContent = '🟢 Camera active';
        } catch (error) {
            console.error('Camera access error:', error);
            document.getElementById('camera-indicator').textContent = '🔴 Camera not available';
        }
    }

    setupEventListeners() {
        // Gallery item selection
        this.itemGallery.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                this.selectItem(galleryItem);
            }
        });

        // Item suggestion clicks
        document.querySelectorAll('.item-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', (e) => {
                const item = e.target.dataset.item || e.target.closest('.item-suggestion').dataset.item;
                const image = e.target.dataset.image || e.target.closest('.item-suggestion').dataset.image;
                if (item && image) {
                    this.setCurrentItem(item, image);
                    // Update gallery selection
                    const galleryItem = this.itemGallery.querySelector(`[data-item="${item}"]`);
                    if (galleryItem) {
                        this.updateGallerySelection(galleryItem);
                    }
                }
            });
        });

        // Size control buttons
        document.getElementById('size-small').addEventListener('click', () => this.resizeOverlay('small'));
        document.getElementById('size-medium').addEventListener('click', () => this.resizeOverlay('medium'));
        document.getElementById('size-large').addEventListener('click', () => this.resizeOverlay('large'));
    }

    setupDragAndDrop() {
        let startX, startY, initialLeft, initialTop;

        // Mouse events
        this.itemPreviewOverlay.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.itemPreviewOverlay.classList.add('dragging');
            
            const container = this.itemPreviewOverlay.parentElement;
            const containerRect = container.getBoundingClientRect();
            const overlayRect = this.itemPreviewOverlay.getBoundingClientRect();
            
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = overlayRect.left - containerRect.left;
            initialTop = overlayRect.top - containerRect.top;
            
            e.preventDefault();
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const container = this.itemPreviewOverlay.parentElement;
            const containerRect = container.getBoundingClientRect();
            const overlayWidth = this.itemPreviewOverlay.offsetWidth;
            const overlayHeight = this.itemPreviewOverlay.offsetHeight;
            
            let newLeft = initialLeft + (e.clientX - startX);
            let newTop = initialTop + (e.clientY - startY);
            
            // Constrain within camera bounds
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - overlayWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - overlayHeight));
            
            this.itemPreviewOverlay.style.left = newLeft + 'px';
            this.itemPreviewOverlay.style.top = newTop + 'px';
            this.itemPreviewOverlay.style.transform = 'none';
            
            this.updatePosition(newLeft, newTop, containerRect.width, containerRect.height);
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.itemPreviewOverlay.classList.remove('dragging');
                document.body.style.userSelect = '';
            }
        });

        // Touch events for mobile
        this.itemPreviewOverlay.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.isDragging = true;
            this.itemPreviewOverlay.classList.add('dragging');
            
            const container = this.itemPreviewOverlay.parentElement;
            const containerRect = container.getBoundingClientRect();
            const overlayRect = this.itemPreviewOverlay.getBoundingClientRect();
            
            startX = touch.clientX;
            startY = touch.clientY;
            initialLeft = overlayRect.left - containerRect.left;
            initialTop = overlayRect.top - containerRect.top;
            
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            
            const touch = e.touches[0];
            const container = this.itemPreviewOverlay.parentElement;
            const containerRect = container.getBoundingClientRect();
            const overlayWidth = this.itemPreviewOverlay.offsetWidth;
            const overlayHeight = this.itemPreviewOverlay.offsetHeight;
            
            let newLeft = initialLeft + (touch.clientX - startX);
            let newTop = initialTop + (touch.clientY - startY);
            
            newLeft = Math.max(0, Math.min(newLeft, containerRect.width - overlayWidth));
            newTop = Math.max(0, Math.min(newTop, containerRect.height - overlayHeight));
            
            this.itemPreviewOverlay.style.left = newLeft + 'px';
            this.itemPreviewOverlay.style.top = newTop + 'px';
            this.itemPreviewOverlay.style.transform = 'none';
            
            this.updatePosition(newLeft, newTop, containerRect.width, containerRect.height);
        });

        document.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.itemPreviewOverlay.classList.remove('dragging');
            }
        });
    }

    loadGalleryImages() {
        // Load gallery images
        const galleryItems = this.itemGallery.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            const basePath = item.dataset.image;
            const img = item.querySelector('img');
            if (img && basePath) {
                this.tryLoadImageWithFormats(basePath, img, false);
            }
        });

        // Load sidebar suggestion images
        document.querySelectorAll('.item-suggestion').forEach(suggestion => {
            const basePath = suggestion.dataset.image;
            const img = suggestion.querySelector('img');
            if (img && basePath) {
                this.tryLoadImageWithFormats(basePath, img, false);
            }
        });
    }

    tryLoadImageWithFormats(basePath, imgElement, isMainImage = true) {
        let formatIndex = 0;
        
        const tryNextFormat = () => {
            if (formatIndex >= this.supportedFormats.length) {
                console.log(`No image found for: ${basePath}`);
                
                if (isMainImage) {
                    // Show emoji placeholder for main image only
                    this.showEmojiPlaceholder(basePath);
                }
                // For gallery/sidebar images, keep emoji placeholder visible if no image found
                return;
            }
            
            const format = this.supportedFormats[formatIndex];
            const fullPath = `${basePath}.${format}`;
            
            const testImg = new Image();
            testImg.onload = () => {
                imgElement.src = fullPath;
                imgElement.style.display = 'block';
                imgElement.classList.add('loaded');
                
                // Hide the emoji placeholder when real image loads
                const placeholder = this.getPlaceholderForImage(imgElement);
                if (placeholder) {
                    placeholder.style.opacity = '0';
                    placeholder.style.display = 'none';
                }
                
                if (isMainImage) {
                    // Hide main image placeholder and show overlay
                    this.imagePlaceholder.style.display = 'none';
                    this.showOverlay();
                }
                
                console.log(`Loaded image: ${fullPath}`);
            };
            
            testImg.onerror = () => {
                formatIndex++;
                tryNextFormat();
            };
            
            testImg.src = fullPath;
        };
        
        tryNextFormat();
    }

    getPlaceholderForImage(imgElement) {
        // Find the corresponding placeholder for this image
        const container = imgElement.closest('.gallery-item') || imgElement.closest('.item-icon');
        if (container) {
            return container.querySelector('.gallery-placeholder, .icon-placeholder');
        }
        return null;
    }

    showEmojiPlaceholder(basePath) {
        // Extract item name from path to get appropriate emoji
        const itemName = basePath.split('/').pop().replace('-', ' ')
                               .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        const emojiMap = {
            'Table Lamp': '💡',
            'Desk Lamp': '🔦',
            'Floor Lamp': '🕯️',
            'Pendant Light': '💡',
            'Ceiling Fan': '🌪️',
            'Wall Sconce': '🕯️'
        };
        
        const emoji = emojiMap[itemName] || '💡';
        this.imagePlaceholder.textContent = emoji;
        this.imagePlaceholder.style.display = 'flex';
        this.selectedItemImage.style.display = 'none';
        this.showOverlay();
    }

    selectItem(galleryItem) {
        this.updateGallerySelection(galleryItem);
        
        const itemName = galleryItem.dataset.item;
        const itemImage = galleryItem.dataset.image;
        
        this.setCurrentItem(itemName, itemImage);
    }

    updateGallerySelection(galleryItem) {
        // Clear all active states
        this.itemGallery.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Set new active item
        galleryItem.classList.add('active');
    }

    setCurrentItem(itemName, itemBasePath) {
        // Update text references
        this.overlayItemName.textContent = itemName;
        if (this.currentItemName) {
            this.currentItemName.textContent = itemName;
        }
        this.currentItemImage = itemBasePath;
        
        // Reset display states
        this.selectedItemImage.style.display = 'none';
        this.selectedItemImage.classList.remove('loaded');
        this.imagePlaceholder.style.display = 'none';
        
        // Try to load main image
        this.tryLoadImageWithFormats(itemBasePath, this.selectedItemImage, true);
    }

    updatePosition(left, top, containerWidth, containerHeight) {
        // Get current position if not provided
        if (left === undefined || top === undefined) {
            const container = this.itemPreviewOverlay.parentElement;
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const itemRect = this.itemPreviewOverlay.getBoundingClientRect();
            
            left = itemRect.left - containerRect.left;
            top = itemRect.top - containerRect.top;
            containerWidth = containerRect.width;
            containerHeight = containerRect.height;
        }
        
        // Calculate center point of item
        const itemWidth = this.itemPreviewOverlay.offsetWidth;
        const itemHeight = this.itemPreviewOverlay.offsetHeight;
        const centerX = left + itemWidth / 2;
        const centerY = top + itemHeight / 2;
        
        const percentX = Math.round((centerX / containerWidth) * 100);
        const percentY = Math.round((centerY / containerHeight) * 100);
        
        // Determine position name
        let positionName = 'Custom';
        if (percentX >= 45 && percentX <= 55 && percentY >= 45 && percentY <= 55) {
            positionName = 'Center';
        } else if (percentX < 25) {
            positionName = percentY < 25 ? 'Top Left' : percentY > 75 ? 'Bottom Left' : 'Left';
        } else if (percentX > 75) {
            positionName = percentY < 25 ? 'Top Right' : percentY > 75 ? 'Bottom Right' : 'Right';
        } else if (percentY < 25) {
            positionName = 'Top';
        } else if (percentY > 75) {
            positionName = 'Bottom';
        }
        
        // Update displays
        if (this.currentPosition) {
            this.currentPosition.textContent = `${positionName} (${percentX}%, ${percentY}%)`;
        }
    }

    showOverlay() {
        this.itemPreviewOverlay.style.display = 'block';
        // Reset position to center when showing new item
        this.resetPosition();
    }

    resetPosition() {
        this.itemPreviewOverlay.style.left = '50%';
        this.itemPreviewOverlay.style.top = '50%';
        this.itemPreviewOverlay.style.transform = 'translate(-50%, -50%)';
        setTimeout(() => this.updatePosition(), 10);
    }

    resizeOverlay(size) {
        const container = this.imageContainer;
        const sizes = {
            small: 100,
            medium: 150,
            large: 200
        };
        
        const newSize = sizes[size] || sizes.medium;
        container.style.width = newSize + 'px';
        container.style.height = newSize + 'px';
        
        // Update active button
        document.querySelectorAll('.size-controls .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`size-${size}`).classList.add('active');
        
        // Update size display
        const sizeDisplay = document.getElementById('current-size');
        if (sizeDisplay) {
            sizeDisplay.textContent = `${newSize}x${newSize} px`;
        }
        
        this.currentSize = size;
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notification-text');
        
        text.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.itemDetection = new ItemDetection();
});
