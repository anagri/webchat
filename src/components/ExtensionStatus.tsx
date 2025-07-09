import { useExtensionStatus } from '../hooks/useExtension';

interface ExtensionStatusProps {
  className?: string;
}

export default function ExtensionStatus({ className = '' }: ExtensionStatusProps) {
  const { status, error } = useExtensionStatus();

  const getStatusDisplay = () => {
    switch (status) {
      case 'checking':
        return { text: 'Checking extension...', className: 'checking' };
      case 'available':
        return { text: 'Extension ready', className: 'available' };
      case 'unavailable':
        return { text: 'Extension not installed', className: 'unavailable' };
      case 'error':
        return { text: error || 'Extension error', className: 'error' };
      default:
        return { text: 'Unknown status', className: 'error' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`extension-status ${statusDisplay.className} ${className}`}>
      <span className="status-text">{statusDisplay.text}</span>
    </div>
  );
} 