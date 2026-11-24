import {
  CalculatedFinancials,
  FinancialModelInputs,
  YearProjection,
  BreakEvenAnalysis,
  SensitivityScenario,
} from '../types/financial';

/**
 * Calculates Net Present Value (VAN / NPV)
 */
export function calculateNPV(ratePercent: number, initialInvestment: number, cashFlows: number[]): number {
  const r = ratePercent / 100;
  let npv = -initialInvestment;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + r, t + 1);
  }
  return Math.round(npv);
}

/**
 * Calculates Internal Rate of Return (TIR / IRR) using Newton-Raphson method
 */
export function calculateIRR(initialInvestment: number, cashFlows: number[]): number | null {
  if (initialInvestment <= 0 || cashFlows.every((cf) => cf <= 0)) {
    return null;
  }

  let rate = 0.15; // Initial guess 15%
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iter = 0; iter < maxIterations; iter++) {
    let npv = -initialInvestment;
    let dNpv = 0; // derivative with respect to rate

    for (let t = 0; t < cashFlows.length; t++) {
      const period = t + 1;
      const discountFactor = Math.pow(1 + rate, period);
      npv += cashFlows[t] / discountFactor;
      dNpv -= (period * cashFlows[t]) / Math.pow(1 + rate, period + 1);
    }

    if (Math.abs(npv) < tolerance) {
      const irrPercent = rate * 100;
      return irrPercent > -100 && irrPercent < 1000 ? Math.round(irrPercent * 100) / 100 : null;
    }

    if (Math.abs(dNpv) < 1e-10) {
      break;
    }

    const nextRate = rate - npv / dNpv;
    if (nextRate <= -0.99 || nextRate > 10) {
      break;
    }
    rate = nextRate;
  }

  // Fallback Bisection method if Newton-Raphson fails to converge
  let low = -0.5;
  let high = 5.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    let val = -initialInvestment;
    for (let t = 0; t < cashFlows.length; t++) {
      val += cashFlows[t] / Math.pow(1 + mid, t + 1);
    }
    if (Math.abs(val) < 0.1) {
      return Math.round(mid * 10000) / 100;
    }
    if (val > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return null;
}

/**
 * Calculates complete financial model
 */
