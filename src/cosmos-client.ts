import { CosmosClient, Database, Container } from '@azure/cosmos';

export interface PhotoData {
  id: string;
  filename: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description?: string;
  blobUrl?: string;
}

class CosmosDBService {
  private client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor() {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const databaseName = process.env.COSMOS_DATABASE || 'photodb';
    const containerName = process.env.COSMOS_CONTAINER || 'photos';

    if (!endpoint || !key) {
      throw new Error('Cosmos DB configuration missing. Please set COSMOS_ENDPOINT and COSMOS_KEY environment variables.');
    }

    this.client = new CosmosClient({ endpoint, key });
    this.database = this.client.database(databaseName);
    this.container = this.database.container(containerName);
  }

  async createPhoto(photoData: PhotoData): Promise<PhotoData> {
    try {
      const { resource } = await this.container.items.create(photoData);
      return resource as PhotoData;
    } catch (error) {
      console.error('Error creating photo in Cosmos DB:', error);
      throw new Error('Failed to save photo to database');
    }
  }

  async getPhoto(id: string): Promise<PhotoData | null> {
    try {
      const { resource } = await this.container.item(id, id).read();
      return resource as unknown as PhotoData;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      console.error('Error getting photo from Cosmos DB:', error);
      throw new Error('Failed to retrieve photo from database');
    }
  }

  async getAllPhotos(): Promise<PhotoData[]> {
    try {
      const { resources } = await this.container.items
        .query({
          query: 'SELECT * FROM c ORDER BY c.timestamp DESC'
        })
        .fetchAll();
      
      return resources as PhotoData[];
    } catch (error) {
      console.error('Error getting all photos from Cosmos DB:', error);
      throw new Error('Failed to retrieve photos from database');
    }
  }

  async updatePhoto(id: string, updates: Partial<PhotoData>): Promise<PhotoData> {
    try {
      const { resource } = await this.container.item(id, id).replace({
        id,
        ...updates
      });
      return resource as unknown as PhotoData;
    } catch (error) {
      console.error('Error updating photo in Cosmos DB:', error);
      throw new Error('Failed to update photo in database');
    }
  }

  async deletePhoto(id: string): Promise<void> {
    try {
      await this.container.item(id, id).delete();
    } catch (error) {
      console.error('Error deleting photo from Cosmos DB:', error);
      throw new Error('Failed to delete photo from database');
    }
  }
}

export default CosmosDBService;
