import { handleAnalyzeRequest } from '../../server/geminiHandlers';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'JSON inválido en la solicitud.' });
    }
  }
  const result = await handleAnalyzeRequest(body);
  return res.status(result.status).json(result.data);
}
