import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

class AzureStorageService {
  private containerClient: ContainerClient;

  constructor() {
    const connectionString = process.env.STORAGE_CONNECTION;
    const containerName = process.env.STORAGE_CONTAINER || 'photos';

    if (!connectionString) {
      throw new Error('Azure Storage configuration missing. Please set STORAGE_CONNECTION environment variable.');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  async uploadPhoto(file: Express.Multer.File, filename: string): Promise<string> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
      
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype
        }
      });

      // Return the public URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading photo to Azure Storage:', error);
      throw new Error('Failed to upload photo to storage');
    }
  }

  async deletePhoto(filename: string): Promise<void> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
      await blockBlobClient.delete();
    } catch (error) {
      console.error('Error deleting photo from Azure Storage:', error);
      throw new Error('Failed to delete photo from storage');
    }
  }

  async getPhotoUrl(filename: string): Promise<string> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error getting photo URL from Azure Storage:', error);
      throw new Error('Failed to get photo URL');
    }
  }
}

export default AzureStorageService;
