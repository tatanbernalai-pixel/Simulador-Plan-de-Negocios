import { GoogleGenAI, Type } from '@google/genai';

interface HandlerResult {
  status: number;
  data: Record<string, any>;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function handleAnalyzeRequest(body: unknown): Promise<HandlerResult> {
  try {
    if (!isPlainObject(body)) {
      return { status: 400, data: { error: 'Cuerpo de solicitud inválido.' } };
    }

    const { inputs, calculations } = body;

    if (!isPlainObject(inputs) || !isPlainObject(calculations)) {
      return { status: 400, data: { error: 'Faltan los datos del modelo financiero o cálculos.' } };
    }

    const ai = getAiClient();
    if (!ai) {
      return {
        status: 500,
        data: { error: 'No se ha configurado GEMINI_API_KEY en las variables de entorno / Secrets.' },
      };
    }

    const teamList =
      Array.isArray(inputs.student?.teamMembers) && inputs.student.teamMembers.length > 0
        ? inputs.student.teamMembers
            .map((m: any) => (typeof m?.fullName === 'string' ? m.fullName.trim() : ''))
            .filter(Boolean)
            .join(' - ')
        : inputs.student?.studentName || 'Aprendiz';

    const prompt = `
Eres un Experto Financiero y Jurado Evaluador de Planes de Negocio Tecnológicos SENA / Fondo Emprender.
Analiza el siguiente modelo financiero de una idea de negocio presentada por aprendices.

INFORMACIÓN DEL PROYECTO:
- Nombre del Proyecto: ${inputs.student?.projectName || 'Sin nombre'}
- Aprendiz(ces): ${teamList}
- Programa de Formación: ${inputs.student?.programName || 'Tecnología'}
- Sector: ${inputs.student?.sector || 'General'}

DATOS FINANCIEROS CLAVE:
- Inversión Inicial Total: $${calculations.totalInitialInvestment?.toLocaleString('es-CO')}
- Aporte Propio: $${calculations.fundedByEquity?.toLocaleString('es-CO')}
- Subsidio / Fondo Emprender: $${calculations.fundedByGrant?.toLocaleString('es-CO')}
- Crédito Bancario: $${calculations.fundedByLoan?.toLocaleString('es-CO')}
- Valor Actual Neto (VAN / NPV): $${calculations.npv?.toLocaleString('es-CO')}
- Tasa Interna de Retorno (TIR / IRR): ${calculations.irr !== null ? calculations.irr + '%' : 'No calculable'}
- Tasa de Descuento (WACC): ${inputs.parameters?.discountRatePercent}%
- Periodo de Recuperación (Payback): ${calculations.paybackMonths} meses
- Punto de Equilibrio Mensual (Unidades): ${calculations.breakEven?.monthlyBreakEvenUnits} uds ($${calculations.breakEven?.monthlyBreakEvenRevenue?.toLocaleString('es-CO')}/mes)
- Gastos Fijos Mensuales (OPEX): $${calculations.monthlyFixedCostsTotal?.toLocaleString('es-CO')}
- Ingreso Mensual Promedio Año 1: $${calculations.monthlyRevenueYear1Avg?.toLocaleString('es-CO')}
- Margen Neto Promedio Año 1: ${calculations.annualProjections?.[0]?.netMarginPercent}%
- Margen Neto Promedio Año 5: ${calculations.annualProjections?.[4]?.netMarginPercent}%
- Sensibilidad Pesimista (VAN): $${calculations.sensitivity?.pessimistic?.npv?.toLocaleString('es-CO')}

PRODUCTOS / SERVICIOS:
${JSON.stringify(inputs.products || [], null, 2)}

GASTOS OPERATIVOS (OPEX):
${JSON.stringify(inputs.operatingExpenses || [], null, 2)}

INVERSIONES EN ACTIVOS:
${JSON.stringify(inputs.investments || [], null, 2)}

TAREA:
Realiza una evaluación crítica, constructiva, pedagógica y rigurosa en idioma Español. 
Debes calificar la viabilidad financiera de 0 a 100 y proporcionar sugerencias concretas de costeo, precios, riesgos y adecuación a convocatorias como Fondo Emprender.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un evaluador financiero pedagógico y exigente de planes de negocio. Proporcionas diagnósticos estructurados en JSON estricto con lenguaje claro, profesional y constructivo en español para aprendices tecnológicos.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viabilityScore: { type: Type.INTEGER, description: 'Puntaje de 0 a 100' },
            verdictLabel: {
              type: Type.STRING,
              description: 'Etiqueta: Altamente Viable, Viable con Ajustes, Alto Riesgo Financiero, o No Viable',
            },
            executiveSummary: { type: Type.STRING, description: 'Resumen ejecutivo del diagnóstico en 2-3 párrafos' },
            swotAnalysis: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            costingAndPricingFeedback: {
              type: Type.OBJECT,
              properties: {
                pricingRating: { type: Type.STRING, description: 'Valoración del precio de venta' },
                missingCostsAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                marginObservations: { type: Type.STRING, description: 'Observación sobre márgenes bruto y neto' },
              },
            },
            keyRiskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            fundingSuitability: {
              type: Type.OBJECT,
              properties: {
                fondoEmprenderReady: { type: Type.BOOLEAN },
                bankCreditReady: { type: Type.BOOLEAN },
                investorReady: { type: Type.BOOLEAN },
                comments: { type: Type.STRING },
              },
            },
            learningActionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'viabilityScore',
            'verdictLabel',
            'executiveSummary',
            'swotAnalysis',
            'costingAndPricingFeedback',
            'keyRiskFactors',
            'recommendations',
            'fundingSuitability',
            'learningActionPoints',
          ],
        },
      },
    });

    const rawText = (response.text || '').trim();
    if (!rawText) {
      return {
        status: 502,
        data: { error: 'El evaluador IA devolvió una respuesta vacía. Intenta nuevamente.' },
      };
    }

    const cleanedJson = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);

    const normalizedDiagnosis = {
      viabilityScore:
        typeof parsed.viabilityScore === 'number'
          ? Math.min(100, Math.max(0, Math.round(parsed.viabilityScore)))
          : 50,
      verdictLabel: parsed.verdictLabel || 'Viable con Ajustes',
      executiveSummary: parsed.executiveSummary || 'Diagnóstico generado para el modelo financiero.',
      swotAnalysis: {
        strengths: Array.isArray(parsed.swotAnalysis?.strengths) ? parsed.swotAnalysis.strengths : [],
        weaknesses: Array.isArray(parsed.swotAnalysis?.weaknesses) ? parsed.swotAnalysis.weaknesses : [],
        opportunities: Array.isArray(parsed.swotAnalysis?.opportunities) ? parsed.swotAnalysis.opportunities : [],
        threats: Array.isArray(parsed.swotAnalysis?.threats) ? parsed.swotAnalysis.threats : [],
      },
      costingAndPricingFeedback: {
        pricingRating: parsed.costingAndPricingFeedback?.pricingRating || 'Sin observación específica',
        missingCostsAlerts: Array.isArray(parsed.costingAndPricingFeedback?.missingCostsAlerts)
          ? parsed.costingAndPricingFeedback.missingCostsAlerts
          : [],
        marginObservations: parsed.costingAndPricingFeedback?.marginObservations || '',
      },
      keyRiskFactors: Array.isArray(parsed.keyRiskFactors) ? parsed.keyRiskFactors : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      fundingSuitability: {
        fondoEmprenderReady: Boolean(parsed.fundingSuitability?.fondoEmprenderReady),
        bankCreditReady: Boolean(parsed.fundingSuitability?.bankCreditReady),
        investorReady: Boolean(parsed.fundingSuitability?.investorReady),
        comments: parsed.fundingSuitability?.comments || '',
      },
      learningActionPoints: Array.isArray(parsed.learningActionPoints) ? parsed.learningActionPoints : [],
    };

    return { status: 200, data: normalizedDiagnosis };
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze:', err);
    return {
      status: 500,
      data: {
        error: 'Error procesando la evaluación con Gemini API: ' + (err?.message || 'Error desconocido'),
      },
    };
  }
}

export async function handleAdvisorRequest(body: unknown): Promise<HandlerResult> {
  try {
    if (!isPlainObject(body)) {
      return { status: 400, data: { error: 'Cuerpo de solicitud inválido.' } };
    }

    const { message, history, contextInputs, contextCalculations } = body;

    if (typeof message !== 'string' || !message.trim()) {
      return { status: 400, data: { error: 'El mensaje es obligatorio.' } };
    }

    const ai = getAiClient();
    if (!ai) {
      return {
        status: 500,
        data: { error: 'No se ha configurado GEMINI_API_KEY en las variables de entorno / Secrets.' },
      };
    }

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

    return { status: 200, data: { text: response.text || '' } };
  } catch (err: any) {
    console.error('Error in /api/gemini/advisor:', err);
    return {
      status: 500,
      data: {
        error: 'Error en la respuesta del mentor IA: ' + (err?.message || 'Error desconocido'),
      },
    };
  }
}
