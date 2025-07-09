export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
}

export interface SystemStatus {
  status: 'checking' | 'ready' | 'error';
  errorMessage?: string;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  restoreMessage?: string;
}

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export interface ChatInterfaceProps {
  messages: Message[];
  loading: boolean;
}

export interface NewChatButtonProps {
  onNewChat: () => void;
  disabled?: boolean;
} 