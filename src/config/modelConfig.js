
export const modelConfig = {
  flux: {
    name: "Flux.1 Schnell",
    category: "General",
    group: "Base Models",
    huggingfaceId: "black-forest-labs/FLUX.1-schnell",
    qualityLimits: null,
    isPremium: false,
    promptSuffix: null,
    tagline: "Balanced of speed and quality",
    image: "https://i.ibb.co.com/51P0fS0/out-0.webp",
    example: "the prompt should be clear, should describe the users base prompt in best way and add extra elements to it for maximizing performance, you can add word tags that might enhance the image result or effect its styles",
    steps: 4,
    use_guidance: false,
    defaultguidance: 7.5,
    use_negative_prompt: false
  },
  fluxDev: {
    name: "FLx.1 Dev",
    category: "General",
    group: "Base Models",
    huggingfaceId: "black-forest-labs/FLUX.1-dev",
    qualityLimits: null,
    isPremium: false,
    promptSuffix: null,
    tagline: "Flux dev by black forest labs",
    image: "https://i.ibb.co/gjrM8R5/out-0-1.webp",
    example: "the prompt should be clear, should describe the users base prompt in best way and add extra elements to it for maximizing performance, you can add word tags that might enhance the image result or effect its styles",
    steps: 28,
    use_guidance: false,
    use_negative_prompt: false
  },
  sd35l: {
    name: "SD-3.5Large",
    category: "General",
    group: "Base Models",
    huggingfaceId: "stabilityai/stable-diffusion-3.5-large",
    qualityLimits: ["HD"],
    isPremium: false,
    promptSuffix: null,
    tagline: "Latest Stable diffusion model",
    image: "https://i.ibb.co/XDLVk6m/R8-sd3-5-L-00001.webp",
    example: "the prompt should be clear, should describe the users base prompt in best way and add extra elements to it for maximizing performance, you can add word tags that might enhance the image result or effect its styles",
    steps: 40,
    use_guidance: true,
    defaultguidance: 4.5,
    use_negative_prompt: false,
    default_negative_prompt: "ugly, bad anatomy, blurry, pixelated, poor quality, watermark, signature, text"
  }
};
