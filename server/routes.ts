import express, { Router, Request, Response } from 'express';
import * as aiApi from './api/ai';

const router = Router();

// AI API Routes
// Health check endpoint
router.get('/api/ai/health', (req: Request, res: Response) => {
  aiApi.healthCheck(req, res);
});

// Generate endpoint
router.post('/api/ai/generate', (req: Request, res: Response) => {
  aiApi.generate(req, res);
});

// Chat endpoint
router.post('/api/ai/chat', (req: Request, res: Response) => {
  aiApi.chat(req, res);
});

export default router;
