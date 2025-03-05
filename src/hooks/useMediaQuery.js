
import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // Set initial value
    setMatches(mediaQuery.matches);

    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Using addEventListener instead of the deprecated addListener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up event listener on component unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};
