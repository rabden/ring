
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
 * Check if a model is categorized as NSFW
 * @param {string} modelKey - The model key to check
 * @returns {boolean} True if the model is NSFW
 */
export const isNsfwModel = (modelKey) => {
  const nsfwModels = getNsfwModelKeys();
  return nsfwModels.includes(modelKey);
};

/**
 * Get a list of all NSFW model keys as a comma-separated string of quoted values
 * for use in SQL queries
 * @returns {string} SQL-ready list of NSFW model keys
 */
export const getNsfwModelKeysForSql = () => {
  const nsfwModels = getNsfwModelKeys();
  return nsfwModels.map(key => `'${key}'`).join(', ');
};
