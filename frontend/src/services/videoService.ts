import { apiService } from './api';

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  category: 'first-aid' | 'emergency-response' | 'disaster-preparedness' | 'safety-tips' | 'evacuation';
  language: string;
  duration: number; // in seconds
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface VideoStats {
  totalVideos: number;
  totalViews: number;
  categoryCounts: { [category: string]: number };
  languageCounts: { [language: string]: number };
}

export interface VideoFilters {
  category?: string;
  language?: string;
  tags?: string[];
  search?: string;
}

export class VideoService {
  async getAllVideos(filters?: VideoFilters): Promise<Video[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.language) queryParams.append('language', filters.language);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.tags) {
          filters.tags.forEach(tag => queryParams.append('tags', tag));
        }
      }

      const endpoint = `/api/videos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiService.get<Video[]>(endpoint);
    } catch (error) {
      console.log('Using offline mode for videos');
      let videos = this.getDefaultVideos();
      
      // Apply filters to default videos
      if (filters) {
        if (filters.category) {
          videos = videos.filter(v => v.category === filters.category);
        }
        if (filters.language) {
          videos = videos.filter(v => v.language === filters.language);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          videos = videos.filter(v => 
            v.title.toLowerCase().includes(searchLower) ||
            v.description.toLowerCase().includes(searchLower)
          );
        }
      }
      
      return videos;
    }
  }

  async getVideoStats(): Promise<VideoStats> {
    try {
      return await apiService.get<VideoStats>('/api/videos/stats');
    } catch (error) {
      console.log('Using offline mode for video stats');
      const defaultVideos = this.getDefaultVideos();
      return {
        totalVideos: defaultVideos.length,
        totalViews: defaultVideos.reduce((sum, v) => sum + v.viewCount, 0),
        categoryCounts: defaultVideos.reduce((acc, v) => {
          acc[v.category] = (acc[v.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
        languageCounts: defaultVideos.reduce((acc, v) => {
          acc[v.language] = (acc[v.language] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      };
    }
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    try {
      return await apiService.get<Video[]>(`/api/videos/category/${category}`);
    } catch (error) {
      console.log('Using offline mode for videos by category');
      return this.getDefaultVideos().filter(v => v.category === category);
    }
  }

  // Helper methods for frontend
  async getFirstAidVideos(language?: string): Promise<Video[]> {
    return await this.getAllVideos({ 
      category: 'first-aid',
      language 
    });
  }

  async getEmergencyResponseVideos(language?: string): Promise<Video[]> {
    return await this.getAllVideos({ 
      category: 'emergency-response',
      language 
    });
  }

  async getDisasterPreparednessVideos(language?: string): Promise<Video[]> {
    return await this.getAllVideos({ 
      category: 'disaster-preparedness',
      language 
    });
  }

  async getSafetyTipsVideos(language?: string): Promise<Video[]> {
    return await this.getAllVideos({ 
      category: 'safety-tips',
      language 
    });
  }

  async getEvacuationVideos(language?: string): Promise<Video[]> {
    return await this.getAllVideos({ 
      category: 'evacuation',
      language 
    });
  }

  async searchVideos(query: string, language?: string): Promise<Video[]> {
    return await this.getAllVideos({ 
      search: query,
      language 
    });
  }

  // Format duration for display
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Default video data for fallback
  getDefaultVideos(): Video[] {
    return [
      {
        id: 'default-1',
        title: 'Basic First Aid - CPR',
        description: 'Learn the basics of CPR for emergency situations',
        url: 'https://example.com/cpr-video',
        category: 'first-aid',
        language: 'en',
        duration: 300,
        viewCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['cpr', 'emergency', 'lifesaving']
      },
      {
        id: 'default-2',
        title: 'Earthquake Safety',
        description: 'What to do during an earthquake',
        url: 'https://example.com/earthquake-video',
        category: 'emergency-response',
        language: 'en',
        duration: 240,
        viewCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['earthquake', 'safety', 'emergency']
      }
    ];
  }
}

export const videoService = new VideoService();