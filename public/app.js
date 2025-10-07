class PhotoMapApp {
    constructor() {
        this.map = null;
        this.currentPosition = null;
        this.stream = null;
        this.capturedImage = null;
        this.markers = [];
        
        this.init();
    }

    async init() {
        this.initMap();
        this.initEventListeners();
        this.loadPhotos();
        this.updateTime();
        
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
    }

    initMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([40.7128, -74.0060], 13); // Default to NYC

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add custom marker icon
        this.customIcon = L.divIcon({
            className: 'custom-marker',
            html: '📸',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
    }

    initEventListeners() {
        // Map controls
        document.getElementById('locateBtn').addEventListener('click', () => this.locateUser());
        document.getElementById('takePhotoBtn').addEventListener('click', () => this.startCamera());

        // Camera controls
        document.getElementById('captureBtn').addEventListener('click', () => this.capturePhoto());
        document.getElementById('uploadBtn').addEventListener('click', () => this.uploadPhoto());
        document.getElementById('retakeBtn').addEventListener('click', () => this.retakePhoto());
        
        // Clear all photos
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllPhotos());

        // Modal
        const modal = document.getElementById('photoModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async locateUser() {
        this.showLoading('Getting your location...');
        
        try {
            const position = await this.getCurrentPosition();
            this.currentPosition = position;
            
            const { latitude, longitude } = position.coords;
            this.map.setView([latitude, longitude], 15);
            
            // Add user location marker
            L.marker([latitude, longitude], {
                icon: L.divIcon({
                    className: 'user-marker',
                    html: '📍',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                })
            }).addTo(this.map).bindPopup('Your location').openPopup();
            
            this.updateLocationText(latitude, longitude);
            this.hideLoading();
            
        } catch (error) {
            console.error('Error getting location:', error);
            this.hideLoading();
            alert('Unable to get your location. Please make sure location services are enabled.');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    async startCamera() {
        if (!this.currentPosition) {
            alert('Please locate yourself first to get your current position.');
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            const video = document.getElementById('camera');
            video.srcObject = this.stream;
            
            // Enable capture button
            document.getElementById('captureBtn').disabled = false;
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please make sure camera permissions are granted.');
        }
    }

    capturePhoto() {
        const video = document.getElementById('camera');
        const canvas = document.getElementById('canvas');
        const preview = document.getElementById('preview');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob
        canvas.toBlob((blob) => {
            this.capturedImage = blob;
            
            // Show preview
            const url = URL.createObjectURL(blob);
            preview.src = url;
            preview.style.display = 'block';
            video.style.display = 'none';
            
            // Update buttons
            document.getElementById('captureBtn').style.display = 'none';
            document.getElementById('uploadBtn').disabled = false;
            document.getElementById('retakeBtn').style.display = 'block';
            
        }, 'image/jpeg', 0.8);
    }

    retakePhoto() {
        const video = document.getElementById('camera');
        const preview = document.getElementById('preview');
        
        // Show video again
        video.style.display = 'block';
        preview.style.display = 'none';
        
        // Update buttons
        document.getElementById('captureBtn').style.display = 'block';
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('retakeBtn').style.display = 'none';
        
        this.capturedImage = null;
    }

    async uploadPhoto() {
        if (!this.capturedImage || !this.currentPosition) {
            alert('No photo captured or location not available.');
            return;
        }

        this.showLoading('Saving photo locally...');

        try {
            // Create photo data object
            const photoData = {
                id: this.generateId(),
                filename: `photo-${Date.now()}.jpg`,
                latitude: this.currentPosition.coords.latitude,
                longitude: this.currentPosition.coords.longitude,
                timestamp: new Date().toISOString(),
                description: document.getElementById('description').value || '',
                imageData: await this.imageToDataURL(this.capturedImage)
            };

            // Save to localStorage
            this.savePhotoToLocalStorage(photoData);
            
            // Add marker to map
            this.addPhotoMarker(photoData);
            
            // Reload photos list
            this.loadPhotos();
            
            // Reset form
            this.resetPhotoForm();
            
            this.hideLoading();
            alert('Photo saved successfully!');
            
        } catch (error) {
            console.error('Error saving photo:', error);
            this.hideLoading();
            alert('Failed to save photo. Please try again.');
        }
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    async imageToDataURL(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    savePhotoToLocalStorage(photoData) {
        const photos = JSON.parse(localStorage.getItem('photoMapPhotos') || '[]');
        photos.push(photoData);
        localStorage.setItem('photoMapPhotos', JSON.stringify(photos));
    }

    deletePhoto(photoId) {
        if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
            // Remove from localStorage
            const photos = JSON.parse(localStorage.getItem('photoMapPhotos') || '[]');
            const updatedPhotos = photos.filter(photo => photo.id !== photoId);
            localStorage.setItem('photoMapPhotos', JSON.stringify(updatedPhotos));
            
            // Remove marker from map
            this.markers.forEach((marker, index) => {
                if (marker.photoId === photoId) {
                    this.map.removeLayer(marker);
                    this.markers.splice(index, 1);
                }
            });
            
            // Reload photos list
            this.loadPhotos();
        }
    }

    clearAllPhotos() {
        if (confirm('Are you sure you want to delete ALL photos? This action cannot be undone.')) {
            // Clear localStorage
            localStorage.removeItem('photoMapPhotos');
            
            // Remove all markers from map
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = [];
            
            // Reload photos list
            this.loadPhotos();
        }
    }

    addPhotoMarker(photo) {
        const marker = L.marker([photo.latitude, photo.longitude], {
            icon: this.customIcon
        }).addTo(this.map);

        marker.bindPopup(`
            <div class="marker-popup">
                <img src="${photo.imageData}" alt="Photo" style="width: 100%; max-width: 200px; border-radius: 8px; margin-bottom: 10px;">
                <p><strong>Location:</strong> ${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}</p>
                <p><strong>Time:</strong> ${new Date(photo.timestamp).toLocaleString()}</p>
                ${photo.description ? `<p><strong>Description:</strong> ${photo.description}</p>` : ''}
            </div>
        `);

        // Store photo ID with marker for deletion
        marker.photoId = photo.id;
        this.markers.push(marker);
    }

    async loadPhotos() {
        try {
            // Load photos from localStorage
            const photos = JSON.parse(localStorage.getItem('photoMapPhotos') || '[]');
            
            this.displayPhotosList(photos);
            
            // Clear existing markers
            this.markers.forEach(marker => this.map.removeLayer(marker));
            this.markers = [];
            
            // Add markers for all photos
            photos.forEach(photo => this.addPhotoMarker(photo));
            
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    }

    displayPhotosList(photos) {
        const photosList = document.getElementById('photosList');
        const clearAllBtn = document.getElementById('clearAllBtn');
        
        if (photos.length === 0) {
            photosList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No photos yet. Take the first one!</p>';
            clearAllBtn.style.display = 'none';
            return;
        }
        
        // Show clear all button if there are photos
        clearAllBtn.style.display = 'inline-block';

        photosList.innerHTML = photos
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(photo => `
                <div class="photo-item">
                    <div class="photo-content" onclick="app.showPhotoModal('${photo.id}')">
                        <img src="${photo.imageData}" alt="Photo">
                        <h4>📍 ${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}</h4>
                        <p>📅 ${new Date(photo.timestamp).toLocaleString()}</p>
                        ${photo.description ? `<p>💬 ${photo.description}</p>` : ''}
                    </div>
                    <button class="btn btn-danger btn-sm delete-btn" onclick="app.deletePhoto('${photo.id}')" title="Delete photo">
                        🗑️ Delete
                    </button>
                </div>
            `).join('');
    }

    async showPhotoModal(photoId) {
        try {
            // Load photo from localStorage
            const photos = JSON.parse(localStorage.getItem('photoMapPhotos') || '[]');
            const photo = photos.find(p => p.id === photoId);
            
            if (!photo) {
                alert('Photo not found.');
                return;
            }
            
            const modal = document.getElementById('photoModal');
            const modalImage = document.getElementById('modalImage');
            const modalLocation = document.getElementById('modalLocation');
            const modalTime = document.getElementById('modalTime');
            const modalDescription = document.getElementById('modalDescription');
            
            modalImage.src = photo.imageData;
            modalLocation.textContent = `📍 Location: ${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}`;
            modalTime.textContent = `📅 Time: ${new Date(photo.timestamp).toLocaleString()}`;
            modalDescription.textContent = photo.description ? `💬 Description: ${photo.description}` : '';
            
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading photo details:', error);
            alert('Error loading photo details.');
        }
    }

    resetPhotoForm() {
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Reset UI
        const video = document.getElementById('camera');
        const preview = document.getElementById('preview');
        
        video.style.display = 'block';
        preview.style.display = 'none';
        video.srcObject = null;
        
        document.getElementById('captureBtn').disabled = true;
        document.getElementById('captureBtn').style.display = 'block';
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('retakeBtn').style.display = 'none';
        document.getElementById('description').value = '';
        
        this.capturedImage = null;
    }

    updateLocationText(latitude, longitude) {
        const locationText = document.getElementById('locationText');
        locationText.textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    updateTime() {
        const timeText = document.getElementById('timeText');
        timeText.textContent = new Date().toLocaleString();
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingContent = overlay.querySelector('.loading-content p');
        loadingContent.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = 'none';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhotoMapApp();
});

// Add custom CSS for markers
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        background: none;
        border: none;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        cursor: pointer;
    }
    
    .user-marker {
        background: none;
        border: none;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    
    .marker-popup {
        text-align: center;
        max-width: 250px;
    }
    
    .marker-popup img {
        border-radius: 8px;
        margin-bottom: 10px;
    }
    
    .marker-popup p {
        margin: 5px 0;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style); 