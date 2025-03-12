const { OpenAI } = require('openai');
const config = require('../config/config');

// Initialize OpenAI client if API key is available
let openai = null;
try {
  // Support both standard OpenAI API keys and project-based keys
  if (config.OPENAI_API_KEY && 
     (config.OPENAI_API_KEY.startsWith('sk-') || config.OPENAI_API_KEY.startsWith('sk-proj-')) && 
     config.OPENAI_API_KEY.length > 20) {
    openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.log('Invalid OpenAI API key format. AI features will be disabled.');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error.message);
}

console.log('OpenAI API Key:', config.OPENAI_API_KEY ? 'Key is set' : 'Key is missing');
console.log('OpenAI Model:', config.OPENAI_MODEL);

// Default analysis response when AI is unavailable
const defaultAnalysis = {
  entryType: "unclassified",
  emotions: [{ name: "neutral", intensity: 0.5 }],
  keyConcepts: ["journal entry"],
  goals: [],
  tasks: [],
  relatedConcepts: [],
  summary: "AI analysis is currently unavailable. Please check your OpenAI API key configuration."
};

// Default weekly summary when AI is unavailable
const defaultWeeklySummary = {
  summary: "AI-powered weekly summary is currently unavailable.",
  insights: ["No AI-powered insights available"],
  emotionalTrends: ["No emotional trends detected"],
  accomplishments: ["No accomplishments detected"],
  challenges: ["No challenges detected"],
  recommendations: ["Configure a valid OpenAI API key to enable AI features"]
};

/**
 * Generate embedding vector for content using OpenAI
 * @param {string} content - Text content to generate embedding for
 * @returns {Promise<number[]|null>} Array of embedding values or null if error
 */
const generateEmbedding = async (content) => {
  if (!openai) {
    console.log('OpenAI client not initialized. Cannot generate embedding.');
    return null;
  }
  
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content.slice(0, 8000), // Limit to first 8000 chars for ada-002 model
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    return null;
  }
};

/**
 * Find related entries based on content similarity
 * @param {string} content - Entry content
 * @param {Array} previousEntries - Array of previous journal entries
 * @returns {Promise<Array>} Array of related entries with strength scores
 */
