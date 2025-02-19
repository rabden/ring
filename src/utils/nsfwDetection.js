
// Basic list of NSFW terms - can be expanded as needed
const nsfwTerms = [
  'nsfw',
  'explicit',
  'nude',
  'naked',
  'adult',
  'xxx',
  'porn',
  // Add more terms as needed
];

export const checkForNSFWContent = (text) => {
  if (!text) return { isNSFW: false, matches: [] };
  
  const lowercaseText = text.toLowerCase();
  const matches = nsfwTerms.filter(term => 
    lowercaseText.includes(term.toLowerCase())
  );
  
  return {
    isNSFW: matches.length > 0,
    matches
  };
};