export function computeFinancialModel(inputs: FinancialModelInputs): CalculatedFinancials {
  // 1. Initial Investments & Debt
  const totalInitialInvestment = inputs.investments.reduce((sum, inv) => sum + inv.amount, 0);
  const fundedByEquity = Math.max(0, inputs.equityContribution);
  const fundedByGrant = Math.max(0, inputs.grantFunding);
  const fundedByLoan = inputs.loan.hasLoan ? Math.max(0, inputs.loan.loanAmount) : 0;

  // Yearly Depreciation calculation (linear)
  const totalDepreciationYearly = inputs.investments.reduce((sum, inv) => {
    if (inv.usefulLifeYears && inv.usefulLifeYears > 0) {
      return sum + inv.amount / inv.usefulLifeYears;
    }
    return sum + inv.amount / 5; // Default 5 years
  }, 0);

  // Monthly Loan Payment Calculation (Amortización cuota fija francesa)
  let monthlyLoanPayment = 0;
  let monthlyInterestRate = 0;
  if (inputs.loan.hasLoan && inputs.loan.loanAmount > 0 && inputs.loan.termMonths > 0) {
    monthlyInterestRate = inputs.loan.annualInterestRatePercent / 100 / 12;
    if (monthlyInterestRate > 0) {
      monthlyLoanPayment =
        (inputs.loan.loanAmount *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, inputs.loan.termMonths))) /
        (Math.pow(1 + monthlyInterestRate, inputs.loan.termMonths) - 1);
    } else {
      monthlyLoanPayment = inputs.loan.loanAmount / inputs.loan.termMonths;
    }
  }

  // Monthly Fixed Operating Expenses
  const monthlyFixedCostsTotal = inputs.operatingExpenses.reduce((sum, exp) => sum + exp.monthlyCost, 0);
  const annualFixedCostsBase = monthlyFixedCostsTotal * 12;

  // Product sales and margins calculations for Year 1
  let totalYear1Units = 0;
  let totalYear1Revenue = 0;
  let totalYear1VariableCosts = 0;

  // Monthly year 1 tracking
  const monthlyYear1Revenue: number[] = new Array(12).fill(0);
  const monthlyYear1VarCosts: number[] = new Array(12).fill(0);

  inputs.products.forEach((prod) => {
    let currentUnits = prod.initialMonthlySalesUnits;
    const monthlyGrowthRate = prod.monthlyGrowthRatePercent / 100;

    for (let m = 0; m < 12; m++) {
      if (m > 0) {
        currentUnits = currentUnits * (1 + monthlyGrowthRate);
      }
      const rev = currentUnits * prod.unitPrice;
      const varCost = currentUnits * prod.unitVariableCost;

      monthlyYear1Revenue[m] += rev;
      monthlyYear1VarCosts[m] += varCost;

      totalYear1Units += currentUnits;
      totalYear1Revenue += rev;
      totalYear1VariableCosts += varCost;
    }
  });

  // Calculate Break-Even Metrics for Year 1 (monthly basis)
  let avgWeightedPrice = 0;
  let avgWeightedVariableCost = 0;
  if (totalYear1Units > 0) {
    avgWeightedPrice = totalYear1Revenue / totalYear1Units;
    avgWeightedVariableCost = totalYear1VariableCosts / totalYear1Units;
  } else if (inputs.products.length > 0) {
    avgWeightedPrice = inputs.products[0].unitPrice;
    avgWeightedVariableCost = inputs.products[0].unitVariableCost;
  }

  const avgContributionMargin = avgWeightedPrice - avgWeightedVariableCost;
  const contributionMarginRatio = avgWeightedPrice > 0 ? avgContributionMargin / avgWeightedPrice : 0;

  const monthlyBreakEvenUnits =
    avgContributionMargin > 0 ? Math.ceil(monthlyFixedCostsTotal / avgContributionMargin) : 0;
  const monthlyBreakEvenRevenue =
    contributionMarginRatio > 0 ? Math.round(monthlyFixedCostsTotal / contributionMarginRatio) : 0;
  const annualBreakEvenRevenue = monthlyBreakEvenRevenue * 12;

  const breakEven: BreakEvenAnalysis = {
    monthlyFixedCosts: monthlyFixedCostsTotal,
    averageWeightedPrice: Math.round(avgWeightedPrice),
    averageWeightedVariableCost: Math.round(avgWeightedVariableCost),
    averageWeightedContributionMargin: Math.round(avgContributionMargin),
    contributionMarginRatio: Math.round(contributionMarginRatio * 10000) / 100,
    monthlyBreakEvenUnits,
    monthlyBreakEvenRevenue,
    annualBreakEvenRevenue,
  };

  // 5-Year Projections
  const annualProjections: YearProjection[] = [];

  let loanBalance = inputs.loan.hasLoan ? inputs.loan.loanAmount : 0;
  let accumulatedCash = -fundedByEquity; // Entrepreneur's initial outlay

  const freeCashFlows: number[] = [];
  const monthlyYear1CashFlow: number[] = [];

  const inflation = inputs.parameters.inflationRatePercent / 100;
  const taxRate = inputs.parameters.taxRatePercent / 100;

  let currentYearRevenue = totalYear1Revenue;
  let currentYearVarCosts = totalYear1VariableCosts;

  for (let year = 1; year <= 5; year++) {
    if (year > 1) {
      // Proyección de incremento anual basada equitativamente en la tasa de inflación proyectada
      currentYearRevenue = currentYearRevenue * (1 + inflation);
      currentYearVarCosts = currentYearVarCosts * (1 + inflation);
    }

    const opex = annualFixedCostsBase * Math.pow(1 + inflation, year - 1);
    const grossMargin = currentYearRevenue - currentYearVarCosts;
    const grossMarginPercent = currentYearRevenue > 0 ? (grossMargin / currentYearRevenue) * 100 : 0;
    const ebitda = grossMargin - opex;

    const depreciation = totalDepreciationYearly;
    const ebit = ebitda - depreciation;

    // Debt amortization for the year
    let interestPaidYear = 0;
    let principalPaidYear = 0;

    for (let m = 0; m < 12; m++) {
      const monthIndex = (year - 1) * 12 + m;
      if (inputs.loan.hasLoan && monthIndex < inputs.loan.termMonths && loanBalance > 0) {
        const interestMonth = loanBalance * monthlyInterestRate;
        const principalMonth = Math.min(loanBalance, monthlyLoanPayment - interestMonth);
        interestPaidYear += interestMonth;
        principalPaidYear += principalMonth;
        loanBalance -= principalMonth;
      }
    }

    const ebt = ebit - interestPaidYear;
    const taxPaid = ebt > 0 ? ebt * taxRate : 0;
    const netIncome = ebt - taxPaid;
    const netMarginPercent = currentYearRevenue > 0 ? (netIncome / currentYearRevenue) * 100 : 0;

    const operatingCashFlow = netIncome + depreciation;
    const freeCashFlow = operatingCashFlow - principalPaidYear;

    accumulatedCash += freeCashFlow;

    freeCashFlows.push(Math.round(freeCashFlow));

    annualProjections.push({
      year,
      revenue: Math.round(currentYearRevenue),
      variableCosts: Math.round(currentYearVarCosts),
      grossMargin: Math.round(grossMargin),
      grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
      operatingExpenses: Math.round(opex),
      ebitda: Math.round(ebitda),
      depreciation: Math.round(depreciation),
      ebit: Math.round(ebit),
      interestPaid: Math.round(interestPaidYear),
      ebt: Math.round(ebt),
      taxPaid: Math.round(taxPaid),
      netIncome: Math.round(netIncome),
      netMarginPercent: Math.round(netMarginPercent * 10) / 10,
      operatingCashFlow: Math.round(operatingCashFlow),
      principalPaid: Math.round(principalPaidYear),
      freeCashFlow: Math.round(freeCashFlow),
      accumulatedCashFlow: Math.round(accumulatedCash),
    });

    if (year === 1) {
      let runCash = -fundedByEquity;
      for (let m = 0; m < 12; m++) {
        const mRev = monthlyYear1Revenue[m];
        const mVar = monthlyYear1VarCosts[m];
        const mOpex = monthlyFixedCostsTotal;
        const mNetOp = mRev - mVar - mOpex;
        runCash += mNetOp;
        monthlyYear1CashFlow.push(Math.round(runCash));
      }
    }
  }

  // Compute NPV (VAN) and IRR (TIR)
  // Net Initial Investment for the entrepreneur = Total Investment - Grant
  const netInitialOutlay = Math.max(0, fundedByEquity + fundedByLoan);
  const npv = calculateNPV(inputs.parameters.discountRatePercent, netInitialOutlay, freeCashFlows);
  const irr = calculateIRR(netInitialOutlay, freeCashFlows);

  // Payback calculation (in months)
  let paybackMonths = 60; // default cap
  let cumCash = -netInitialOutlay;
  let recovered = false;

  for (let year = 1; year <= 5; year++) {
    const fcf = freeCashFlows[year - 1];
    const prevCum = cumCash;
    cumCash += fcf;

    if (cumCash >= 0 && !recovered) {
      recovered = true;
      const fraction = Math.abs(prevCum) / (fcf || 1);
      paybackMonths = Math.round(((year - 1) + fraction) * 12);
      break;
    }
  }

  // Sensitivity Analysis
  const runScenario = (name: string, salesMult: number, costMult: number): SensitivityScenario => {
    const scenarioFlows = freeCashFlows.map((cf, idx) => {
      const rev = annualProjections[idx].revenue * salesMult;
      const varC = annualProjections[idx].variableCosts * costMult;
      const opexC = annualProjections[idx].operatingExpenses * costMult;
      const net = rev - varC - opexC;
      return Math.round(net);
    });

    const sNpv = calculateNPV(inputs.parameters.discountRatePercent, netInitialOutlay, scenarioFlows);
    const sIrr = calculateIRR(netInitialOutlay, scenarioFlows);

    let sPayback = 60;
    let sCum = -netInitialOutlay;
    for (let y = 1; y <= 5; y++) {
      const f = scenarioFlows[y - 1];
      const pCum = sCum;
      sCum += f;
      if (sCum >= 0) {
        const frac = Math.abs(pCum) / (f || 1);
        sPayback = Math.round(((y - 1) + frac) * 12);
        break;
      }
    }

    return {
      name,
      salesMultiplier: salesMult,
      costMultiplier: costMult,
      npv: sNpv,
      irr: sIrr,
      paybackMonths: sPayback,
      isViable: sNpv > 0,
    };
  };

  const sensitivity = {
    base: runScenario('Base', 1.0, 1.0),
    pessimistic: runScenario('Pesimista (-20% Ventas, +10% Costos)', 0.8, 1.1),
    optimistic: runScenario('Optimista (+20% Ventas, -5% Costos)', 1.2, 0.95),
  };

  return {
    totalInitialInvestment,
    fundedByEquity,
    fundedByGrant,
    fundedByLoan,
    annualProjections,
    monthlyYear1CashFlow,
    npv,
    irr,
    paybackMonths,
    breakEven,
    sensitivity,
    totalDepreciationYearly: Math.round(totalDepreciationYearly),
    monthlyFixedCostsTotal: Math.round(monthlyFixedCostsTotal),
    monthlyVariableCostsYear1Avg: Math.round(totalYear1VariableCosts / 12),
    monthlyRevenueYear1Avg: Math.round(totalYear1Revenue / 12),
  };
}

/**
 * Currency Formatter (COP / USD format)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Number Formatter (Units)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(num);
}
