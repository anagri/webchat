import React, { useEffect, useRef } from 'react';
import type { ChatInterfaceProps } from '../types';

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  loading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 && !loading && (
          <div className="welcome-message">
            <h3>Welcome to Bodhi Chat!</h3>
            <p>Start a conversation with your local AI assistant.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-header">
              <span className="message-role">
                {message.role === 'user' ? 'You' : 'AI'}
              </span>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant loading">
            <div className="message-header">
              <span className="message-role">AI</span>
              <span className="message-time">
                {formatTime(new Date())}
              </span>
            </div>
            <div className="message-content">
              <span className="thinking">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface; 