import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import type { ChatInputProps } from '../types';

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
  placeholder = "Type your message... (Shift+Enter for new line)",
  restoreMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore message when provided
  useEffect(() => {
    if (restoreMessage) {
      setInputValue(restoreMessage);
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [restoreMessage]);

  const handleSubmit = () => {
    if (!inputValue.trim() || disabled) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="chat-input">
      <div className="input-container">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="message-input"
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className="send-button"
          type="button"
        >
          {disabled ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 