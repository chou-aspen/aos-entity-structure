/**
 * Custom hook for fetching and managing graph data
 */
import { useState, useEffect } from 'react';
import { dynamicsApi } from '../api/dynamicsApi';
import type { GraphData } from '../types';

export const useGraphData = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const graphData = await dynamicsApi.getGraphData();
        setData(graphData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch graph data';
        setError(errorMessage);
        console.error('Error fetching graph data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const graphData = await dynamicsApi.getGraphData();
      setData(graphData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch graph data';
      setError(errorMessage);
      console.error('Error fetching graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
