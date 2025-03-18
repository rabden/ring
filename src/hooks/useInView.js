import { useEffect, useRef, useState } from 'react';

export const useInView = (threshold = 0.9) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        console.log('Intersection Observer:', { 
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          threshold,
          isVisible
        });
        
        setIsInView(isVisible);
        if (isVisible && !hasBeenViewed) {
          console.log('Setting hasBeenViewed to true');
          setHasBeenViewed(true);
        }
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, threshold],
        rootMargin: '0px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
      console.log('Started observing element');
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
        console.log('Stopped observing element');
      }
    };
  }, [threshold, hasBeenViewed]);

  return { ref, isInView, hasBeenViewed };
}; 