import { useState, useCallback } from 'react';
import { sendApiRequest, BodhiError, ErrorCode } from '@bodhiapp/bodhijs';
import { useExtensionStatus } from './useExtension';
import { useAuth } from '../contexts/AuthContext';
import type { ChatResponse } from '@bodhiapp/bodhijs';
import type { Message } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ready: extensionReady, error: extensionError } = useExtensionStatus();
  const { token } = useAuth();

  const handleError = (error: unknown): string => {
    if (error instanceof BodhiError) {
      switch (error.code) {
        case ErrorCode.EXTENSION_NOT_INSTALLED:
          return 'Please install the Bodhi Browser Extension to use AI features.';
        case ErrorCode.SERVER_UNAVAILABLE:
          return 'Bodhi server is not running. Please start your local BodhiApp.';
        case ErrorCode.UNKNOWN_ERROR:
          return `An unexpected error occurred: ${error.message}`;
        default:
          return 'An unknown error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  };

  const sendMessage = useCallback(async (content: string, model: string) => {
    if (!content.trim() || loading) return { success: true };

    // Check extension status and authentication before proceeding
    if (!extensionReady) {
      const errorMessage = extensionError || 'Extension not available';
      setError(errorMessage);
      return { success: false, error: errorMessage, userContent: content };
    }

    if (!token) {
      const errorMessage = 'Authentication required';
      setError(errorMessage);
      return { success: false, error: errorMessage, userContent: content };
    }

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        model,
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content }
        ]
      };

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await sendApiRequest<ChatResponse>({
        method: 'POST',
        endpoint: '/v1/chat/completions',
        body: requestBody,
        headers
      });

      // Add complete assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      return { success: true };

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = handleError(error);
      setError(errorMessage);

      // Remove the user message that failed to send
      setMessages(prev => prev.slice(0, -1));

      // Return the error message and user content for UI to handle
      return { success: false, error: errorMessage, userContent: content };
    } finally {
      setLoading(false);
    }
  }, [messages, loading, extensionReady, extensionError, token]);

  const newChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    newChat
  };
}; 