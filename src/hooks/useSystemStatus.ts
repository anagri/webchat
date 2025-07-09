import { useState, useEffect } from 'react';
import { isInstalled, isServerAvailable } from '@bodhiapp/bodhijs';
import type { SystemStatus } from '../types';

export const useSystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'checking'
  });

  const checkSystemStatus = async () => {
    try {
      setSystemStatus({ status: 'checking' });

      if (!isInstalled()) {
        setSystemStatus({
          status: 'error',
          errorMessage: 'Bodhi Browser Extension is not installed. Please install it to use this app.'
        });
        return;
      }

      const serverAvailable = await isServerAvailable();
      if (!serverAvailable) {
        setSystemStatus({
          status: 'error',
          errorMessage: 'Bodhi server is not running. Please start your local Bodhi App.'
        });
        return;
      }

      setSystemStatus({ status: 'ready' });
    } catch {
      setSystemStatus({
        status: 'error',
        errorMessage: 'Failed to connect to Bodhi system'
      });
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  return { systemStatus, checkSystemStatus };
}; 