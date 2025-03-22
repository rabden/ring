
// List of NSFW words to check against
const NSFW_WORDS = [
  // Basic NSFW terms
  'nude', 'naked', 'nsfw', 'porn', 'pornographic', 'explicit',
  'xxx', 'sex', 'sexual', 'erotic', 'nudity', 'hentai', 'obscene',
  'inappropriate', 'indecent', 'vulgar', 'offensive', 'explicit', 'fuck', 'fucking', 'sexy',
  
  // Body-related terms
  'topless', 'bottomless', 'nipple', 'nipples', 'cleavage', 'bust', 'voluptuous', 'thicc', 'buttocks', 'breasts', 'porno', 'hard-core', 'hardcore', 'seductive', 'errotice', 'intimacy', 'nothing on showing off her entire body',
  
  // Suggestive terms
  'seductive', 'sensual', 'provocative', 'intimate',
  'risque', 'lewd', 'kinky', 'fetish', 'bdsm', 'bondage',
  'arousing', 'aroused', 'teasing', 'flirtatious', 'naughty',
  'lustful', 'mating', 'mating season', 'mating ritual', 'mating behavior', 'uncensored', 'nothing on showing off her entire body',
  
  // Inappropriate content
  'inappropriate', 'uncensored', 'unclothed', 'undressed', 'undressing',
  'strip', 'stripping', 'striptease', 'burlesque', 'brunett',
  
  // Anatomical references
  'breast', 'boob', 'nipple', 'butt', 'ass', 'crotch', 'groin',
  'genitalia', 'genital', 'private parts', 'pubic', 'pubic hair', 'boobs',
  'anatomy', 'body part', 'intimate parts', 'private area', 'privates',
  'reproductive', 'reproductive organ', 'dick', 'dicks', 'penis', 'penises', 'dildo', 'dildos', 'pussy', 'cunt',
  
  // Actions/poses
  'suggestive', 'flirting', 'flirty',
  'teasing', 'tease', 'seducing', 'seduce', 'caress', 'caressing',
  'fondling', 'fondle', 'sucking', 'suck',
  
  // Clothing states
  'undressed', 'unclothed', 'disrobed', 'disrobing', 'underdressed',
  'scantily', 'barely dressed', 'half dressed', 'partially dressed',
  'partially undressed', 'clothes off', 'taking off', 'removing clothes', 'no cloths', 'no clothes', 'no cloth', 'undressing',
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

// Helper function to escape special regex characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Create a regex pattern for whole word matching
const createWordBoundaryPattern = (word) => {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
};

export const containsNSFWContent = (prompt) => {
  if (!prompt) return { isNSFW: false, foundWords: [] };
  
  const lowercasePrompt = prompt.toLowerCase();
  
  // Check each word against the NSFW list using word boundaries
  const foundNSFWWords = NSFW_WORDS.filter(nsfwWord => {
    // For multi-word NSFW terms
    if (nsfwWord.includes(' ')) {
      return lowercasePrompt.includes(nsfwWord);
    }
    // For single-word terms, use word boundary check
    return createWordBoundaryPattern(nsfwWord).test(lowercasePrompt);
  });
  
  return {
    isNSFW: foundNSFWWords.length > 0,
    foundWords: foundNSFWWords
  };
};

// Helper function for the UI to highlight NSFW words in HTML
export const highlightNSFWWords = (text) => {
  if (!text) return { html: '', isNSFW: false };
  
  const { foundWords, isNSFW } = containsNSFWContent(text);
  if (!isNSFW || foundWords.length === 0) {
    return { html: text, isNSFW: false };
  }

  // Create regex pattern to match all NSFW words
  const wordPattern = foundWords.map(word => {
    if (word.includes(' ')) {
      return escapeRegExp(word);
    }
    return `\\b${escapeRegExp(word)}\\b`;
  }).join('|');
  
  if (!wordPattern) {
    return { html: text, isNSFW: false };
  }

  const regex = new RegExp(wordPattern, 'gi');
  const html = text.replace(regex, match => {
    return `<span class="bg-destructive/20 text-destructive font-medium rounded px-1">${match}</span>`;
  });

  return { html, isNSFW: true };
};
