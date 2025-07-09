import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ChatInput from '../../components/ChatInput';

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders input and send button', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('calls onSendMessage when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Hello world');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
  });

  test('calls onSendMessage when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'Hello world');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
  });

  test('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  test('disables input when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /sending/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  test('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Hello world');
    await user.click(sendButton);
    
    expect(input.value).toBe('');
  });
}); 