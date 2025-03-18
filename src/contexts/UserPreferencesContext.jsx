
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  // Initialize states from localStorage
  const [nsfwEnabled, setNsfwEnabled] = useState(() => {
    const saved = localStorage.getItem('nsfwEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  const [aspectRatio, setAspectRatio] = useState(() => {
    const saved = localStorage.getItem('aspectRatio');
    return saved || "1:1";
  });

  // Add a state to track if we're in remix mode
  const [isRemixMode, setIsRemixMode] = useState(false);

  // Update localStorage when states change
  useEffect(() => {
    localStorage.setItem('nsfwEnabled', JSON.stringify(nsfwEnabled));
  }, [nsfwEnabled]);

  useEffect(() => {
    if (!isRemixMode) {
      localStorage.setItem('aspectRatio', aspectRatio);
    }
  }, [aspectRatio, isRemixMode]);

  const value = {
    nsfwEnabled,
    setNsfwEnabled,
    aspectRatio,
    setAspectRatio,
    isRemixMode,
    setIsRemixMode,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}; 
