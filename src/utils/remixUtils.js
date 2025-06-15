
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

  // Determine navigation target based on device
  const mobile = isMobile();
  const targetRoute = mobile ? '/#imagegenerate' : '/#myimages';

  console.log('Remix navigation:', { mobile, targetRoute, from: window.location.pathname });

  // Navigate to the appropriate route with image data in state
  navigate(targetRoute, {
    state: {
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
    },
    replace: true
  });

  // For desktop, scroll to top after navigation
  if (!mobile) {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }
};
