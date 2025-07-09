import React from 'react';
import type { NewChatButtonProps } from '../types';

const NewChatButton: React.FC<NewChatButtonProps> = ({
  onNewChat,
  disabled = false
}) => {
  return (
    <button
      onClick={onNewChat}
      disabled={disabled}
      className="new-chat-button"
      type="button"
    >
      New Chat
    </button>
  );
};

export default NewChatButton; 