// Offensive words database - Italian
const OFFENSIVE_WORDS_IT = [
  'cazzo', 'merda', 'fottere', 'coglione', 'stronzo', 'bastardo', 'puttana', 
  'troia', 'porco', 'vaffanculo', 'deficiente', 'idiota', 'culo', 'cretino',
  'figa', 'minchia', 'porco dio', 'madonna', 'dio cane', 'dio porco', 'dio boia',
  'razzista', 'negro', 'terrone', 'sporco', 'schifoso', 'zoccola', 'porca', 
  'fascista', 'nazista', 'comunista di merda', 'ebreo', 'zingarо'
];

// Offensive words database - English
const OFFENSIVE_WORDS_EN = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 
  'idiot', 'stupid', 'jerk', 'dick', 'pussy', 'cock', 'cunt', 'whore',
  'slut', 'nigger', 'racist', 'nazi', 'fascist', 'retard', 'fag', 'faggot',
  'kike', 'chink', 'spic', 'gook'
];

// Hate symbols, political extremism and racial hatred (Unicode and text variants)
const HATE_SYMBOLS = [
  '卐', '卍', // Swastika variants
  'swastika', 'svastica',
  'heil hitler', 'hitler', 'mein kampf',
  'kkk', 'ku klux klan',
  'white power', 'supremazia bianca', 'white supremacy',
  'black lives don\'t matter', 'fuck blm',
  '1488', '88', '14/88', // Nazi codes
  'holocaust fake', 'olocausto falso',
  'gas the', 'gasare gli',
  'morte agli', 'death to',
  'kill all', 'uccidi tutti',
];

// Political extremism and incitement to hatred
const POLITICAL_EXTREMISM_IT = [
  'morte ai neri', 'morte agli ebrei', 'morte agli immigrati',
  'bruciamo i', 'ammazzare i', 'eliminare i',
  'razza superiore', 'razza inferiore', 'razza pura',
  'pulizia etnica', 'genocidio', 'soluzione finale'
];

const POLITICAL_EXTREMISM_EN = [
  'death to blacks', 'death to jews', 'death to immigrants',
  'burn the', 'kill the', 'eliminate the',
  'superior race', 'inferior race', 'pure race',
  'ethnic cleansing', 'genocide', 'final solution',
  'white genocide', 'great replacement'
];

// Pornographic/sexual content keywords
const SEXUAL_CONTENT_IT = [
  'porno', 'xxx', 'sesso', 'nudo', 'nuda', 'scopare', 'pompino',
  'orgasmo', 'masturbazione', 'erezione', 'penetrazione', 'sborrata',
  'tette', 'culo nudo', 'sesso anale', 'sesso orale', 'gang bang'
];

const SEXUAL_CONTENT_EN = [
  'porn', 'xxx', 'sex', 'nude', 'naked', 'fuck', 'blowjob', 'orgasm',
  'masturbate', 'erection', 'penetration', 'pussy', 'cock', 'dick', 'tits',
  'boobs', 'ass', 'anal', 'cumshot', 'gang bang', 'threesome'
];

// Violent content keywords
const VIOLENT_CONTENT_IT = [
  'ammazzare', 'uccidere', 'sgozzare', 'decapitare', 'torturare',
  'violenza', 'pestaggio', 'stupro', 'stuprare', 'violentare',
  'sparare', 'sparatoria', 'bomba', 'attentato', 'terrorismo',
  'suicidio', 'suicidarsi', 'tagliarsi', 'sangue', 'gore'
];

const VIOLENT_CONTENT_EN = [
  'kill', 'murder', 'slaughter', 'behead', 'torture',
  'violence', 'beating', 'rape', 'assault', 'attack',
  'shoot', 'shooting', 'bomb', 'terrorist', 'terrorism',
  'suicide', 'self harm', 'cut myself', 'blood', 'gore'
];

const ALL_OFFENSIVE_WORDS = [...OFFENSIVE_WORDS_IT, ...OFFENSIVE_WORDS_EN];
const ALL_HATE_CONTENT = [...HATE_SYMBOLS, ...POLITICAL_EXTREMISM_IT, ...POLITICAL_EXTREMISM_EN];
const ALL_SEXUAL_CONTENT = [...SEXUAL_CONTENT_IT, ...SEXUAL_CONTENT_EN];
const ALL_VIOLENT_CONTENT = [...VIOLENT_CONTENT_IT, ...VIOLENT_CONTENT_EN];

export interface ModerationResult {
  isClean: boolean;
  filteredText: string;
  violations: string[];
  reason?: 'offensive' | 'hate_speech' | 'sexual_content' | 'violence' | 'political_extremism';
}

