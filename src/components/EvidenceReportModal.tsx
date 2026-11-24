import React from 'react';
import {
  AIFinancialDiagnosis,
  CalculatedFinancials,
  FinancialModelInputs,
} from '../types/financial';
import { X, Printer, Award, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import { SenaLogo } from './SenaLogo';

interface EvidenceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: FinancialModelInputs;
  calculations: CalculatedFinancials;
  diagnosis: AIFinancialDiagnosis | null;
}

export const EvidenceReportModal: React.FC<EvidenceReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  calculations,
  diagnosis,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Vista Previa de Informe Formal - Evidencia de Aprendizaje</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" /> Imprimir / Guardar como PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-8 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 text-xs">
          
          {/* Institutional Academic Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center p-2 shrink-0">
                <SenaLogo className="w-full h-full text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  SERVICIO NACIONAL DE APRENDIZAJE SENA · INFORME DE EVIDENCIA FINANCIERA
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {inputs.student.projectName || 'Plan de Negocio Tecnológico'}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  {inputs.student.programName || 'Programa de Formación Tecnológica'}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-[11px] space-y-0.5 text-slate-600 dark:text-slate-400 font-mono">
              <div><strong>Centro:</strong> {inputs.student.centerName || 'Centro SENA'}</div>
              <div><strong>Ciudad:</strong> {inputs.student.city || 'Colombia'}</div>
              <div><strong>Fecha de Emisión:</strong> {currentDate}</div>
            </div>
          </div>

          {/* Student & Instructor Data Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Ficha / Programa</span>
                <span className="font-semibold">{inputs.student.programName || 'Programa Tecnológico'} ({inputs.student.studentId || 'N/A'})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Instructor Asignado</span>
                <span className="font-semibold">{inputs.student.instructorName || 'Instructor'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Sector Económico</span>
                <span className="capitalize font-semibold">{inputs.student.sector}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1.5">Aprendices Integrantes del Proyecto</span>
              {inputs.student.teamMembers && inputs.student.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inputs.student.teamMembers.map((m, i) => (
                    <div key={m.id || i} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                      <strong>{i + 1}. {m.fullName || 'Sin nombre'}</strong> - Doc: {m.documentNumber || 'No registrado'}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="font-semibold">{inputs.student.studentName || 'No registrado'}</span>
              )}
            </div>
          </div>

          {/* 1. Executive Summary & Viability Verdict */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1">
              1. Resumen de Viabilidad del Plan de Negocio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">Valor Actual Neto (VAN)</span>
                <span className={`font-bold text-sm ${calculations.npv > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'}`}>
                  {formatCurrency(calculations.npv)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">TIR vs WACC</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {calculations.irr !== null ? `${calculations.irr}%` : 'N/A'} <span className="text-[10px] text-slate-400">({inputs.parameters.discountRatePercent}%)</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">Punto Equilibrio/Mes</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {formatNumber(calculations.breakEven.monthlyBreakEvenUnits)} uds
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-sans">Payback Estimado</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {calculations.paybackMonths} meses
                </span>
              </div>
            </div>
          </div>

          {/* 2. Initial Investment & Funding Breakdown */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1">
              2. Estructura de Inversión y Fuentes de Financiación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-2">Activo / Inversión</th>
                    <th className="p-2 text-right">Valor ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {inputs.investments.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-2 font-sans">{inv.name}</td>
                      <td className="p-2 text-right">{formatCurrency(inv.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-slate-50 dark:bg-slate-800">
                    <td className="p-2 font-sans">TOTAL INVERSIÓN (CAPEX)</td>
                    <td className="p-2 text-right text-emerald-700">{formatCurrency(calculations.totalInitialInvestment)}</td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-2">Fuente de Financiación</th>
                    <th className="p-2 text-right">Monto ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  <tr>
                    <td className="p-2 font-sans">Aporte Propio / Socios</td>
                    <td className="p-2 text-right">{formatCurrency(inputs.equityContribution)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans">Subsidio / Fondo Emprender</td>
                    <td className="p-2 text-right">{formatCurrency(inputs.grantFunding)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans">Crédito Bancario ({inputs.loan.annualInterestRatePercent}%)</td>
                    <td className="p-2 text-right">{formatCurrency(inputs.loan.hasLoan ? inputs.loan.loanAmount : 0)}</td>
                  </tr>
                  <tr className="font-bold bg-slate-50 dark:bg-slate-800">
                    <td className="p-2 font-sans">TOTAL FINANCIACIÓN</td>
                    <td className="p-2 text-right text-emerald-700">
                      {formatCurrency(inputs.equityContribution + inputs.grantFunding + (inputs.loan.hasLoan ? inputs.loan.loanAmount : 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Proyección a 5 Años Tabla Completa */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1">
              3. Estados Financieros Proyectados (Años 1 a 5)
            </h2>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                  <tr>
                    <th className="p-2 font-sans">Concepto ($ COP)</th>
                    <th className="p-2 text-right">Año 1</th>
                    <th className="p-2 text-right">Año 2</th>
                    <th className="p-2 text-right">Año 3</th>
                    <th className="p-2 text-right">Año 4</th>
                    <th className="p-2 text-right">Año 5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2 font-sans font-semibold">Ventas Totales</td>
                    {calculations.annualProjections.map((p) => (
                      <td key={p.year} className="p-2 text-right font-bold">{formatCurrency(p.revenue)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-sans text-slate-500">(-) Costos Variables</td>
                    {calculations.annualProjections.map((p) => (
                      <td key={p.year} className="p-2 text-right text-slate-500">({formatCurrency(p.variableCosts)})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-sans text-slate-500">(-) OPEX Gastos Fijos</td>
                    {calculations.annualProjections.map((p) => (
                      <td key={p.year} className="p-2 text-right text-slate-500">({formatCurrency(p.operatingExpenses)})</td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800 font-bold">
                    <td className="p-2 font-sans">(=) EBITDA</td>
                    {calculations.annualProjections.map((p) => (
                      <td key={p.year} className="p-2 text-right">{formatCurrency(p.ebitda)}</td>
                    ))}
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="p-2 font-sans">UTILIDAD NETA</td>
                    {calculations.annualProjections.map((p) => (
                      <td key={p.year} className="p-2 text-right text-emerald-400">{formatCurrency(p.netIncome)}</td>
                    ))}
                  </tr>
                  <tr className="bg-slate-800 text-slate-300 font-semibold">
                    <td className="p-2 font-sans">FLUJO DE CAJA LIBRE</td>
                    {calculations.annualProjections.map((p) => (
                      <td key={p.year} className="p-2 text-right text-emerald-300">{formatCurrency(p.freeCashFlow)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Dictamen de Evaluador IA (si existe) */}
          {diagnosis && (
            <div className="space-y-2 print-avoid-break">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" /> 4. Dictamen Crítico del Evaluador Financiero IA (Puntaje: {diagnosis.viabilityScore}/100)
              </h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Veredicto: {diagnosis.verdictLabel}
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {diagnosis.executiveSummary}
                </p>
              </div>
            </div>
          )}

          {/* 5. Sign-off and Evaluation Signatures */}
          <div className="pt-8 border-t border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-12 text-center print-avoid-break">
            <div className="space-y-8">
              <div className="border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto"></div>
              <div>
                <span className="font-bold block">{inputs.student.studentName || 'Aprendiz responsable'}</span>
                <span className="text-[10px] text-slate-500">Firma del Aprendiz / Cédula</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto"></div>
              <div>
                <span className="font-bold block">{inputs.student.instructorName || 'Instructor Asignado'}</span>
                <span className="text-[10px] text-slate-500">Visto Bueno Instructor / Jurado SENA</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
