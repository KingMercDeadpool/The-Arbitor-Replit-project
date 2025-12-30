import express, { Request, Response, Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

const router = Router();

/**
 * Request body interface for AI code generation
 */
interface AIRequest {
  description: string;
  language?: string;
}

/**
 * Response interface for AI code generation
 */
interface AIResponse {
  success: boolean;
  code?: string;
  error?: string;
  description?: string;
}

/**
 * POST /api/ai/generate
 * 
 * Handles AI requests using Google Gemini API
 * Accepts English descriptions and returns generated code
 * 
 * Request body:
 * {
 *   "description": "string - English description of what code to generate",
 *   "language": "string (optional) - Programming language (default: JavaScript)"
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "code": "string - Generated code",
 *   "description": "string - Brief description of generated code",
 *   "error": "string - Error message if request failed"
 * }
 */
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, language = 'JavaScript' } = req.body as AIRequest;

    // Validate request
    if (!description || description.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Description is required and cannot be empty'
      } as AIResponse);
      return;
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      res.status(500).json({
        success: false,
        error: 'Google Gemini API key is not configured'
      } as AIResponse);
      return;
    }

    // Create the prompt for code generation
    const prompt = `You are an expert code generator. Generate clean, well-documented ${language} code based on the following description:

Description: ${description}

Requirements:
1. Generate production-ready code
2. Include comments and documentation
3. Follow best practices for ${language}
4. Handle edge cases
5. Return ONLY the code, no explanations or markdown formatting

${language} Code:`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedCode = response.text();

    // Return successful response
    res.status(200).json({
      success: true,
      code: generatedCode,
      description: `Generated ${language} code from description: "${description}"`
    } as AIResponse);

  } catch (error) {
    console.error('AI Generation Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: `Failed to generate code: ${errorMessage}`
    } as AIResponse);
  }
});

/**
 * POST /api/ai/chat
 * 
 * Handles conversational AI requests
 * Useful for asking questions about code or getting explanations
 * 
 * Request body:
 * {
 *   "message": "string - Your question or message"
 * }
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body as { message: string };

    if (!message || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Message is required and cannot be empty'
      } as AIResponse);
      return;
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      res.status(500).json({
        success: false,
        error: 'Google Gemini API key is not configured'
      } as AIResponse);
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    res.status(200).json({
      success: true,
      code: reply,
      description: 'AI Response'
    } as AIResponse);

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: `Failed to process message: ${errorMessage}`
    } as AIResponse);
  }
});

/**
 * GET /api/ai/health
 * 
 * Health check endpoint to verify API is running
 */
router.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'AI API is running'
  });
});

export default router;
