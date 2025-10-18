import { QualityMetrics, MetricDetail } from '@/types';

/**
 * Calculate quality metrics for an LLM response
 * @param content - The generated text to analyze
 * @param prompt - The original prompt (for context)
 * @returns QualityMetrics object with all calculated metrics
 */
export function calculateQualityMetrics(content: string, prompt: string): QualityMetrics {
  const coherence = calculateCoherenceScore(content);
  const lexicalDiversity = calculateLexicalDiversity(content);
  const completeness = calculateCompletenessScore(content);
  const readability = calculateReadabilityScore(content);
  const lengthAppropriate = calculateLengthAppropriatenessScore(content, prompt);
  
  // Calculate overall score as weighted average
  const overallScore = Math.round(
    coherence.score * 0.25 +
    lexicalDiversity.score * 0.15 +
    completeness.score * 0.25 +
    readability.score * 0.20 +
    lengthAppropriate.score * 0.15
  );
  
  return {
    coherence,
    lexicalDiversity,
    completeness,
    readability,
    lengthAppropriate,
    overallScore
  };
}

/**
 * METRIC 1: Coherence Score (0-100)
 * Analyzes sentence structure, proper punctuation, capitalization patterns, and logical flow
 * 
 * Rationale: A coherent response should have:
 * - Proper sentence structure (starts with capital, ends with punctuation)
 * - Consistent capitalization
 * - No excessive punctuation or formatting issues
 * - Reasonable sentence length distribution
 */
function calculateCoherenceScore(content: string): MetricDetail {
  let score = 100;
  const issues: string[] = [];
  
  if (!content || content.trim().length === 0) {
    return { score: 0, explanation: 'Empty response' };
  }
  
  // Split into sentences (basic approach)
  const sentences = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (sentences.length === 0) {
    return { score: 20, explanation: 'No complete sentences found' };
  }
  
  // Check sentence capitalization
  const capitalizedSentences = sentences.filter(s => /^[A-Z]/.test(s));
  const capitalizationRatio = capitalizedSentences.length / sentences.length;
  if (capitalizationRatio < 0.8) {
    score -= 20;
    issues.push('inconsistent capitalization');
  }
  
  // Check for excessive repetition of punctuation
  const excessivePunctuation = /[!?]{3,}|\.{4,}/.test(content);
  if (excessivePunctuation) {
    score -= 15;
    issues.push('excessive punctuation');
  }
  
  // Check sentence length variance (too uniform is robotic, too varied might be incoherent)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  const stdDev = Math.sqrt(variance);
  
  // Good variance is between 3-12 words standard deviation
  if (stdDev < 2) {
    score -= 10;
    issues.push('overly uniform sentence length');
  } else if (stdDev > 15) {
    score -= 10;
    issues.push('highly varied sentence length');
  }
  
  // Check for proper paragraph structure (if multi-paragraph)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) {
    const paragraphLengths = paragraphs.map(p => p.length);
    const hasReasonableParagraphs = paragraphLengths.every(len => len > 50 && len < 2000);
    if (!hasReasonableParagraphs) {
      score -= 10;
      issues.push('inconsistent paragraph structure');
    }
  }
  
  score = Math.max(0, score);
  
  const explanation = score >= 85 
    ? 'Excellent coherence with proper structure and flow'
    : score >= 70 
    ? `Good coherence with minor issues: ${issues.join(', ')}`
    : score >= 50
    ? `Moderate coherence. Issues: ${issues.join(', ')}`
    : `Poor coherence. Issues: ${issues.join(', ')}`;
  
  return { score, explanation };
}

/**
 * METRIC 2: Lexical Diversity (0-100)
 * Calculates vocabulary richness using type-token ratio and unique word usage
 * 
 * Rationale: Higher lexical diversity indicates:
 * - Rich vocabulary usage
 * - Less repetitive language
 * - More sophisticated expression
 * - Better quality content (avoiding redundancy)
 */
