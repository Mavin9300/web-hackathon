import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });

const aiService = {
  async detectSpam(book) {
    try {
      const prompt = `
        Analyze if the following book details appear to be spam, fake, or low-quality content.
        
        Book Details:
        Title: ${book.title}
        Author: ${book.author}
        Description: ${book.description}
        
        Consider spam indicators:
        - Random characters or gibberish
        - Nonsensical combinations
        - Very short or no meaningful description
        - Repeated characters or patterns
        - Inappropriate or unrelated content
        
        Return ONLY "true" if it's spam or "false" if it's legitimate. No other text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toLowerCase();
      
      console.log(`[aiService] Spam detection for "${book.title}": ${text}`);
      return text === 'true';
    } catch (error) {
      console.error("[aiService] Error detecting spam:", error);
      return false; // Default to not spam if error
    }
  },

  async calculateBookPoints(book) {
    try {
      // First check for spam
      const isSpam = await this.detectSpam(book);
      if (isSpam) {
        console.log(`[aiService] Spam detected for "${book.title}", assigning 10 points`);
        return 10;
      }

      const prompt = `
        Evaluate the following book and assign a point value between 10 and 100 based on:
        1. Demand: How popular or sought-after is this book?
        2. Rarity: How rare or hard to find is this book?
        3. Condition: ${book.condition === 'new' ? 'Brand new condition (higher value)' : 'Used condition (moderate value)'}
        
        Book Details:
        Title: ${book.title}
        Author: ${book.author}
        Description: ${book.description}
        Condition: ${book.condition}
        
        Scoring Guidelines:
        - Classic/popular books in demand: 60-100 points
        - Rare or collectible books: 70-100 points
        - New condition adds 10-20 points bonus
        - Common books with low demand: 20-40 points
        - Standard books: 30-50 points
        - Minimum score is always 10
        
        Return ONLY the number between 10-100. No text or explanation.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      console.log(`[aiService] Gemini Raw Response: "${text}"`);

      const match = text.match(/\d+/);
      let points = match ? parseInt(match[0]) : 10;
      
      if (isNaN(points)) points = 10;
      if (points < 10) points = 10;
      if (points > 100) points = 100;

      console.log(`[aiService] Calculated points for "${book.title}": ${points}`);
      return points;
    } catch (error) {
      console.error("[aiService] Error calculating points:", error);
      return 10;
    }
  }
};

export default aiService;
