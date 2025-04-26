
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  const [aspectRatio, setAspectRatio] = useState(() => {
    const saved = localStorage.getItem('aspectRatio');
    return saved || "1:1";
  });

  const [isRemixMode, setIsRemixMode] = useState(false);
  
  const [settingsActive, setSettingsActive] = useState(() => {
    const saved = localStorage.getItem('settingsActive');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (!isRemixMode) {
      localStorage.setItem('aspectRatio', aspectRatio);
    }
  }, [aspectRatio, isRemixMode]);
  
  useEffect(() => {
    localStorage.setItem('settingsActive', JSON.stringify(settingsActive));
  }, [settingsActive]);

  // Remove NSFW from localStorage if it exists
  useEffect(() => {
    localStorage.removeItem('nsfwEnabled');
  }, []);

  const value = {
    aspectRatio,
    setAspectRatio,
    isRemixMode,
    setIsRemixMode,
    settingsActive,
    setSettingsActive,
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
