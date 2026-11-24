import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAdvisorRequest, handleAnalyzeRequest } from './server/geminiHandlers';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// API Endpoint 1: Complete Financial Plan Diagnosis
app.post('/api/gemini/analyze', async (req, res) => {
  const result = await handleAnalyzeRequest(req.body);
  return res.status(result.status).json(result.data);
});

// API Endpoint 2: Interactive AI Financial Advisor Chat
app.post('/api/gemini/advisor', async (req, res) => {
  const result = await handleAdvisorRequest(req.body);
  return res.status(result.status).json(result.data);
});

// Setup Vite Middlewares in Development or Static Server in Production
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!isProd) {
    const vite = await import('vite');
    const viteDevServer = await vite.createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'custom',
    });
    app.use(viteDevServer.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await viteDevServer.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        viteDevServer.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) return;
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
