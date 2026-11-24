import React, { useState, useEffect } from 'react';
import {
  FinancialModelInputs,
  InvestmentItem,
  ProductItem,
  OperatingExpenseItem,
  TechnologyProgram,
} from '../types/financial';
import {
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { CurrencyInput } from './CurrencyInput';
import { formatCurrency } from '../utils/financialCalculations';

interface InputsSectionProps {
  inputs: FinancialModelInputs;
  setInputs: React.Dispatch<React.SetStateAction<FinancialModelInputs>>;
  onGoToResults: () => void;
  resetStepTrigger?: number;
}

export const InputsSection: React.FC<InputsSectionProps> = ({
  inputs,
  setInputs,
  onGoToResults,
  resetStepTrigger = 0,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (resetStepTrigger > 0) {
      setCurrentStep(1);
    }
  }, [resetStepTrigger]);

  // Student info Handlers
  const handleStudentChange = (field: keyof FinancialModelInputs['student'], value: string) => {
    setInputs((prev) => ({
      ...prev,
      student: { ...prev.student, [field]: value },
    }));
  };

  // Team Member Handlers
  const handleAddTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      fullName: '',
      documentNumber: '',
    };
    const currentMembers = inputs.student.teamMembers || [];
    setInputs((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        teamMembers: [...currentMembers, newMember],
      },
    }));
  };

  const handleUpdateTeamMember = (id: string, field: 'fullName' | 'documentNumber', value: string) => {
    const currentMembers = inputs.student.teamMembers || [];
    setInputs((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        teamMembers: currentMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      },
    }));
  };

  const handleRemoveTeamMember = (id: string) => {
    const currentMembers = inputs.student.teamMembers || [];
    setInputs((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        teamMembers: currentMembers.filter((m) => m.id !== id),
      },
    }));
  };

  // Investment Handlers
  const handleAddInvestment = () => {
    const newItem: InvestmentItem = {
      id: Date.now().toString(),
      name: 'Nuevo Activo / Maquinaria',
      category: 'equipo',
      amount: 2500000,
      usefulLifeYears: 5,
    };
    setInputs((prev) => ({
      ...prev,
      investments: [...prev.investments, newItem],
    }));
  };

  const handleUpdateInvestment = (id: string, field: keyof InvestmentItem, value: any) => {
    setInputs((prev) => ({
      ...prev,
      investments: prev.investments.map((inv) => (inv.id === id ? { ...inv, [field]: value } : inv)),
    }));
  };

  const handleRemoveInvestment = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      investments: prev.investments.filter((inv) => inv.id !== id),
    }));
  };

  // Product Handlers
  const handleAddProduct = () => {
    const newProd: ProductItem = {
      id: Date.now().toString(),
      name: 'Nuevo Producto / Servicio',
      unitPrice: 50000,
      unitVariableCost: 15000,
      initialMonthlySalesUnits: 20,
      monthlyGrowthRatePercent: 5,
      annualGrowthRatePercent: 15,
    };
    setInputs((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));
  };

  const handleUpdateProduct = (id: string, field: keyof ProductItem, value: any) => {
    setInputs((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const handleRemoveProduct = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  // OPEX Handlers
  const handleAddExpense = () => {
    const newExpense: OperatingExpenseItem = {
      id: Date.now().toString(),
      name: 'Nuevo Gasto Fijo',
      category: 'imprevistos',
      monthlyCost: 500000,
    };
    setInputs((prev) => ({
      ...prev,
      operatingExpenses: [...prev.operatingExpenses, newExpense],
    }));
  };

  const handleUpdateExpense = (id: string, field: keyof OperatingExpenseItem, value: any) => {
    setInputs((prev) => ({
      ...prev,
      operatingExpenses: prev.operatingExpenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const handleRemoveExpense = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      operatingExpenses: prev.operatingExpenses.filter((e) => e.id !== id),
    }));
  };

  // Calculations totals for step summaries
  const totalInvestment = inputs.investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalFunding =
    (Number(inputs.equityContribution) || 0) +
    (Number(inputs.grantFunding) || 0) +
    (inputs.loan.hasLoan ? Number(inputs.loan.loanAmount) || 0 : 0);

  const stepTitles = [
    'Perfil del Proyecto',
    'Estructura de Costos y Gastos',
    'Presupuesto de ventas',
    'Inversión Inicial',
    'Capital de Trabajo',
    'Parámetros Financieros',
  ];

  const shortStepLabels = [
    'Perfil',
    'Costos/Gastos',
    'Ventas',
    'Inversión',
    'Cap. Trabajo',
    'Parámetros',
  ];

  const progressPercentage = Math.round((currentStep / 6) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full overflow-hidden">
      
      {/* Panel Header & Progress Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              {currentStep}
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Paso {currentStep} de 6: {stepTitles[currentStep - 1]}
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {progressPercentage}% completado
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Tabs Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 mt-3">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button
              key={s}
              onClick={() => setCurrentStep(s)}
              className={`py-1.5 text-[10px] font-semibold rounded-lg transition-colors text-center truncate px-1 ${
                currentStep === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : s < currentStep
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title={`Paso ${s}: ${stepTitles[s - 1]}`}
            >
              {s}. {shortStepLabels[s - 1]}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content View */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
        
        {/* PASO 1: Perfil del Proyecto */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
              <strong>Paso 1: Perfil del Proyecto.</strong> Define la información general de la idea de negocio, el programa tecnológico SENA, ficha y el centro de formación.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Proyecto / Plan de Negocio
                <Tooltip title="Nombre del Proyecto" content="Nombre comercial o denominación técnica de la solución o emprendimiento." />
              </label>
              <input
                type="text"
                value={inputs.student.projectName}
                onChange={(e) => handleStudentChange('projectName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="Ej. CloudSync ERP PyME"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Aprendiz(ces) Integrantes del Proyecto
                  <Tooltip title="Equipo Aprendiz" content="Registra el nombre completo y número de documento de cada aprendiz integrante." />
                </label>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Integrante
                </button>
              </div>

              {(!inputs.student.teamMembers || inputs.student.teamMembers.length === 0) && (
                <div className="p-3 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-slate-500 text-[11px] border border-dashed border-slate-300 dark:border-slate-700">
                  Haz clic en "Agregar Integrante" para registrar nombre completo y número de documento de cada aprendiz.
                </div>
              )}

              <div className="space-y-2 mt-2">
                {(inputs.student.teamMembers || []).map((member, idx) => (
                  <div
                    key={member.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        Aprendiz Integrante #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          value={member.fullName}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'fullName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="Ej. Juan Carlos Pérez"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Número de Documento (CC / TI)
                        </label>
                        <input
                          type="text"
                          value={member.documentNumber}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'documentNumber', e.target.value)}
                          className="w-full px-2.5 py-1.5 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="Ej. 1.098.765.432"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número de Ficha
                  <Tooltip title="Número de Ficha" content="Número de ficha de caracterización SENA del programa de formación." />
                </label>
                <input
                  type="text"
                  value={inputs.student.studentId}
                  onChange={(e) => handleStudentChange('studentId', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Ej. Ficha 278912"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ciudad
                  <Tooltip title="Ciudad" content="Ubicación geográfica del emprendimiento." />
                </label>
                <input
                  type="text"
                  value={inputs.student.city}
                  onChange={(e) => handleStudentChange('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Ej. Bogotá D.C."
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Programa de Formación
                <Tooltip title="Programa Tecnológico" content="Programa de nivel técnico o tecnológico matriculado en la institución." />
              </label>
              <input
                type="text"
                value={inputs.student.programName}
                onChange={(e) => handleStudentChange('programName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Ej. Tecnología en Desarrollo de Software"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Centro de Formación SENA
                <Tooltip title="Centro de Formación" content="Nombre del centro de formación SENA o institución educativa." />
              </label>
              <input
                type="text"
                value={inputs.student.centerName}
                onChange={(e) => handleStudentChange('centerName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Ej. Centro de Diseño y Metrología"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instructor Tutor / Asignado
                <Tooltip title="Instructor Tutor" content="Instructor responsable de orientar el plan de negocio." />
              </label>
              <input
                type="text"
                value={inputs.student.instructorName}
                onChange={(e) => handleStudentChange('instructorName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Ej. Ing. Carlos Mendoza"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sector Económico
                <Tooltip title="Sector Económico" content="Categoría sectorial para calibrar los márgenes esperados en la simulación." />
              </label>
              <select
                value={inputs.student.sector}
                onChange={(e) => handleStudentChange('sector', e.target.value as TechnologyProgram)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="software">Software y TI (SaaS, Apps, Cloud)</option>
                <option value="agroindustria">Agroindustria y Alimentos</option>
                <option value="produccion">Producción Industrial y Manufactura</option>
                <option value="servicios">Servicios Empresariales y Consultoría</option>
                <option value="comercio">Comercio, Gastrobar y Retail</option>
                <option value="otro">Otro Sector Tecnológico</option>
              </select>
            </div>
          </div>
        )}

        {/* PASO 4: Inversión Inicial */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
              <strong>Paso 4: Inversión Inicial.</strong> Registra los activos fijos, maquinaria, equipos, software y adecuaciones necesarias para iniciar operaciones (CAPEX).
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Lista de Activos Fijos
              </span>
              <button
                onClick={handleAddInvestment}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Activo
              </button>
            </div>

            <div className="space-y-3">
              {inputs.investments.length === 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-slate-500 text-xs border border-dashed border-slate-300 dark:border-slate-700">
                  No hay activos fijos registrados. Haz clic en <strong>"+ Agregar Activo"</strong> para ingresar maquinaria, equipos, software o adecuaciones.
                </div>
              )}
              {inputs.investments.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={inv.name}
                      onChange={(e) => handleUpdateInvestment(inv.id, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 font-semibold text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="Nombre del activo"
                    />
                    <button
                      onClick={() => handleRemoveInvestment(inv.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Categoría
                        <Tooltip title="Categoría" content="Clasificación para tributación y depreciación." />
                      </label>
                      <select
                        value={inv.category}
                        onChange={(e) => handleUpdateInvestment(inv.id, 'category', e.target.value)}
                        className="w-full px-2 py-1 text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="equipo">Cómputo</option>
                        <option value="maquinaria">Maquinaria</option>
                        <option value="software">Software</option>
                        <option value="adecuaciones">Adecuaciones</option>
                        <option value="capital_trabajo">Capital Trabajo</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Valor ($ COP)
                        <Tooltip title="Valor Adquisición" content="Costo de compra o desarrollo inicial sin IVA." />
                      </label>
                      <CurrencyInput
                        value={inv.amount}
                        onChange={(val) => handleUpdateInvestment(inv.id, 'amount', val)}
                        className="w-full px-2 py-1 font-mono text-right text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Vida Útil (Años)
                        <Tooltip title="Vida Útil Fiscal" content="Años de vida útil para depreciar en el P&L." />
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={inv.usefulLifeYears}
                        onChange={(e) => handleUpdateInvestment(inv.id, 'usefulLifeYears', Number(e.target.value))}
                        className="w-full px-2 py-1 font-mono text-center text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono font-bold">
              <span>TOTAL INVERSIÓN (CAPEX):</span>
              <span className="text-emerald-400 text-sm">{formatCurrency(totalInvestment)}</span>
            </div>
          </div>
        )}

        {/* PASO 5: Capital de Trabajo */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
              <strong>Paso 5: Capital de Trabajo y Financiación.</strong> Define los recursos de capital de trabajo, aportes de socios, convocatorias (Fondo Emprender) y créditos bancarios.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Aporte Propio / Capital de Socios ($ COP)
                <Tooltip title="Aporte Propio" content="Capital de riesgo aportado directamente por los emprendedores." />
              </label>
              <CurrencyInput
                value={inputs.equityContribution}
                onChange={(val) => setInputs((prev) => ({ ...prev, equityContribution: val }))}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subsidio / Fondo Emprender SENA ($ COP)
                <Tooltip title="Fondo Emprender / Subsidio" content="Capital semilla de carácter no reembolsable condicionado a metas de empleo e ingresos." />
              </label>
              <CurrencyInput
                value={inputs.grantFunding}
                onChange={(val) => setInputs((prev) => ({ ...prev, grantFunding: val }))}
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200">Crédito Bancario o Deuda</label>
                <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={inputs.loan.hasLoan}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        loan: { ...prev.loan, hasLoan: e.target.checked },
                      }))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Incluye Crédito
                </label>
              </div>

              {inputs.loan.hasLoan && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Monto del Préstamo ($ COP)
                      <Tooltip title="Monto Préstamo" content="Valor desembolsado por la entidad bancaria." />
                    </label>
                    <CurrencyInput
                      value={inputs.loan.loanAmount}
                      onChange={(val) =>
                        setInputs((prev) => ({
                          ...prev,
                          loan: { ...prev.loan, loanAmount: val },
                        }))
                      }
                      className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tasa Anual (% EA)
                        <Tooltip title="Tasa de Interés EA" content="Tasa de interés efectiva anual del crédito." />
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputs.loan.annualInterestRatePercent}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            loan: { ...prev.loan, annualInterestRatePercent: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Plazo (Meses)
                        <Tooltip title="Plazo Crédito" content="Número de mensualidades para liquidar la deuda." />
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="120"
                        value={inputs.loan.termMonths}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            loan: { ...prev.loan, termMonths: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono font-bold">
              <span>TOTAL FINANCIACIÓN:</span>
              <span className="text-emerald-400 text-sm">{formatCurrency(totalFunding)}</span>
            </div>
          </div>
        )}

        {/* PASO 3: Presupuesto de ventas */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
              <strong>Paso 3: Presupuesto de ventas.</strong> Configura el precio de venta unitario, costo variable directo por producto y proyección de volumen de ventas.
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Catálogo de Productos / Oferta
              </span>
              <button
                onClick={handleAddProduct}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Producto
              </button>
            </div>

            <div className="space-y-3">
              {inputs.products.length === 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-slate-500 text-xs border border-dashed border-slate-300 dark:border-slate-700">
                  No hay productos o servicios registrados. Haz clic en <strong>"+ Agregar Producto"</strong> para configurar tus precios y proyección de ventas.
                </div>
              )}
              {inputs.products.map((p) => {
                const margin = p.unitPrice > 0 ? ((p.unitPrice - p.unitVariableCost) / p.unitPrice) * 100 : 0;
                return (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 font-semibold text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleRemoveProduct(p.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Precio Venta ($)
                          <Tooltip title="Precio Unitario" content="Valor comercial cobrado al cliente final." />
                        </label>
                        <CurrencyInput
                          value={p.unitPrice}
                          onChange={(val) => handleUpdateProduct(p.id, 'unitPrice', val)}
                          className="w-full px-2 py-1 font-mono text-right text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                          Costo Variable ($)
                          <Tooltip title="Costo Variable Unitario" content="Insumos directos, comisión o materia prima por unidad producida." />
                        </label>
                        <CurrencyInput
                          value={p.unitVariableCost}
                          onChange={(val) => handleUpdateProduct(p.id, 'unitVariableCost', val)}
                          className="w-full px-2 py-1 font-mono text-right text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">
                          Ventas Mes 1 (Uds)
                          <Tooltip title="Ventas Iniciales" content="Unidades a comercializar en el primer mes de operaciones." />
                        </label>
                        <input
                          type="number"
                          value={p.initialMonthlySalesUnits}
                          onChange={(e) => handleUpdateProduct(p.id, 'initialMonthlySalesUnits', Number(e.target.value))}
                          className="w-full px-2 py-1 font-mono text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">
                          Crec. Mes (%)
                          <Tooltip title="Crecimiento Mensual" content="Incremento porcentual esperado mes a mes durante el primer año." />
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={p.monthlyGrowthRatePercent}
                          onChange={(e) => handleUpdateProduct(p.id, 'monthlyGrowthRatePercent', Number(e.target.value))}
                          className="w-full px-2 py-1 font-mono text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-0.5">
                          Margen Bruto
                        </label>
                        <div className="px-2 py-1 font-mono font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                          {margin.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 2: Estructura de Costos y Gastos */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
              <strong>Paso 2: Estructura de Costos y Gastos.</strong> Registra los costos fijos operacionales (OPEX): nómina, arriendo, servicios públicos, publicidad, software e imprevistos.
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Rubros de Gastos Fijos (Mensual)
              </span>
              <button
                onClick={handleAddExpense}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Gasto Fijo
              </button>
            </div>

            <div className="space-y-3">
              {inputs.operatingExpenses.length === 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-slate-500 text-xs border border-dashed border-slate-300 dark:border-slate-700">
                  No hay gastos fijos registrados. Haz clic en <strong>"+ Agregar Gasto Fijo"</strong> para registrar nómina, arriendo, servicios o marketing.
                </div>
              )}
              {inputs.operatingExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={exp.name}
                      onChange={(e) => handleUpdateExpense(exp.id, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 font-semibold text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleRemoveExpense(exp.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Categoría
                        <Tooltip title="Categoría Gasto" content="Clasificación contable para agrupación." />
                      </label>
                      <select
                        value={exp.category}
                        onChange={(e) => handleUpdateExpense(exp.id, 'category', e.target.value)}
                        className="w-full px-2 py-1 text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="nomina">Nómina / Sueldos</option>
                        <option value="arriendo">Arriendo Local</option>
                        <option value="servicios">Servicios Públicos</option>
                        <option value="marketing">Marketing / Anuncios</option>
                        <option value="cloud_software">Cloud / SaaS</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="imprevistos">Imprevistos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Costo Mensual ($ COP)
                        <Tooltip title="Costo Fijo Mensual" content="Valor recurrente a pagar mes a mes indistintamente de las ventas." />
                      </label>
                      <CurrencyInput
                        value={exp.monthlyCost}
                        onChange={(val) => handleUpdateExpense(exp.id, 'monthlyCost', val)}
                        className="w-full px-2 py-1 font-mono text-right text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono font-bold">
              <span>TOTAL OPEX MENSUAL:</span>
              <span className="text-emerald-400 text-sm">
                {formatCurrency(inputs.operatingExpenses.reduce((s, e) => s + (Number(e.monthlyCost) || 0), 0))}
              </span>
            </div>
          </div>
        )}

        {/* PASO 6: Parámetros Financieros */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
              <strong>Paso 6: Parámetros Financieros Avanzados.</strong> Calibra las tasas macroeconómicas que impactan el cálculo del VAN y las proyecciones futuras.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tasa de Oportunidad / WACC (% EA)
                <Tooltip title="Tasa de Descuento (WACC)" content="Rendimiento mínimo exigido por los emprendedores e inversionistas para descontar los flujos futuros." />
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.parameters.discountRatePercent}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, discountRatePercent: Number(e.target.value) },
                  }))
                }
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Estándar Colombia: 12% - 15% EA</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Impuesto a la Renta (%)
                <Tooltip title="Tasa de Impuesto" content="Porcentaje de tributación corporativa aplicable sobre la utilidad neta antes de impuestos." />
              </label>
              <input
                type="number"
                step="1"
                value={inputs.parameters.taxRatePercent}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, taxRatePercent: Number(e.target.value) },
                  }))
                }
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Tarifa general en Colombia: 35%</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inflación Anual Proyectada (%)
                <Tooltip title="Inflación IPC" content="Incremento anual proyectado de costos fijos y precios a partir del año 2." />
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.parameters.inflationRatePercent}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, inflationRatePercent: Number(e.target.value) },
                  }))
                }
                className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Rango recomendado: 3.5% - 5.0%</span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 gap-2">
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                ¿Quieres usar los parámetros de referencia para Colombia?
              </span>
              <button
                type="button"
                onClick={() =>
                  setInputs((prev) => ({
                    ...prev,
                    parameters: {
                      discountRatePercent: 12,
                      taxRatePercent: 35,
                      inflationRatePercent: 4.5,
                    },
                  }))
                }
                className="px-2.5 py-1 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors shrink-0"
              >
                Aplicar Estándar (12% / 35% / 4.5%)
              </button>
            </div>

            <div className="p-4 bg-emerald-600 text-white rounded-xl space-y-2 mt-4 text-center">
              <div className="font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> ¡Modelo Parametrizado!
              </div>
              <p className="text-[11px] opacity-90">
                Haz clic en <strong>"Ver Resultados y Evaluador IA"</strong> para visualizar métricas (VAN, TIR, Punto de Equilibrio), gráficos, estados financieros y diagnóstico IA.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Panel Footer Navigation (Paso Anterior / Siguiente Paso) */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        {currentStep < 6 ? (
          <button
            onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
          >
            Siguiente Paso <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onGoToResults}
            className="px-4 py-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Ver Resultados y Evaluador IA
          </button>
        )}
      </div>

    </div>
  );
};
