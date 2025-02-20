
// Common NSFW words and patterns to check for
const NSFW_PATTERNS = [
  // Basic explicit terms
  /\b(nude|naked|nsfw|porn|xxx)\b/i,
  // Violence-related terms
  /\b(gore|violence|bloody|murder)\b/i,
  // Add more patterns as needed
];

export const containsNSFWContent = (text) => {
  if (!text) return false;
  
  // Convert text to lowercase for case-insensitive matching
  const lowercaseText = text.toLowerCase();
  
  // Check each pattern
  return NSFW_PATTERNS.some(pattern => pattern.test(lowercaseText));
};

export const sanitizePrompt = (prompt) => {
  if (!prompt) return '';
  
  // Replace matches with [FILTERED]
  let sanitized = prompt;
  NSFW_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  });
  
  return sanitized;
};
