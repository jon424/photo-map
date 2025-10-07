import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import CosmosDBService, { PhotoData } from './cosmos-client';
import AzureStorageService from './storage-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
let cosmosService: CosmosDBService;
let storageService: AzureStorageService;

// Check if we should use local storage (for free tier deployment)
const useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true' || !process.env.COSMOS_ENDPOINT;

if (useLocalStorage) {
  console.log('📁 Using local storage mode (no Cosmos DB required)');
} else {
  try {
    cosmosService = new CosmosDBService();
    storageService = new AzureStorageService();
    console.log('✅ Connected to Cosmos DB and Azure Storage');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    console.log('Falling back to local storage mode...');
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists for development
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for Azure

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Fallback in-memory storage for development
const photos: PhotoData[] = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Upload photo with location data
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const { latitude, longitude, description } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const photoId = uuidv4();
    const filename = `${photoId}-${req.file.originalname}`;
    
    let photoData: PhotoData;

    if (cosmosService && storageService && !useLocalStorage) {
      // Production: Use Cosmos DB and Azure Storage
      try {
        // Upload to Azure Storage
        const blobUrl = await storageService.uploadPhoto(req.file, filename);
        
        photoData = {
          id: photoId,
          filename,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date().toISOString(),
          description: description || '',
          blobUrl
        };

        // Save to Cosmos DB
        await cosmosService.createPhoto(photoData);
        
      } catch (error) {
        console.error('Error with Azure services:', error);
        return res.status(500).json({ error: 'Failed to upload photo to cloud storage' });
      }
    } else {
      // Development: Use local storage
      const localPath = path.join(uploadsDir, filename);
      fs.writeFileSync(localPath, req.file.buffer);
      
      photoData = {
        id: photoId,
        filename,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date().toISOString(),
        description: description || ''
      };

      photos.push(photoData);
    }
    
    res.json({
      success: true,
      photo: photoData
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Get all photos
app.get('/api/photos', async (req, res) => {
  try {
    if (cosmosService && !useLocalStorage) {
      // Production: Get from Cosmos DB
      const photos = await cosmosService.getAllPhotos();
      res.json(photos);
    } else {
      // Development or local storage mode: Get from memory
      res.json(photos);
    }
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
});

// Get photo by ID
app.get('/api/photos/:id', async (req, res) => {
  try {
    if (cosmosService && !useLocalStorage) {
      // Production: Get from Cosmos DB
      const photo = await cosmosService.getPhoto(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.json(photo);
    } else {
      // Development or local storage mode: Get from memory
      const photo = photos.find(p => p.id === req.params.id);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.json(photo);
    }
  } catch (error) {
    console.error('Error getting photo:', error);
    res.status(500).json({ error: 'Failed to retrieve photo' });
  }
});

// Serve uploaded images
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  
  if (cosmosService && storageService && !useLocalStorage) {
    // Production: Redirect to Azure Storage URL
    storageService.getPhotoUrl(filename)
      .then(url => res.redirect(url))
      .catch(() => res.status(404).json({ error: 'Image not found' }));
  } else {
    // Development or local storage mode: Serve from local storage
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
}); 