const findRelatedEntries = async (content, previousEntries) => {
  if (!openai || previousEntries.length === 0) {
    return [];
  }
  
  try {
    // Generate embedding for current content
    const contentEmbedding = await generateEmbedding(content);
    if (!contentEmbedding) return [];
    
    // For entries that don't have embeddings yet, generate them
    const entriesWithEmbeddings = await Promise.all(
      previousEntries.map(async (entry) => {
        if (!entry.vectorEmbedding) {
          // Only compute if not already present
          const embedding = await generateEmbedding(entry.content);
          return { ...entry, computedEmbedding: embedding || [] };
        }
        return { ...entry, computedEmbedding: entry.vectorEmbedding };
      })
    );
    
    // Calculate cosine similarity between current content and previous entries
    const relatedEntries = entriesWithEmbeddings
      .map((entry) => {
        if (!entry.computedEmbedding || entry.computedEmbedding.length === 0) {
          return { entryId: entry._id, relationStrength: 0 };
        }
        
        // Calculate cosine similarity
        const similarity = cosineSimilarity(contentEmbedding, entry.computedEmbedding);
        return {
          entryId: entry._id,
          relationStrength: similarity
        };
      })
      .filter(entry => entry.relationStrength > 0.7) // Only return strong relationships
      .sort((a, b) => b.relationStrength - a.relationStrength)
      .slice(0, 5); // Return top 5 related entries
    
    return relatedEntries;
  } catch (error) {
    console.error('Error finding related entries:', error.message);
    return [];
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} Cosine similarity score (0-1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Analyze text content using OpenAI API
 * @param {string} content - The journal entry content to analyze
 * @param {Array} previousEntries - Optional array of previous entries for relationship tracking
 * @returns {Promise<Object>} Analysis results including entry type, emotions, and key concepts
 */
const analyzeContent = async (content, previousEntries = []) => {
  console.log('Analyzing content...');
  
  // If OpenAI client is not initialized, return default analysis
  if (!openai) {
    console.log('OpenAI client not initialized. Returning default analysis.');
    return defaultAnalysis;
  }
  
  try {
    console.log(`Attempting to use model: ${config.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
    
    const response = await openai.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes journal entries according to the COMMIT framework.
          Analyze the provided journal entry and return a JSON object with the following information:
          1. entryType: Classify the entry as one of the following: "context", "objectives", "mindmap", "ideate", "track", or "unclassified"
          2. emotions: Identify the primary emotions expressed in the entry (array of objects with name and intensity properties, intensity should be a number between 0 and 1)
          3. keyConcepts: Extract the main concepts or topics mentioned (array of strings)
          4. goals: Identify any goals mentioned (array of objects with description, timeframe, and status properties)
          5. tasks: Extract any tasks or action items (array of objects with description, priority, and status properties)
          6. relatedConcepts: Extract concepts that might connect to other journal entries (array of strings)
          7. summary: A brief 1-2 sentence summary of the entry`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    console.log('OpenAI response received');
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(response.choices[0].message.content);
    console.log('Successfully parsed OpenAI response');
    
    // Find related entries if previous entries are provided
    let relatedEntries = [];
    if (previousEntries && previousEntries.length > 0) {
      console.log('Finding related entries...');
      relatedEntries = await findRelatedEntries(content, previousEntries);
      console.log(`Found ${relatedEntries.length} related entries`);
    }
    
    // Generate embedding for the content
    const embedding = await generateEmbedding(content);
    
    return {
      ...parsedResponse,
      relatedEntries,
      vectorEmbedding: embedding
    };
  } catch (error) {
    console.error('Error analyzing content with OpenAI:', error.message);
    
    // Return a default response structure
    console.log('Returning default analysis structure due to error');
    return defaultAnalysis;
  }
};

/**
 * Generate a weekly summary of journal entries
 * @param {Array} entries - Array of journal entries for the week
 * @returns {Promise<Object>} Summary including insights, patterns, and recommendations
 */
const generateWeeklySummary = async (entries) => {
  console.log('Generating weekly summary...');
  
  // If OpenAI client is not initialized, return default summary
  if (!openai) {
    console.log('OpenAI client not initialized. Returning default weekly summary.');
    return defaultWeeklySummary;
  }
  
  try {
    // Prepare the entries for the prompt - limit content length to avoid token limits
    const entriesText = entries.map(entry => {
      // Limit each entry to 500 characters to avoid exceeding token limits
      const truncatedContent = entry.content.length > 500 
        ? entry.content.substring(0, 500) + '...' 
        : entry.content;
      
      return `Date: ${new Date(entry.createdAt).toISOString().split('T')[0]}
Type: ${entry.entryType}
Content: ${truncatedContent}
Tags: ${entry.tags.join(', ')}
---`;
    }).join('\n');
    
    console.log(`Attempting to use model: ${config.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
    console.log(`Processing ${entries.length} entries for weekly summary`);
    
    const response = await openai.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that generates insightful weekly summaries of journal entries.
          Analyze the provided journal entries and return a JSON object with the following information:
          1. summary: A concise summary of the week's entries
          2. insights: Key insights or patterns observed (array of strings)
          3. emotionalTrends: Emotional trends throughout the week (array of strings)
          4. accomplishments: Notable accomplishments (array of strings)
          5. challenges: Challenges faced (array of strings)
          6. recommendations: Recommendations for the coming week (array of strings)
          7. connections: Conceptual connections between journal entries (array of strings)`
        },
        {
          role: "user",
          content: `Here are my journal entries for the week:\n${entriesText}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });
    
    console.log('Weekly summary response received');
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      console.log('Successfully parsed weekly summary response');
      return parsedResponse;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError.message);
      console.log('Raw response:', response.choices[0].message.content);
      
      // Attempt to extract useful information even if JSON parsing fails
      return {
        summary: "Error parsing AI response. Here's what we received:",
        insights: ["The AI generated a response but it wasn't in the expected format."],
        emotionalTrends: ["Unable to extract emotional trends due to parsing error."],
        accomplishments: ["Unable to extract accomplishments due to parsing error."],
        challenges: ["AI response parsing failed."],
        recommendations: ["Try again later or contact support if the issue persists."],
        rawResponse: response.choices[0].message.content.substring(0, 500) // Include part of the raw response
      };
    }
  } catch (error) {
    console.error('Error generating weekly summary with OpenAI:', error.message);
    
    // Return a default response structure with more detailed error information
    console.log('Returning default weekly summary due to error');
    return {
      ...defaultWeeklySummary,
      error: error.message,
      errorType: error.name,
      errorDetails: error.stack ? error.stack.split('\n')[0] : 'No stack trace available'
    };
  }
};

module.exports = {
  analyzeContent,
  generateWeeklySummary,
  generateEmbedding,
  findRelatedEntries
};
