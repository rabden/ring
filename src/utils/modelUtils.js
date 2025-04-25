
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
