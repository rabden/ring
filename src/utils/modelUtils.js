
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

/**
 * Check if a given model is categorized as NSFW
 * @param {string} modelKey - The key of the model to check
 * @returns {boolean} True if the model is NSFW, false otherwise
 */
export const isNsfwModel = (modelKey) => {
  if (!modelKey) return false;
  return getNsfwModelKeys().includes(modelKey);
};
