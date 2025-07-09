import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-menu">
        <button
          className="user-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isLoggingOut}
        >
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="user-name">
            {user.name || user.email || 'User'}
          </span>
          <svg 
            className={`chevron ${isDropdownOpen ? 'open' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="user-dropdown">
            <div className="user-info">
              <div className="user-details">
                {user.name && <div className="user-name-full">{user.name}</div>}
                {user.email && <div className="user-email">{user.email}</div>}
              </div>
            </div>
            <hr className="dropdown-separator" />
            <button
              className="logout-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <div className="logout-spinner"></div>
                  Signing out...
                </>
              ) : (
                'Sign out'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="dropdown-overlay"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
} 