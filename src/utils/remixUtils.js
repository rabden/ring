
import { toast } from 'sonner';

export const remixImage = (image, navigate, session) => {
  if (!session) {
    toast.error('Please sign in to remix images');
    return;
  }

  if (!image) {
    toast.error('Invalid image data');
    return;
  }

  console.log('Remix navigation: navigating to / with remix data');

  // Simple single route navigation - always go to /
  navigate('/', {
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
};
