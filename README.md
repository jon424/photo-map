# 📸 Photo Map - TypeScript Node.js App with Leaflet.js

A modern web application that allows users to take photos on their mobile devices and display them on a global map at the exact location where they were taken. Built with TypeScript, Node.js, Express, and Leaflet.js.

## ✨ Features

- **📱 Mobile-First Design**: Optimized for mobile devices with responsive layout
- **📷 Camera Integration**: Access device camera to take photos directly in the browser
- **📍 Geolocation**: Automatically capture GPS coordinates when taking photos
- **🗺️ Interactive Map**: Beautiful Leaflet.js map with custom markers for each photo
- **💾 Photo Storage**: Server-side storage with metadata (location, timestamp, description)
- **🎨 Modern UI**: Beautiful gradient design with smooth animations
- **📱 Progressive Web App**: Works offline and provides native app-like experience
- **🔍 Photo Gallery**: Browse all uploaded photos with location details
- **📊 Real-time Updates**: See photos appear on the map immediately after upload

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with camera and geolocation support

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd leaflet-photo-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the TypeScript code**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Commands

```bash
# Start development server with hot reload
npm run watch

# Build for production
npm run build

# Start production server
npm start

# Clean build directory
npm run clean
```

## 📱 How to Use

### Taking Photos

1. **Get Your Location**: Click the "📍 Locate Me" button to get your current GPS coordinates
2. **Start Camera**: Click "📷 Take Photo" to access your device's camera
3. **Capture Photo**: Click "📸 Capture Photo" to take a picture
4. **Add Description** (optional): Add a description to your photo
5. **Upload**: Click "⬆️ Upload Photo" to save it to the map

### Viewing Photos

- **On the Map**: All photos appear as 📸 markers on the map
- **In the Gallery**: Browse recent photos in the right panel
- **Photo Details**: Click any photo to view it in a modal with full details

## 🏗️ Project Structure

```
leaflet-photo-map/
├── src/
│   └── server.ts          # Express server with TypeScript
├── public/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Modern CSS styling
│   └── app.js            # Frontend JavaScript
├── uploads/              # Photo storage directory (auto-created)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🔧 Technical Details

### Backend (Node.js + Express + TypeScript)

- **Server**: Express.js with TypeScript
- **File Upload**: Multer for handling photo uploads
- **Storage**: Local file system (uploads directory)
- **API Endpoints**:
  - `POST /api/photos` - Upload photo with location data
  - `GET /api/photos` - Get all photos
  - `GET /api/photos/:id` - Get specific photo
  - `GET /uploads/:filename` - Serve uploaded images

### Frontend (Vanilla JavaScript + Leaflet.js)

- **Map**: Leaflet.js with OpenStreetMap tiles
- **Camera**: WebRTC getUserMedia API
- **Geolocation**: HTML5 Geolocation API
- **UI**: Responsive CSS with modern design
- **Features**: Real-time updates, modal dialogs, loading states

### Data Structure

```typescript
interface PhotoData {
  id: string;
  filename: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description?: string;
}
```

## 🌐 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Required APIs**: 
  - Geolocation API
  - MediaDevices API (camera access)
  - File API
  - Fetch API

## 🔒 Security Considerations

- **File Validation**: Only image files are accepted
- **File Size Limits**: 10MB maximum file size
- **CORS**: Configured for local development
- **Input Sanitization**: All user inputs are validated

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Set environment variables as needed

### Environment Variables
- `PORT`: Server port (default: 3000)

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Photo sharing and social features
- [ ] Advanced filtering and search
- [ ] Photo editing capabilities
- [ ] Offline support with service workers
- [ ] Push notifications
- [ ] Multiple map tile providers
- [ ] Photo clustering for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Camera not working:**
- Ensure you're using HTTPS (required for camera access)
- Check browser permissions for camera access
- Try refreshing the page

**Location not working:**
- Enable location services in your browser
- Allow location access when prompted
- Check if your device has GPS enabled

**Photos not uploading:**
- Check file size (max 10MB)
- Ensure you're using a supported image format
- Check browser console for errors

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure all dependencies are installed
3. Verify your Node.js version is compatible
4. Check that the server is running on the correct port

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Happy Photo Mapping! 📸🗺️** 