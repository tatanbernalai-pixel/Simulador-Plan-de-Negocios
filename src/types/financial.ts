export type TechnologyProgram =
  | 'software'
  | 'produccion'
  | 'servicios'
  | 'comercio'
  | 'agroindustria'
  | 'otro';

export interface TeamMember {
  id: string;
  fullName: string;
  documentNumber: string;
}

export interface StudentInfo {
  projectName: string;
  studentName: string;
  studentId: string;
  teamMembers?: TeamMember[];
  programName: string; // e.g. "Tecnólogo en Desarrollo de Software"
  centerName: string; // e.g. "Centro de Diseño y Metrología"
  instructorName: string;
  sector: TechnologyProgram;
  city: string;
}

export interface InvestmentItem {
  id: string;
  name: string;
  category: 'equipo' | 'maquinaria' | 'software' | 'adecuaciones' | 'capital_trabajo' | 'otro';
  amount: number;
  usefulLifeYears: number; // For depreciation calculations
}

export interface ProductItem {
  id: string;
  name: string;
  unitPrice: number;
  unitVariableCost: number;
  initialMonthlySalesUnits: number;
  monthlyGrowthRatePercent: number; // Growth in year 1
  annualGrowthRatePercent: number; // Growth in years 2-5
}

export interface OperatingExpenseItem {
  id: string;
  name: string;
  category: 'nomina' | 'arriendo' | 'servicios' | 'marketing' | 'mantenimiento' | 'cloud_software' | 'imprevistos' | 'otro';
  monthlyCost: number;
}

export interface LoanConfig {
  hasLoan: boolean;
  loanAmount: number;
  annualInterestRatePercent: number;
  termMonths: number;
}

export interface FinancialParameters {
  discountRatePercent: number; // WACC or Tasa de Oportunidad (e.g. 12%)
  taxRatePercent: number; // Tasa de Impuesto a la Renta (e.g. 35%)
  inflationRatePercent: number; // Inflation for year 2-5 price adjustment (e.g. 4%)
}

export interface FinancialModelInputs {
  student: StudentInfo;
  investments: InvestmentItem[];
  equityContribution: number; // Aporte propio
  grantFunding: number; // Subsidio / Fondo Emprender
  loan: LoanConfig;
  products: ProductItem[];
  operatingExpenses: OperatingExpenseItem[];
  parameters: FinancialParameters;
}

export interface YearProjection {
  year: number;
  revenue: number;
  variableCosts: number;
  grossMargin: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interestPaid: number;
  ebt: number;
  taxPaid: number;
  netIncome: number;
  netMarginPercent: number;
  operatingCashFlow: number;
  principalPaid: number;
  freeCashFlow: number;
  accumulatedCashFlow: number;
}

export interface BreakEvenAnalysis {
  monthlyFixedCosts: number;
  averageWeightedPrice: number;
  averageWeightedVariableCost: number;
  averageWeightedContributionMargin: number;
  contributionMarginRatio: number; // %
  monthlyBreakEvenUnits: number;
  monthlyBreakEvenRevenue: number;
  annualBreakEvenRevenue: number;
}

export interface SensitivityScenario {
  name: string;
  salesMultiplier: number;
  costMultiplier: number;
  npv: number;
  irr: number | null;
  paybackMonths: number;
  isViable: boolean;
}

export interface CalculatedFinancials {
  totalInitialInvestment: number;
  fundedByEquity: number;
  fundedByGrant: number;
  fundedByLoan: number;
  
  annualProjections: YearProjection[]; // 5 years
  
  monthlyYear1CashFlow: number[]; // 12 months
  
  npv: number; // VAN
  irr: number | null; // TIR (null if non-convergent)
  paybackMonths: number; // Payback period
  
  breakEven: BreakEvenAnalysis;
  
  sensitivity: {
    base: SensitivityScenario;
    pessimistic: SensitivityScenario;
    optimistic: SensitivityScenario;
  };
  
  totalDepreciationYearly: number;
  monthlyFixedCostsTotal: number;
  monthlyVariableCostsYear1Avg: number;
  monthlyRevenueYear1Avg: number;
}

export interface AIFinancialDiagnosis {
  viabilityScore: number; // 0 to 100
  verdictLabel: 'Altamente Viable' | 'Viable con Ajustes' | 'Alto Riesgo Financiero' | 'No Viable';
  executiveSummary: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  costingAndPricingFeedback: {
    pricingRating: string;
    missingCostsAlerts: string[];
    marginObservations: string;
  };
  keyRiskFactors: string[];
  recommendations: string[];
  fundingSuitability: {
    fondoEmprenderReady: boolean;
    bankCreditReady: boolean;
    investorReady: boolean;
    comments: string;
  };
  learningActionPoints: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ModelPreset {
  id: string;
  name: string;
  program: TechnologyProgram;
  programTitle: string;
  description: string;
  inputs: FinancialModelInputs;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  inputs: FinancialModelInputs;
  diagnosis: AIFinancialDiagnosis | null;
  summary?: {
    totalInvestment: number;
    npv: number;
    irr: number | null;
  };
}

