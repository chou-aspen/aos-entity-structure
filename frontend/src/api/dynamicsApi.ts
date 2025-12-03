/**
 * API client for Dynamics 365 backend
 */
import axios from 'axios';
import type { GraphData } from '../types';

// Use environment variable for API base URL, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dynamicsApi = {
  /**
   * Fetch complete graph data with entities and relationships
   * Uses core_custom filter with qrt_ (org custom) and msdyn_ (Microsoft Dynamics) prefixes
   * This reduces the dataset from 964 entities to 270 entities for better visualization performance
   */
  getGraphData: async (): Promise<GraphData> => {
    const response = await apiClient.get<GraphData>('/graph?filter_mode=core_custom&prefixes=qrt_,msdyn_');
    return response.data;
  },

  /**
   * Fetch all entities
   */
  getEntities: async () => {
    const response = await apiClient.get('/entities');
    return response.data;
  },

  /**
   * Fetch all relationships
   */
  getRelationships: async () => {
    const response = await apiClient.get('/relationships');
    return response.data;
  },
};
