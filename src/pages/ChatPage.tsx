import { useState, useEffect } from 'react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useChat } from '../hooks/useChat';
import { useModels } from '../hooks/useModels';
import ModelSelector from '../components/ModelSelector';
import ChatInterface from '../components/ChatInterface';
import ChatInput from '../components/ChatInput';
import NewChatButton from '../components/NewChatButton';
import ErrorPopup from '../components/ErrorPopup';
import UserProfile from '../components/UserProfile';
import ExtensionStatus from '../components/ExtensionStatus';

const ChatPage: React.FC = () => {
  const { systemStatus, checkSystemStatus } = useSystemStatus();
  const { messages, loading, error, sendMessage, newChat } = useChat();
  const { models, error: modelsError } = useModels();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | undefined>();

  // Set initial model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  // Show models error as popup
  useEffect(() => {
    if (modelsError) {
      setErrorPopup(modelsError);
    }
  }, [modelsError]);

  const handleSendMessage = async (message: string) => {
    if (selectedModel) {
      setRestoreMessage(undefined); // Clear any previous restore message
      const result = await sendMessage(message, selectedModel);
      if (!result.success) {
        setErrorPopup(result.error || 'An unknown error occurred');
        setRestoreMessage(result.userContent);
      }
    }
  };

  const handleNewChat = () => {
    newChat();
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleCloseErrorPopup = () => {
    setErrorPopup(null);
  };

  if (systemStatus.status === 'checking') {
    return (
      <div className="chat-page">
        <div className="system-status checking">
          <h2>Initializing Bodhi Chat</h2>
          <p>Checking system availability...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (systemStatus.status === 'error') {
    return (
      <div className="chat-page">
        <div className="system-status error">
          <h2>System Error</h2>
          <p>{systemStatus.errorMessage}</p>
          <button onClick={checkSystemStatus} className="retry-button">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="header-left">
          <h1>Bodhi Chat</h1>
        </div>
        <div className="header-center">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            disabled={loading}
          />
        </div>
        <div className="header-right">
          <NewChatButton
            onNewChat={handleNewChat}
            disabled={loading}
          />
          <UserProfile />
        </div>
      </header>

      <div className="extension-status-container">
        <ExtensionStatus />
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <main className="chat-main">
        <ChatInterface
          messages={messages}
          loading={loading}
        />
      </main>

      <footer className="chat-footer">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading || !selectedModel}
          restoreMessage={restoreMessage}
        />
      </footer>

      {errorPopup && (
        <ErrorPopup
          message={errorPopup}
          onClose={handleCloseErrorPopup}
        />
      )}
    </div>
  );
};

export default ChatPage; 