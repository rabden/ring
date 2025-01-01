export const aspectRatios = {
  "9:21": { width: 439, height: 1024 },
  "9:16": { width: 576, height: 1024 },
  "2:3": { width: 683, height: 1024 },
  "3:4": { width: 768, height: 1024 },
  "4:5": { width: 819, height: 1024 },
  "10:16": { width: 640, height: 1024 },
  "1:2": { width: 512, height: 1024 },
  "1:1": { width: 1024, height: 1024 },
  "5:4": { width: 1024, height: 819 },
  "4:3": { width: 1024, height: 768 },
  "3:2": { width: 1024, height: 683 },
  "16:10": { width: 1024, height: 640 },
  "16:9": { width: 1024, height: 576 },
  "2:1": { width: 1024, height: 512 },
  "21:9": { width: 1024, height: 439 },
}

export const qualityOptions = {
  "HD": 1024,
  "HD+": 1536
}

export const modelConfigs = {
  turbo: {
    name: "Turbo",
    category: "General",
    isPremium: false,
    tagline: "Fast generation with good quality",
    image: "/models/turbo.png"
  },
  preLar: {
    name: "PreLar",
    category: "General",
    isPremium: true,
    tagline: "High-quality artistic creations",
    image: "/models/prelar.png"
  },
  fluxDev: {
    name: "FluxDev",
    category: "NSFW",
    isPremium: true,
    tagline: "Advanced NSFW generation",
    image: "/models/fluxdev.png"
  }
}

export const findClosestAspectRatio = (width, height) => {
  const targetRatio = width / height;
  let closestRatio = "1:1";
  let smallestDiff = Infinity;

  Object.entries(aspectRatios).forEach(([ratio, dimensions]) => {
    const currentRatio = dimensions.width / dimensions.height;
    const diff = Math.abs(currentRatio - targetRatio);
    
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestRatio = ratio;
    }
  });

  return closestRatio;
};

export const isValidAspectRatio = (ratio) => {
  return ratio in aspectRatios;
};