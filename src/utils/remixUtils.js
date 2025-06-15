
import { toast } from 'sonner';

const isMobile = () => {
  return window.innerWidth <= 768;
};

export const remixImage = (image, navigate, session) => {
  if (!session) {
    toast.error('Please sign in to remix images');
    return;
  }

  if (!image) {
    toast.error('Invalid image data');
    return;
  }

  const mobile = isMobile();
  const targetHash = mobile ? '#imagegenerate' : '#myimages';

  console.log('Remix navigation:', { mobile, targetHash, from: window.location.pathname });

  // Prepare remix data
  const remixData = {
    remixImage: {
      id: image.id,
      prompt: image.prompt,
      user_prompt: image.user_prompt,
      seed: image.seed,
      width: image.width,
      height: image.height,
      model: image.model,
      quality: image.quality,
      aspect_ratio: image.aspect_ratio,
      negative_prompt: image.negative_prompt
    }
  };

  // Check if we're already on the root route
  const isOnRootRoute = window.location.pathname === '/';
  
  if (isOnRootRoute) {
    // We're already on the root route, just change the hash
    console.log('Same route navigation, updating hash only');
    navigate(targetHash, {
      state: remixData,
      replace: true
    });
  } else {
    // Cross-route navigation: first navigate to root, then set hash
    console.log('Cross-route navigation, two-step process');
    
    // Step 1: Navigate to root route with remix data
    navigate('/', {
      state: remixData,
      replace: true
    });
    
    // Step 2: Set the hash after a small delay to ensure route transition completes
    setTimeout(() => {
      window.location.hash = targetHash;
      
      // For desktop, scroll to top after navigation
      if (!mobile) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }, 50);
  }
};
