
import { useEffect, useRef, useState } from 'react';

export const useInView = (threshold = 0.9) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        setIsInView(isVisible);
        if (isVisible && !hasBeenViewed) {
          setHasBeenViewed(true);
        }
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, threshold],
        rootMargin: '-64px 0px 0px 0px'
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