/**
 * Comprehensive content moderation for text
 * Checks for: offensive language, hate speech, sexual content, violence, political extremism
 * Supports IT and EN languages
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { isClean: true, filteredText: text, violations: [] };
  }

  const lowerText = text.toLowerCase();
  let isClean = true;
  let filteredText = text;
  const violations: string[] = [];
  let reason: ModerationResult['reason'] = undefined;

  // Priority 1: Check for hate symbols and political extremism
  for (const symbol of ALL_HATE_CONTENT) {
    const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(lowerText)) {
      isClean = false;
      violations.push(symbol);
      reason = reason || 'political_extremism';
      filteredText = filteredText.replace(regex, '***');
    }
  }

  // Priority 2: Check for violent content
  for (const word of ALL_VIOLENT_CONTENT) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      isClean = false;
      violations.push(word);
      if (!reason) reason = 'violence';
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    }
  }

  // Priority 3: Check for sexual/pornographic content
  for (const word of ALL_SEXUAL_CONTENT) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      isClean = false;
      violations.push(word);
      if (!reason) reason = 'sexual_content';
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    }
  }

  // Priority 4: Check for offensive words
  for (const word of ALL_OFFENSIVE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      isClean = false;
      violations.push(word);
      if (!reason) reason = 'offensive';
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    }
  }

  return { isClean, filteredText, violations, reason };
}

/**
 * Basic image content moderation
 * Checks for inappropriate images using simple heuristics
 * In production, this should use a proper image moderation API (e.g., AWS Rekognition, Google Vision AI)
 */
export async function isImageAppropriate(imageDataUri: string): Promise<{
  isAppropriate: boolean;
  reason?: string;
}> {
  // Basic validation
  if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
    return { isAppropriate: false, reason: 'Invalid image format' };
  }

  // Check file size (reject if > 10MB)
  const base64Length = imageDataUri.split(',')[1]?.length || 0;
  const sizeInBytes = (base64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  if (sizeInMB > 10) {
    return { isAppropriate: false, reason: 'Image too large' };
  }

  // TODO: Implement actual image content analysis
  // For production, integrate with:
  // - AWS Rekognition (detectModerationLabels)
  // - Google Cloud Vision API (SafeSearchDetection)
  // - Azure Content Moderator
  // - Sightengine API
  
  // For now, basic checks only
  console.log(`[Moderation] Image check: ${sizeInMB.toFixed(2)}MB`);
  
  // Simulate async API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return { isAppropriate: true };
}

/**
 * Validate text content before submission
 * Returns error message if content is inappropriate with detailed explanation
 */
export function validateTextContent(text: string, language: 'it' | 'en' = 'it'): { 
  isValid: boolean; 
  error?: string;
  reason?: ModerationResult['reason'];
} {
  if (!text || text.trim().length === 0) {
    return { isValid: true };
  }

  const result = moderateContent(text);
  
  if (!result.isClean) {
    let error = '';
    
    // Detailed error messages based on violation type
    if (result.reason === 'hate_speech' || result.reason === 'political_extremism') {
      error = language === 'it' 
        ? '❌ Incitamento all\'odio\n\nIl tuo contenuto contiene simboli razzisti, linguaggio discriminatorio o incitamento all\'odio.\n\nNon sono consentiti:\n• Simboli nazisti o razzisti (svastiche, KKK)\n• Insulti razziali o etnici\n• Incitamento alla violenza contro gruppi\n• Estremismo politico\n\n⚠️ Rispetta le linee guida della community.'
        : '❌ Hate speech\n\nYour content contains racist symbols, discriminatory language, or incitement to hatred.\n\nNot allowed:\n• Nazi or racist symbols (swastikas, KKK)\n• Racial or ethnic slurs\n• Incitement to violence against groups\n• Political extremism\n\n⚠️ Please respect community guidelines.';
    } else if (result.reason === 'sexual_content') {
      error = language === 'it'
        ? '❌ Contenuto pornografico\n\nIl tuo contenuto contiene materiale sessualmente esplicito.\n\nNon sono consentiti:\n• Contenuto pornografico\n• Linguaggio sessuale esplicito\n• Riferimenti inappropriati\n\n⚠️ Mantieni l\'app un luogo sicuro per tutti.'
        : '❌ Pornographic content\n\nYour content contains sexually explicit material.\n\nNot allowed:\n• Pornographic content\n• Explicit sexual language\n• Inappropriate references\n\n⚠️ Keep the app a safe place for everyone.';
    } else if (result.reason === 'violence') {
      error = language === 'it'
        ? '❌ Contenuto violento\n\nIl tuo contenuto contiene riferimenti a violenza o autolesionismo.\n\nNon sono consentiti:\n• Minacce di violenza\n• Riferimenti a terrorismo\n• Incitamento all\'autolesionismo\n• Linguaggio violento esplicito\n\n⚠️ Se hai bisogno di aiuto, contatta servizi di supporto.'
        : '❌ Violent content\n\nYour content contains references to violence or self-harm.\n\nNot allowed:\n• Threats of violence\n• References to terrorism\n• Incitement to self-harm\n• Explicit violent language\n\n⚠️ If you need help, please contact support services.';
    } else {
      error = language === 'it'
        ? '❌ Linguaggio offensivo\n\nIl tuo contenuto contiene insulti o linguaggio inappropriato.\n\nNon sono consentiti:\n• Bestemmie eccessive\n• Insulti personali\n• Linguaggio volgare\n\n⚠️ Usa un linguaggio rispettoso.'
        : '❌ Offensive language\n\nYour content contains insults or inappropriate language.\n\nNot allowed:\n• Excessive profanity\n• Personal insults\n• Vulgar language\n\n⚠️ Please use respectful language.';
    }
    
    return { isValid: false, error, reason: result.reason };
  }

  return { isValid: true };
}
