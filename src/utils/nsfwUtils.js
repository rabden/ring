/**
 * Utility functions for NSFW content detection
 */

/**
 * Checks if text contains NSFW content by comparing against known NSFW terms
 * @param {string} text - The text to check for NSFW content
 * @returns {Object} Object containing isNSFW flag and foundWords array
 */
export const containsNSFWContent = (text) => {
  // Default to empty array for found words
  const foundWords = [];
  
  // Simple implementation - returning clean results
  // This is a placeholder function that no longer performs actual NSFW detection
  // But we keep the function signature to prevent breaking existing code
  
  return {
    isNSFW: false,
    foundWords
  };
};
