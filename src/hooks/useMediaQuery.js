import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  // Initialize with false as default value
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addListener(handleChange);

    // Cleanup
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
};