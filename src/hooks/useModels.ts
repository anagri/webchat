import { useState, useEffect } from 'react';
import { sendApiRequest } from '@bodhiapp/bodhijs';
import { useExtensionStatus } from './useExtension';
import { useAuth } from '../contexts/AuthContext';
import type { Model } from '../types';

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { ready: extensionReady, error: extensionError } = useExtensionStatus();
  const { token } = useAuth();

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if extension is ready
      if (!extensionReady) {
        throw new Error(extensionError || 'Extension not available');
      }

      // Use the bodhijs library to fetch models
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await sendApiRequest({
          method: 'GET',
          endpoint: '/v1/models',
          headers
        });

        if (response.data && response.data.data) {
          setModels(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (fetchError) {
        console.error('Failed to fetch models:', fetchError);
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Failed to fetch models';
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch models when extension is ready and user is authenticated
    if (extensionReady && token) {
      fetchModels();
    } else if (extensionError) {
      setError(extensionError);
      setLoading(false);
    } else if (!token) {
      setError('Authentication required');
      setLoading(false);
    }
  }, [extensionReady, extensionError, token]);

  return { models, loading, error, refetch: fetchModels };
}; 