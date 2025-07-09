import { useState, useEffect } from 'react';
import * as bodhijs from '@bodhiapp/bodhijs';

// Extension status type
export type ExtensionStatus = 'checking' | 'available' | 'unavailable' | 'error';

// Extension state interface
export interface ExtensionState {
  status: ExtensionStatus;
  isInstalled: boolean;
  ready: boolean;
  error: string | null;
}

export const useExtensionStatus = () => {
  const [state, setState] = useState<ExtensionState>({
    status: 'checking',
    isInstalled: false,
    ready: false,
    error: null
  });

  useEffect(() => {
    const checkExtension = async () => {
      try {
        const isInstalled = await bodhijs.isInstalled();
        
        if (isInstalled) {
          setState({
            status: 'available',
            isInstalled: true,
            ready: true,
            error: null
          });
        } else {
          setState({
            status: 'unavailable',
            isInstalled: false,
            ready: false,
            error: 'Bodhi Browser Extension is not installed or enabled'
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          status: 'error',
          isInstalled: false,
          ready: false,
          error: errorMessage
        });
      }
    };

    checkExtension();
  }, []);

  return state;
}; 