function calculateLexicalDiversity(content: string): MetricDetail {
  if (!content || content.trim().length === 0) {
    return { score: 0, explanation: 'Empty response' };
  }
  
  // Tokenize (simple word extraction)
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2); // Filter out very short words
  
  if (words.length === 0) {
    return { score: 0, explanation: 'No valid words found' };
  }
  
  const uniqueWords = new Set(words);
  const typeTokenRatio = uniqueWords.size / words.length;
  
  // Calculate base score (TTR typically ranges from 0.3-0.8 for good text)
  // Map 0.3-0.8 range to 40-100 score
  let score = Math.round(Math.min(100, Math.max(0, (typeTokenRatio - 0.3) / 0.5 * 60 + 40)));
  
  // Bonus for longer texts with maintained diversity
  if (words.length > 100 && typeTokenRatio > 0.5) {
    score = Math.min(100, score + 5);
  }
  
  const explanation = score >= 85
    ? `Excellent vocabulary diversity (${uniqueWords.size} unique words from ${words.length} total)`
    : score >= 70
    ? `Good vocabulary richness with ${Math.round(typeTokenRatio * 100)}% unique words`
    : score >= 50
    ? `Moderate diversity, some repetition detected`
    : `Low diversity, high repetition (${Math.round(typeTokenRatio * 100)}% unique)`;
  
  return { score, explanation };
}

/**
 * METRIC 3: Completeness Score (0-100)
 * Checks for proper structure (introduction, body, conclusion) and content adequacy
 * 
 * Rationale: A complete response should:
 * - Have adequate length (not too short or excessively long)
 * - Contain multiple sentences or paragraphs for complex topics
 * - Show structural elements (transitions, conclusions)
 * - Provide sufficient detail
 */
function calculateCompletenessScore(content: string): MetricDetail {
  let score = 100;
  const issues: string[] = [];
  
  if (!content || content.trim().length === 0) {
    return { score: 0, explanation: 'Empty response' };
  }
  
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Check word count adequacy
  if (wordCount < 20) {
    score -= 40;
    issues.push('too brief');
  } else if (wordCount < 50) {
    score -= 20;
    issues.push('somewhat brief');
  } else if (wordCount > 1000) {
    score -= 10;
    issues.push('potentially excessive length');
  }
  
  // Check sentence count
  if (sentenceCount < 3) {
    score -= 20;
    issues.push('insufficient detail');
  }
  
  // Check for structural indicators
  const hasConclusion = /\b(in conclusion|to conclude|finally|in summary|overall|therefore)\b/i.test(content);
  const hasTransitions = /\b(however|furthermore|additionally|moreover|nevertheless|meanwhile)\b/i.test(content);
  const hasIntroduction = /\b(first|firstly|to begin|initially|let me|let\'s)\b/i.test(content);
  
  let structureBonus = 0;
  if (hasIntroduction) structureBonus += 5;
  if (hasTransitions) structureBonus += 5;
  if (hasConclusion) structureBonus += 5;
  
  // For longer responses, expect more structure
  if (wordCount > 100 && structureBonus === 0) {
    score -= 15;
    issues.push('lacks clear structure');
  } else {
    score = Math.min(100, score + structureBonus);
  }
  
  score = Math.max(0, score);
  
  const explanation = score >= 85
    ? `Complete and well-structured response (${wordCount} words, ${sentenceCount} sentences)`
    : score >= 70
    ? `Good completeness with ${wordCount} words`
    : score >= 50
    ? `Adequate but ${issues.join(', ')}`
    : `Incomplete: ${issues.join(', ')}`;
  
  return { score, explanation };
}

/**
 * METRIC 4: Readability Score (0-100)
 * Based on sentence length variance, average word length, and complexity
 * Inspired by Flesch-Kincaid readability metrics
 * 
 * Rationale: Readable text should:
 * - Have reasonable sentence length (not too long or too short)
 * - Balance simple and complex words
 * - Avoid excessive complexity
 * - Be accessible while remaining sophisticated
 */
function calculateReadabilityScore(content: string): MetricDetail {
  if (!content || content.trim().length === 0) {
    return { score: 0, explanation: 'Empty response' };
  }
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return { score: 20, explanation: 'Invalid text structure' };
  }
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch Reading Ease formula adapted
  // Original: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  // Normalize to 0-100 scale (Flesch typically ranges from 0-100, but can go negative)
  const score = Math.round(Math.max(0, Math.min(100, fleschScore)));
  
  // Ideal reading level is 60-80 on Flesch scale (conversational)
  let explanation: string;
  
  if (score >= 80) {
    explanation = `Highly readable text (avg ${avgWordsPerSentence.toFixed(1)} words/sentence)`;
  } else if (score >= 60) {
    explanation = `Good readability, conversational style`;
  } else if (score >= 50) {
    explanation = `Moderate readability, fairly complex`;
  } else if (score >= 30) {
    explanation = `Challenging readability (avg ${avgWordsPerSentence.toFixed(1)} words/sentence)`;
  } else {
    explanation = `Very complex text, may be hard to follow`;
  }
  
  return { score, explanation };
}

