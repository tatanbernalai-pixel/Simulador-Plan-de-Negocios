import { GoogleGenAI } from '@google/genai';

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    let body = req.body;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
      body = body.toString('utf8');
    }
    if (typeof body === 'string') {
      try {
        body = body.trim() ? JSON.parse(body) : {};
      } catch {
        return res.status(400).json({ error: 'JSON inválido en la solicitud.' });
      }
    }

    if (!isPlainObject(body)) {
      return res.status(400).json({ error: 'Cuerpo de solicitud inválido.' });
    }

    const { message, history, contextInputs, contextCalculations } = body;
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje es obligatorio.' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    if (!apiKey) {
      return res.status(500).json({
        error: 'No se ha configurado GEMINI_API_KEY en las variables de entorno de Vercel.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `
Eres un Mentor y Consultor Financiero de Educación Tecnológica (SENA / Universitario).
Tu objetivo es guiar al aprendiz para comprender los números de su plan de negocio "${contextInputs?.student?.projectName || 'Proyecto'}".

CONTEXTO ACTUAL DEL PROYECTO:
- Sector: ${contextInputs?.student?.sector}
- Inversión Total: $${contextCalculations?.totalInitialInvestment?.toLocaleString('es-CO')}
- VAN: $${contextCalculations?.npv?.toLocaleString('es-CO')}
- TIR: ${contextCalculations?.irr}%
- Punto Equilibrio Mensual: ${contextCalculations?.breakEven?.monthlyBreakEvenUnits} unidades ($${contextCalculations?.breakEven?.monthlyBreakEvenRevenue?.toLocaleString('es-CO')})
- Margen Neto Año 1: ${contextCalculations?.annualProjections?.[0]?.netMarginPercent}%

REGLAS DE RESPUESTA:
1. Responde de forma cercana, académica, pedagógica y directa.
2. Explica los términos financieros (VAN, TIR, EBITDA, Punto de Equilibrio) con analogías sencillas asociadas al sector del aprendiz.
3. Si el VAN es negativo o el punto de equilibrio es inalcanzable, sugiere tácticas concretas para corregirlo (aumentar precio, reducir gastos fijos, renegociar costos variables).
4. Mantén las respuestas concisas (máximo 3-4 párrafos bien estructurados).
5. Usa viñetas claras cuando des pasos de acción.
    `;

    const safeHistory = Array.isArray(history) ? history.slice(-20) : [];
    const chatMessages = safeHistory
      .filter((msg: any) => typeof msg?.text === 'string' && msg.text.trim())
      .map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    chatMessages.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: chatMessages,
      config: {
        systemInstruction,
      },
    });

    return res.status(200).json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Error in /api/gemini/advisor:', err);
    return res.status(500).json({
      error: 'Error en la respuesta del mentor IA: ' + (err?.message || 'Error desconocido'),
    });
  }
}
