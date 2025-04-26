import { modelConfig } from '@/config/modelConfig';

/**
 * Get an array of model keys that are categorized as NSFW
 * @returns {string[]} Array of NSFW model keys
 */
export const getNsfwModelKeys = () => {
  return Object.entries(modelConfig)
    .filter(([_, config]) => config.category === "NSFW")
    .map(([key]) => key);
};

export const getModelGroups = () => {
  const groups = new Set();
  Object.values(modelConfig).forEach(config => {
    if (config.group) groups.add(config.group);
  });
  return Array.from(groups);
};
