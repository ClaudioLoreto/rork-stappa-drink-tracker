const OFFENSIVE_WORDS_IT = [
  'cazzo', 'merda', 'fottere', 'coglione', 'stronzo', 'bastardo', 'puttana', 
  'troia', 'porco', 'vaffanculo', 'deficiente', 'idiota'
];

const OFFENSIVE_WORDS_EN = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 
  'idiot', 'stupid', 'jerk', 'dick', 'pussy'
];

const ALL_OFFENSIVE_WORDS = [...OFFENSIVE_WORDS_IT, ...OFFENSIVE_WORDS_EN];

export function moderateContent(text: string): { isClean: boolean; filteredText: string } {
  if (!text) return { isClean: true, filteredText: text };

  const lowerText = text.toLowerCase();
  let isClean = true;
  let filteredText = text;

  for (const word of ALL_OFFENSIVE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      isClean = false;
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    }
  }

  return { isClean, filteredText };
}

export function isImageAppropriate(imageUrl: string): Promise<boolean> {
  console.log('Image moderation check for:', imageUrl);
  return Promise.resolve(true);
}
