import React, { useState } from 'react';
import { CalculatedFinancials, FinancialModelInputs } from '../types/financial';
import { formatCurrency } from '../utils/financialCalculations';
import { Table, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

interface FinancialStatementsProps {
  calculations: CalculatedFinancials;
  inputs: FinancialModelInputs;
}

export const FinancialStatements: React.FC<FinancialStatementsProps> = ({ calculations, inputs }) => {
  const [subTab, setSubTab] = useState<'pnl' | 'cashflow' | 'sensitivity'>('pnl');

  return (
    <div className="space-y-6">
      {/* Sub-navigation Segmented Control */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setSubTab('pnl')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'pnl'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Estado de Resultados (P&L)
          </button>
          <button
            onClick={() => setSubTab('cashflow')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'cashflow'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Flujo de Caja Proyectado
          </button>
          <button
            onClick={() => setSubTab('sensitivity')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subTab === 'sensitivity'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Análisis de Sensibilidad
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">
          Proyección en COP $ (Años 1 al 5)
        </span>
      </div>

      {/* Tab 1: Estado de Resultados (P&L) */}
      {subTab === 'pnl' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              Estado de Resultados Proyectado a 5 Años (Estado de Pérdidas y Ganancias)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Tasa Impuestos: {inputs.parameters.taxRatePercent}%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Renglón Financiero / Rubro</th>
                  {calculations.annualProjections.map((p) => (
                    <th key={p.year} className="p-3 text-right">
                      Año {p.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 font-bold text-slate-900 dark:text-white">
                  <td className="p-3 font-sans">Ingresos Operacionales (Ventas)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(p.revenue)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(-) Costo de Ventas (Variables)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-slate-600 dark:text-slate-400">
                      ({formatCurrency(p.variableCosts)})
                    </td>
                  ))}
                </tr>

                <tr className="font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white">
                  <td className="p-3 font-sans">(=) MARGEN BRUTO</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right">
                      {formatCurrency(p.grossMargin)} <span className="text-[10px] text-slate-400 font-normal">({p.grossMarginPercent}%)</span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(-) Gastos Operacionales (OPEX)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-slate-600 dark:text-slate-400">
                      ({formatCurrency(p.operatingExpenses)})
                    </td>
                  ))}
                </tr>

                <tr className="font-bold bg-slate-100/60 dark:bg-slate-800/60 text-slate-900 dark:text-white">
                  <td className="p-3 font-sans">(=) EBITDA</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-blue-700 dark:text-blue-400">
                      {formatCurrency(p.ebitda)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(-) Depreciación de Activos</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-slate-500">
                      ({formatCurrency(p.depreciation)})
                    </td>
                  ))}
                </tr>

                <tr className="font-semibold text-slate-800 dark:text-slate-200">
                  <td className="p-3 font-sans">(=) EBIT (Utilidad Operativa)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right">
                      {formatCurrency(p.ebit)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(-) Intereses Financieros Crédito</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-slate-500">
                      ({formatCurrency(p.interestPaid)})
                    </td>
                  ))}
                </tr>

                <tr className="text-slate-800 dark:text-slate-200">
                  <td className="p-3 font-sans">(=) Utilidad Antes de Impuestos (EBT)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right">
                      {formatCurrency(p.ebt)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(-) Impuesto a la Renta ({inputs.parameters.taxRatePercent}%)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-red-600 dark:text-red-400">
                      ({formatCurrency(p.taxPaid)})
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-900 text-white font-extrabold text-sm">
                  <td className="p-3 font-sans">(=) UTILIDAD NETA DEL EJERCICIO</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-emerald-400">
                      {formatCurrency(p.netIncome)}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-800 text-slate-300 font-semibold text-xs">
                  <td className="p-3 font-sans">Margen Neto %</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-emerald-300">
                      {p.netMarginPercent}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Flujo de Caja Proyectado */}
      {subTab === 'cashflow' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Flujo de Caja Libre Proyectado (5 Años)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Caja Operativa + Amortización Deuda</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Concepto de Flujo de Efectivo</th>
                  {calculations.annualProjections.map((p) => (
                    <th key={p.year} className="p-3 text-right">
                      Año {p.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                <tr>
                  <td className="p-3 font-sans">Utilidad Neta del Periodo</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right font-semibold">
                      {formatCurrency(p.netIncome)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(+) Reajuste Depreciación (No desembolsable)</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.depreciation)}
                    </td>
                  ))}
                </tr>

                <tr className="font-semibold bg-slate-100/50 dark:bg-slate-800/40 text-slate-900 dark:text-white">
                  <td className="p-3 font-sans">(=) Flujo de Caja Operativo</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right">
                      {formatCurrency(p.operatingCashFlow)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">(-) Amortización Principal de Deuda</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-red-500">
                      ({formatCurrency(p.principalPaid)})
                    </td>
                  ))}
                </tr>

                <tr className="font-bold text-slate-900 dark:text-white bg-emerald-50/60 dark:bg-emerald-950/30">
                  <td className="p-3 font-sans">(=) FLUJO DE CAJA LIBRE DEL AÑO</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className="p-3 text-right text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(p.freeCashFlow)}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-900 text-white font-extrabold">
                  <td className="p-3 font-sans">(=) SALDO ACUMULADO DE CAJA</td>
                  {calculations.annualProjections.map((p) => (
                    <td key={p.year} className={`p-3 text-right ${p.accumulatedCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(p.accumulatedCashFlow)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Análisis de Sensibilidad */}
      {subTab === 'sensitivity' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Análisis de Sensibilidad Estresado (3 Escenarios)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluación del comportamiento del VAN y TIR ante variaciones adversas y favorables en el mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Pessimistic */}
            <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">
                  Escenario Pesimista
                </span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-400">
                Caída del 20% en ventas + Incremento del 10% en costos operacionales
              </p>
              <div className="pt-2 border-t border-red-200 dark:border-red-900/60 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">VAN Resultante:</span>
                  <strong className={calculations.sensitivity.pessimistic.npv > 0 ? 'text-emerald-700' : 'text-red-600'}>
                    {formatCurrency(calculations.sensitivity.pessimistic.npv)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">TIR Resultante:</span>
                  <strong>{calculations.sensitivity.pessimistic.irr !== null ? `${calculations.sensitivity.pessimistic.irr}%` : 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Payback:</span>
                  <strong>{calculations.sensitivity.pessimistic.paybackMonths} meses</strong>
                </div>
              </div>
            </div>

            {/* Base */}
            <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  Escenario Base
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Condiciones normales de mercado según modelo configurado
              </p>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-900/60 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">VAN Resultante:</span>
                  <strong className={calculations.sensitivity.base.npv > 0 ? 'text-emerald-700' : 'text-red-600'}>
                    {formatCurrency(calculations.sensitivity.base.npv)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">TIR Resultante:</span>
                  <strong>{calculations.sensitivity.base.irr !== null ? `${calculations.sensitivity.base.irr}%` : 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Payback:</span>
                  <strong>{calculations.sensitivity.base.paybackMonths} meses</strong>
                </div>
              </div>
            </div>

            {/* Optimistic */}
            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Escenario Optimista
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Aumento del 20% en ventas + Eficiencia del 5% en costos
              </p>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">VAN Resultante:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(calculations.sensitivity.optimistic.npv)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">TIR Resultante:</span>
                  <strong>{calculations.sensitivity.optimistic.irr !== null ? `${calculations.sensitivity.optimistic.irr}%` : 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Payback:</span>
                  <strong>{calculations.sensitivity.optimistic.paybackMonths} meses</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
