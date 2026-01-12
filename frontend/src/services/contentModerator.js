// Content Moderation Service using Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL;

// Simple profanity filter
class ProfanityFilter {
  constructor() {
    this.badWords = [
      // English profanity
      'fuck', 'shit', 'bitch', 'asshole', 'damn', 'bastard',
       'cunt', 'whore', 'slut',
      'nigger', 'fag', 'retard', 'kill yourself', 'kys',
      // Roman Urdu
      'chutiya', 'chutiye',
      'harami', 'haram', 'kutta', 'kutti', 'kameena', 'kamina',
      'saala', 'sala', 'BC', 'MC', 'kanjri'
    ];
  }

  isProfane(text) {
    const lowerText = text.toLowerCase();
    return this.badWords.some(word => lowerText.includes(word.toLowerCase()));
  }
}

class ContentModerator {
  constructor() {
    this.lastCallTime = 0;
    this.minInterval = 1000; // Minimum 1 second between calls
    this.pendingChecks = new Map();
    this.filter = new ProfanityFilter();
  }

  // Check if content contains abusive/inappropriate words
  async checkContent(content, userId) {
    // Rate limiting: prevent rapid consecutive calls
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check if same content is already being checked
    const contentKey = `${userId}_${content}`;
    if (this.pendingChecks.has(contentKey)) {
      return await this.pendingChecks.get(contentKey);
    }

    const checkPromise = this._performCheck(content);
    this.pendingChecks.set(contentKey, checkPromise);
    
    try {
      const result = await checkPromise;
      return result;
    } finally {
      this.pendingChecks.delete(contentKey);
      this.lastCallTime = Date.now();
    }
  }

  async _performCheck(content) {
    try {
      // First, use bad-words library to check for profanity
      const isProfane = this.filter.isProfane(content);

      if (isProfane) {
        console.log("Content flagged by bad-words filter");
        return { isFlagged: true, error: false, method: 'keyword' };
      }

      // Then use Gemini API for more sophisticated checking
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a strict content moderation AI. Analyze this message for ANY inappropriate, offensive, abusive, hateful, violent, sexual, or vulgar content. 

Be VERY strict. Flag content that contains:
- Profanity or curse words
- Sexual content or innuendo
- Threats or violence
- Hate speech or discrimination
- Harassment or bullying
- Any inappropriate language

Respond with ONLY one word:
- "FLAGGED" if inappropriate
- "CLEAN" if completely appropriate

Message to analyze: "${content}"

Your response:`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 10,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error("Gemini API error:", response.status);
        // If API fails, rely on bad-words library check
        return { isFlagged: isProfane, error: true, method: 'fallback' };
      }

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
      
      console.log("Gemini API response:", result);
      
      const isFlagged = result?.includes("FLAGGED");
      
      return {
        isFlagged: isFlagged,
        error: false,
        method: 'gemini'
      };
    } catch (error) {
      console.error("Error checking content:", error);
      // In case of error, use bad-words library as fallback
      const isProfane = this.filter.isProfane(content);
      return { isFlagged: isProfane, error: true, method: 'error-fallback' };
    }
  }
}

export const contentModerator = new ContentModerator();
