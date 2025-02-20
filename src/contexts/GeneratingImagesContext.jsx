import React, { createContext, useContext, useState, useEffect } from 'react';

const GeneratingImagesContext = createContext();

export const GeneratingImagesProvider = ({ children }) => {
  const [generatingImages, setGeneratingImages] = useState([]);

  // Add auto-removal of completed images after 10 seconds
  useEffect(() => {
    const completedImages = generatingImages.filter(img => img.status === 'completed');
    
    if (completedImages.length > 0) {
      const timeouts = completedImages.map(img => {
        return setTimeout(() => {
          setGeneratingImages(prev => prev.filter(i => i.id !== img.id));
        }, 10000); // 10 seconds
      });

      // Cleanup timeouts
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [generatingImages]);

  const value = {
    generatingImages,
    setGeneratingImages,
  };

  return (
    <GeneratingImagesContext.Provider value={value}>
      {children}
    </GeneratingImagesContext.Provider>
  );
};

export const useGeneratingImages = () => {
  const context = useContext(GeneratingImagesContext);
  if (context === undefined) {
    throw new Error('useGeneratingImages must be used within a GeneratingImagesProvider');
  }
  return context;
}; 