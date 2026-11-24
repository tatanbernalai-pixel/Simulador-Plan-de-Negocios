import React, { useState, useMemo } from 'react';
import {
  AIFinancialDiagnosis,
  CalculatedFinancials,
  ChatMessage,
  FinancialModelInputs,
} from '../types/financial';
import { Sparkles, Send, Loader2, CheckCircle, AlertTriangle, MessageSquare, Award, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIAssessorProps {
  inputs: FinancialModelInputs;
  calculations: CalculatedFinancials;
  diagnosis: AIFinancialDiagnosis | null;
  setDiagnosis: (d: AIFinancialDiagnosis | null) => void;
}

function normalizeDiagnosis(raw: any): AIFinancialDiagnosis | null {
  if (!raw || typeof raw !== 'object') return null;
  // Require at least a score or executive summary to consider it a valid diagnosis
  if (raw.viabilityScore === undefined && !raw.executiveSummary && !raw.swotAnalysis) {
    return null;
  }
  const score =
    typeof raw.viabilityScore === 'number' && !isNaN(raw.viabilityScore)
      ? Math.min(100, Math.max(0, Math.round(raw.viabilityScore)))
      : 50;

  return {
    viabilityScore: score,
    verdictLabel: raw.verdictLabel || 'Viable con Ajustes',
    executiveSummary: raw.executiveSummary || 'Diagnóstico generado para el modelo financiero.',
    swotAnalysis: {
      strengths: Array.isArray(raw.swotAnalysis?.strengths) ? raw.swotAnalysis.strengths : [],
      weaknesses: Array.isArray(raw.swotAnalysis?.weaknesses) ? raw.swotAnalysis.weaknesses : [],
      opportunities: Array.isArray(raw.swotAnalysis?.opportunities) ? raw.swotAnalysis.opportunities : [],
      threats: Array.isArray(raw.swotAnalysis?.threats) ? raw.swotAnalysis.threats : [],
    },
    costingAndPricingFeedback: {
      pricingRating: raw.costingAndPricingFeedback?.pricingRating || '',
      missingCostsAlerts: Array.isArray(raw.costingAndPricingFeedback?.missingCostsAlerts)
        ? raw.costingAndPricingFeedback.missingCostsAlerts
        : [],
      marginObservations: raw.costingAndPricingFeedback?.marginObservations || '',
    },
    keyRiskFactors: Array.isArray(raw.keyRiskFactors) ? raw.keyRiskFactors : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
    fundingSuitability: {
      fondoEmprenderReady: Boolean(raw.fundingSuitability?.fondoEmprenderReady),
      bankCreditReady: Boolean(raw.fundingSuitability?.bankCreditReady),
      investorReady: Boolean(raw.fundingSuitability?.investorReady),
      comments: raw.fundingSuitability?.comments || '',
    },
    learningActionPoints: Array.isArray(raw.learningActionPoints) ? raw.learningActionPoints : [],
  };
}

export const AIAssessor: React.FC<AIAssessorProps> = ({ inputs, calculations, diagnosis, setDiagnosis }) => {
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const safeDiagnosis = useMemo(() => normalizeDiagnosis(diagnosis), [diagnosis]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `¡Hola aprendiz! Soy tu Mentor Financiero IA. He revisado los parámetros de "${inputs?.student?.projectName || 'tu proyecto'}". ¿Tienes alguna duda sobre cómo interpretar el VAN, la TIR o cómo ajustar tus precios?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Handle Full Plan Analysis
  const handleRunAnalysis = async () => {
    setLoadingAnalyze(true);
    setAnalyzeError(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, calculations }),
      });

      const rawText = await res.text();
      let parsedBody: any = {};
      try {
        parsedBody = rawText ? JSON.parse(rawText) : {};
      } catch {
        parsedBody = { error: rawText || 'Respuesta inválida del servidor.' };
      }

      if (!res.ok) {
        throw new Error(parsedBody?.error || 'Error al conectar con el servicio evaluador Gemini IA.');
      }

      const normalized = normalizeDiagnosis(parsedBody);
      if (!normalized) {
        throw new Error('La respuesta del evaluador IA llegó incompleta. Por favor intenta nuevamente.');
      }

      setDiagnosis(normalized);

      if (normalized.viabilityScore >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore confetti errors in restricted environments
        }
      }
    } catch (err: any) {
      setAnalyzeError(err?.message || 'Ocurrió un error inesperado al analizar con Gemini.');
    } finally {
      setLoadingAnalyze(false);
    }
  };

  // Handle Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages,
          contextInputs: inputs,
          contextCalculations: calculations,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { error: rawText || 'Respuesta inválida del servidor.' };
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Error en el mentor IA.');
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data?.text || 'No pude procesar la respuesta en este momento.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ Hubo un inconveniente: ${err?.message || 'Error de conexión'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner to Trigger Analysis */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Evaluador Inteligente de Planes de Negocio
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Diagnóstico Financiero Crítico y Retroalimentación Pedagógica
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            La IA analizará el VAN, la TIR, la estructura de costos fijos, márgenes y la factibilidad para convocatorias como Fondo Emprender.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loadingAnalyze}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 self-start md:self-center"
        >
          {loadingAnalyze ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Evaluando con IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> {safeDiagnosis ? 'Re-evaluar Plan de Negocio' : 'Generar Diagnóstico de IA'}
            </>
          )}
        </button>
      </div>

      {analyzeError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <strong>Error durante el análisis:</strong> {analyzeError}
          </div>
        </div>
      )}

      {/* Main Diagnosis Results View */}
      {safeDiagnosis && (
        <div className="space-y-6">
          {/* Viability Score & Executive Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Gauge */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      safeDiagnosis.viabilityScore >= 75
                        ? 'text-emerald-500'
                        : safeDiagnosis.viabilityScore >= 50
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }
                    strokeDasharray={`${safeDiagnosis.viabilityScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {safeDiagnosis.viabilityScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Puntaje / 100</span>
                </div>
              </div>

              <span
                className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${
                  safeDiagnosis.viabilityScore >= 75
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : safeDiagnosis.viabilityScore >= 50
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {safeDiagnosis.verdictLabel}
              </span>
            </div>

            {/* Executive Summary */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" /> Dictamen Ejecutivo del Evaluador IA
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {safeDiagnosis.executiveSummary}
              </p>
              
              {/* Fondo Emprender Readiness Badge */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                <span className="text-slate-500 font-medium">Convocatorias:</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${safeDiagnosis.fundingSuitability?.fondoEmprenderReady ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {safeDiagnosis.fundingSuitability?.fondoEmprenderReady ? '✓ Apto Fondo Emprender' : '✕ Fondo Emprender Ajustar'}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${safeDiagnosis.fundingSuitability?.bankCreditReady ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {safeDiagnosis.fundingSuitability?.bankCreditReady ? '✓ Sujeto a Crédito' : '✕ No Sujeto a Crédito'}
                </span>
              </div>
            </div>
          </div>

          {/* SWOT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-2">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Fortalezas Financieras
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {(safeDiagnosis.swotAnalysis?.strengths || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-2">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Debilidades / Puntos de Atención
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {(safeDiagnosis.swotAnalysis?.weaknesses || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-2">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <ArrowUpRight className="w-4 h-4 text-blue-600" /> Oportunidades de Crecimiento
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {(safeDiagnosis.swotAnalysis?.opportunities || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-5 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 space-y-2">
              <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Riesgos de Mercado y Financieros
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {(safeDiagnosis.swotAnalysis?.threats || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Recomendaciones Específicas de Mejora Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {(safeDiagnosis.recommendations || []).map((rec, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex gap-2">
                  <span className="font-bold text-emerald-600">{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive AI Mentor Chat Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col h-[480px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Chat de Consulta con el Mentor Financiero IA</span>
          </div>
          <span className="text-[11px] text-slate-400">Responde inquietudes específicas de tu modelo</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-semibold">
                  <span>{msg.sender === 'user' ? 'Aprendiz' : 'Mentor Financiero IA'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}

          {loadingChat && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>El mentor está redactando la explicación...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Pregunta al mentor (ej. ¿Cómo reduzco el punto de equilibrio? ¿Qué hago si mi VAN da negativo?)"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || loadingChat}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
