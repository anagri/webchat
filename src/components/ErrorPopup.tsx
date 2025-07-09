import React from 'react';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <div className="error-popup-overlay" onClick={onClose}>
      <div className="error-popup" onClick={(e) => e.stopPropagation()}>
        <div className="error-popup-header">
          <h3>Error</h3>
          <button 
            onClick={onClose}
            className="error-popup-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="error-popup-content">
          <p>{message}</p>
        </div>
        <div className="error-popup-footer">
          <button onClick={onClose} className="error-popup-button">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup; 