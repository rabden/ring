
export const modelConfig = {
  flux: {
    name: "Flux",
    category: "General",
    group: "Base Models",
    huggingfaceId: "black-forest-labs/FLUX.1-schnell",
    qualityLimits: null,
    isPremium: false,
    promptSuffix: null,
    tagline: "Balanced of speed and quality",
    image: "https://i.ibb.co.com/51P0fS0/out-0.webp",
    example: "the prompt should be clear, should describe the users base prompt in best way and add extra elements to it for maximizing performance, you can add word tags that might enhance the image result or effect its styles",
    steps: 16,
    use_guidance: false,
    defaultguidance: 7.5,
    use_negative_prompt: false
  },
  fluxDev: {
    name: "Flux Pro",
    category: "General",
    group: "Base Models",
    huggingfaceId: "black-forest-labs/FLUX.1-dev",
    qualityLimits: null,
    isPremium: true,
    promptSuffix: null,
    tagline: "Flux dev by black forest labs",
    image: "https://i.ibb.co/gjrM8R5/out-0-1.webp",
    example: "the prompt should be clear, should describe the users base prompt in best way and add extra elements to it for maximizing performance, you can add word tags that might enhance the image result or effect its styles",
    steps: 48,
    use_guidance: false,
    defaultguidance: 7.5,
    use_negative_prompt: false
  },
  flash: {
    name: "Flash",
    category: "General",
    group: "Base Models",
    huggingfaceId: "stabilityai/stable-diffusion-3.5-large-turbo",
    qualityLimits: ["HD"],
    isPremium: false,
    promptSuffix: null,
    tagline: "Latest Stable diffusion model",
    image: "https://st3.depositphotos.com/22052918/35458/v/450/depositphotos_354581180-stock-illustration-circle-colorful-gradient-thunder-wave.jpg",
    example: "the prompt should be clear, should describe the users base prompt in best way and add extra elements to it for maximizing performance, you can add word tags that might enhance the image result or effect its styles",
    steps: 8,
    use_guidance: true,
    defaultguidance: 3.5,
    use_negative_prompt: true,
    default_negative_prompt: "ugly, bad anatomy, blurry, pixelated, poor quality, watermark, signature, text"
  }
};