/**
 * Helper function to count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  
  // Adjust for silent e
  if (word.endsWith('e')) count--;
  
  // Ensure at least 1 syllable
  return Math.max(1, count);
}

/**
 * METRIC 5: Length Appropriateness (0-100)
 * Compares response length to prompt complexity and type
 * 
 * Rationale: Good responses should:
 * - Match the prompt's expected length
 * - Provide adequate detail for complex prompts
 * - Be concise for simple prompts
 * - Not be unnecessarily verbose or terse
 */
function calculateLengthAppropriatenessScore(content: string, prompt: string): MetricDetail {
  if (!content || content.trim().length === 0) {
    return { score: 0, explanation: 'Empty response' };
  }
  
  const responseWords = content.split(/\s+/).length;
  const promptWords = prompt.split(/\s+/).length;
  
  // Estimate expected response length based on prompt
  let expectedMinWords = 50;
  let expectedMaxWords = 300;
  
  // Adjust expectations based on prompt characteristics
  if (promptWords > 50) {
    // Complex/detailed prompt
    expectedMinWords = 100;
    expectedMaxWords = 500;
  } else if (promptWords < 10) {
    // Simple prompt
    expectedMinWords = 30;
    expectedMaxWords = 200;
  }
  
  // Check for question words indicating need for detailed response
  const requiresDetail = /\b(explain|describe|elaborate|discuss|analyze|compare|why|how)\b/i.test(prompt);
  if (requiresDetail) {
    expectedMinWords = Math.max(expectedMinWords, 80);
    expectedMaxWords = Math.max(expectedMaxWords, 400);
  }
  
  // Check for brevity requests
  const requestsBrevity = /\b(brief|short|concise|summary|summarize|quick)\b/i.test(prompt);
  if (requestsBrevity) {
    expectedMinWords = Math.min(expectedMinWords, 30);
    expectedMaxWords = Math.min(expectedMaxWords, 150);
  }
  
  let score = 100;
  let explanation: string;
  
  if (responseWords < expectedMinWords * 0.5) {
    score = 30;
    explanation = `Too brief (${responseWords} words). Expected ${expectedMinWords}-${expectedMaxWords} words`;
  } else if (responseWords < expectedMinWords) {
    score = 70;
    explanation = `Somewhat brief (${responseWords} words). Could be more detailed`;
  } else if (responseWords > expectedMaxWords * 2) {
    score = 50;
    explanation = `Excessively long (${responseWords} words). Expected ${expectedMinWords}-${expectedMaxWords} words`;
  } else if (responseWords > expectedMaxWords) {
    score = 75;
    explanation = `Slightly verbose (${responseWords} words)`;
  } else {
    score = 100;
    explanation = `Appropriate length (${responseWords} words) for the given prompt`;
  }
  
  return { score, explanation };
}

