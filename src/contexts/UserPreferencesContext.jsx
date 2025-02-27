import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  // Initialize states from localStorage
  const [nsfwEnabled, setNsfwEnabled] = useState(() => {
    const saved = localStorage.getItem('nsfwEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Update localStorage when states change
  useEffect(() => {
    localStorage.setItem('nsfwEnabled', JSON.stringify(nsfwEnabled));
  }, [nsfwEnabled]);

  const value = {
    nsfwEnabled,
    setNsfwEnabled,
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