
import { useEffect, useRef, useState } from 'react';

export const useInView = (threshold = 0.5) => {
  const [isInView, setIsInView] = useState(true); // Start with true to avoid initial flicker
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
      setHasBeenViewed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Use a more direct approach with less calculations
        const visible = entry.isIntersecting;
        setIsInView(visible);
        
        if (visible && !hasBeenViewed) {
          setHasBeenViewed(true);
        }
      },
      { 
        // Simplified thresholds for better performance
        threshold: [0],
        rootMargin: '0px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, hasBeenViewed]);

  return { ref, isInView, hasBeenViewed };
};
