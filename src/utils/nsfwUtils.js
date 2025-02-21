// List of NSFW words to check against
const NSFW_WORDS = [
  // Basic NSFW terms
  'nude', 'naked', 'nsfw', 'porn', 'pornographic', 'explicit',
  'xxx', 'sex', 'sexual', 'erotic', 'nudity', 'hentai', 'obscene',
  'inappropriate', 'indecent', 'vulgar', 'offensive', 'explicit', 'fuck', 'fucking',
  
  // Body-related terms
  'topless', 'bottomless', 'nipple', 'nipples', 'cleavage', 'bust','voluptuous', 'thicc',
  'waist', 'hip', 'hips', 'thighs', 'legs', 'buttocks', 'breasts',
  
  // Suggestive terms
  'seductive', 'sensual', 'provocative', 'intimate',
  'risque', 'lewd', 'kinky', 'fetish', 'bdsm', 'bondage',
  'arousing', 'aroused', 'teasing', 'flirtatious', 'naughty',
  'lustful', 'mating', 'mating season', 'mating ritual', 'mating behavior',
  
  // Inappropriate content
  'inappropriate', 'uncensored', 'unclothed', 'undressed', 'undressing',
  'strip', 'stripping', 'striptease', 'burlesque',
  
  // Anatomical references
  'breast', 'boob', 'nipple', 'butt', 'ass', 'crotch', 'groin',
  'genitalia', 'genital', 'private parts', 'pubic', 'pubic hair', 'boobs',
  'anatomy', 'body part', 'intimate parts', 'private area', 'privates',
  'reproductive', 'reproductive organ', 'dick', 'dicks', 'penis', 'penises', 'dildo', 'dildos', 'pussy', 'cunt',
  
  // Actions/poses
  'pose', 'posing', 'suggestive', 'flirting', 'flirty',
  'teasing', 'tease', 'seducing', 'seduce', 'caress', 'caressing',
  'fondling', 'fondle', 'sucking', 'suck',
  
  
  // Clothing states
  'undressed', 'unclothed', 'disrobed', 'disrobing', 'underdressed',
  'scantily', 'barely dressed', 'half dressed', 'partially dressed',
  'partially undressed', 'clothes off', 'taking off', 'removing clothes',
  'strip', 'stripping', 'undressing', 'undress', 'sheer',
  'lingerie', 'underwear', 'bra', 'panties', 'thong', 'bikini', 'negligee', 'intimate apparel', 'undergarments',
  
  // Content descriptors
  'mature', 'r-rated', 'x-rated', '18+', 'adult content',
  'age restricted', 'not safe for work', 'nsfw content',
  'adult material', 'adult oriented', 'adult themed',
  'sexually explicit', 'sexually suggestive', 'erotic content',
  'forbidden', 'taboo', 'restricted', 'censored', 'uncensored', 'xxx',
  
  // Artistic/photography terms
  'glamour', 'boudoir', 'pinup', 'pin-up', 'centerfold',
  'artistic nude', 'figure study', 'body study', 'nude study',
  'nude art', 'nude photography', 'erotic art', 'erotic photography',
  'sensual art', 'sensual photography', 'adult art', 'adult photography'
];

export const containsNSFWContent = (prompt) => {
  if (!prompt) return false;
  
  const lowercasePrompt = prompt.toLowerCase();
  const words = lowercasePrompt.split(/\s+/);
  
  // Check each word against the NSFW list
  const foundNSFWWords = NSFW_WORDS.filter(nsfwWord => 
    words.some(word => word.includes(nsfwWord))
  );
  
  return {
    isNSFW: foundNSFWWords.length > 0,
    foundWords: foundNSFWWords
  };
}; 