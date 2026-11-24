import React from 'react';
import {
  CalculatedFinancials,
  FinancialModelInputs,
} from '../types/financial';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';

interface ChartsSectionProps {
  calculations: CalculatedFinancials;
  inputs: FinancialModelInputs;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const ChartsSection: React.FC<ChartsSectionProps> = ({ calculations, inputs }) => {
  // Data for 5-Year Financial Performance Chart
  const yearlyPerformanceData = calculations.annualProjections.map((yr) => ({
    name: `Año ${yr.year}`,
    Ingresos: yr.revenue,
    CostosTotales: yr.variableCosts + yr.operatingExpenses,
    UtilidadNeta: yr.netIncome,
    EBITDA: yr.ebitda,
  }));

  // Data for Break-Even Chart (Simulation from 0 to 2.5x Break-Even Units)
  const beUnits = calculations.breakEven.monthlyBreakEvenUnits || 100;
  const avgPrice = calculations.breakEven.averageWeightedPrice || 50000;
  const avgVarCost = calculations.breakEven.averageWeightedVariableCost || 15000;
  const fixedCost = calculations.breakEven.monthlyFixedCosts || 1000000;

  const breakEvenChartData = [];
  const steps = 6;
  const maxUnits = Math.max(beUnits * 2, 200);

  for (let i = 0; i <= steps; i++) {
    const units = Math.round((maxUnits / steps) * i);
    const revenue = units * avgPrice;
    const varCosts = units * avgVarCost;
    const totalCosts = fixedCost + varCosts;

    breakEvenChartData.push({
      Unidades: units,
      Ingresos: revenue,
      CostosTotales: totalCosts,
      CostosFijos: fixedCost,
    });
  }

  // Data for Accumulated Cash Flow (Payback curve)
  const cashFlowData = [
    { name: 'Año 0 (Inversión)', FlujoAcumulado: -calculations.fundedByEquity },
    ...calculations.annualProjections.map((yr) => ({
      name: `Año ${yr.year}`,
      FlujoAcumulado: yr.accumulatedCashFlow,
      FlujoLibreAnual: yr.freeCashFlow,
    })),
  ];

  // Data for Cost Structure Pie Chart
  const costStructureData = [
    { name: 'Costos Variables (Año 1)', value: calculations.annualProjections[0]?.variableCosts || 1 },
    { name: 'Nómina Operativa', value: (inputs.operatingExpenses.find((e) => e.category === 'nomina')?.monthlyCost || 0) * 12 },
    { name: 'Arriendo & Servicios', value: (inputs.operatingExpenses.filter((e) => e.category === 'arriendo' || e.category === 'servicios').reduce((s, e) => s + e.monthlyCost, 0)) * 12 },
    { name: 'Marketing & Publicidad', value: (inputs.operatingExpenses.find((e) => e.category === 'marketing')?.monthlyCost || 0) * 12 },
    { name: 'Otros Gastos Fijos', value: (inputs.operatingExpenses.filter((e) => !['nomina', 'arriendo', 'servicios', 'marketing'].includes(e.category)).reduce((s, e) => s + e.monthlyCost, 0)) * 12 },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Chart 1: Proyección a 5 Años */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Proyección Financiera a 5 Años (Ingresos vs Costos vs Utilidad Neta)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolución anual ajustada según la tasa de inflación proyectada
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
            Utilidad Año 5: {formatCurrency(calculations.annualProjections[4]?.netIncome || 0)}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyPerformanceData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorUtilidad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="Ingresos" stroke="#10B981" fillOpacity={1} fill="url(#colorIngresos)" />
              <Area type="monotone" dataKey="CostosTotales" stroke="#EF4444" fill="#FEE2E2" />
              <Area type="monotone" dataKey="UtilidadNeta" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUtilidad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2 Columns for Break-Even & Cash Flow Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 2: Punto de Equilibrio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Gráfico de Punto de Equilibrio Mensual
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intersección entre Ingresos Totales y Costos Totales ({beUnits} unidades/mes)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={breakEvenChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="Unidades" label={{ value: 'Unidades / Mes', position: 'insideBottom', offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Ingresos" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CostosTotales" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="CostosFijos" stroke="#64748B" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Flujo Acumulado y Payback */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Curva de Recuperación de Caja (Payback)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trayectoria de caja acumulada desde la inversión inicial
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="FlujoAcumulado" fill="#10B981" radius={[4, 4, 0, 0]}>
                  {cashFlowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.FlujoAcumulado >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
