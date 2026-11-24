import React from 'react';
import { CalculatedFinancials, FinancialParameters } from '../types/financial';
import { TrendingUp, Award, DollarSign, Clock, ShieldCheck, AlertTriangle, ArrowUpRight, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';

interface MetricsOverviewProps {
  calculations: CalculatedFinancials;
  parameters: FinancialParameters;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ calculations, parameters }) => {
  const isNpvPositive = calculations.npv > 0;
  const isIrrViable = calculations.irr !== null && calculations.irr > parameters.discountRatePercent;

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: VAN / NPV */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
          isNpvPositive
            ? 'bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800'
            : 'bg-gradient-to-br from-red-500/10 via-white to-white dark:from-red-950/40 dark:via-slate-900 dark:to-slate-900 border-red-200 dark:border-red-900'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Valor Actual Neto (VAN)
            </span>
            {isNpvPositive ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Viable
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 text-[11px] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Destruye Valor
              </span>
            )}
          </div>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${
            isNpvPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(calculations.npv)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Rendimiento neto descontado al {parameters.discountRatePercent}% WACC a 5 años.
          </p>
        </div>

        {/* Card 2: TIR / IRR */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
          isIrrViable
            ? 'bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tasa Interna de Retorno (TIR)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
            {calculations.irr !== null ? `${calculations.irr}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Tasa de Oportunidad (WACC):</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{parameters.discountRatePercent}%</span>
          </div>
        </div>

        {/* Card 3: Punto de Equilibrio Mensual */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Punto de Equilibrio (Mes)
            </span>
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
            {formatNumber(calculations.breakEven.monthlyBreakEvenUnits)} <span className="text-xs font-sans font-medium text-slate-500">uds/mes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Facturación mínima: <strong className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(calculations.breakEven.monthlyBreakEvenRevenue)}</strong>/mes.
          </p>
        </div>

        {/* Card 4: Payback (Periodo de Recuperación) */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Recuperación de Inversión
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
            {calculations.paybackMonths < 60 ? `${calculations.paybackMonths} meses` : '> 60 meses'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {calculations.paybackMonths < 60
              ? `Aproximadamente ${(calculations.paybackMonths / 12).toFixed(1)} años de operación.`
              : 'Supera el horizonte de 5 años.'}
          </p>
        </div>
      </div>

      {/* Secondary Financial Indicators Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-1 font-medium">Inversión Inicial CAPEX:</span>
          <span className="text-base font-bold font-mono text-white">
            {formatCurrency(calculations.totalInitialInvestment)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-1 font-medium">Gastos Fijos OPEX (Mes):</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {formatCurrency(calculations.monthlyFixedCostsTotal)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-1 font-medium">Margen Bruto Ponderado:</span>
          <span className="text-base font-bold font-mono text-emerald-300">
            {calculations.breakEven.contributionMarginRatio}%
          </span>
        </div>

        <div>
          <span className="text-slate-400 block mb-1 font-medium">Margen Neto Año 5:</span>
          <span className="text-base font-bold font-mono text-emerald-300">
            {calculations.annualProjections[4]?.netMarginPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
