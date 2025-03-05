
import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define the event handler
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup function to remove event listener
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]); // Only re-run if query changes

  return matches;
};
