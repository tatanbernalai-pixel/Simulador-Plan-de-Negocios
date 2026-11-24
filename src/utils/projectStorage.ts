import { AIFinancialDiagnosis, FinancialModelInputs, SavedProject } from '../types/financial';

const SAVED_PROJECTS_KEY = 'simulador_financiero_saved_projects';
const ACTIVE_DRAFT_INPUTS_KEY = 'simulador_financiero_inputs';
const ACTIVE_DRAFT_DIAGNOSIS_KEY = 'simulador_financiero_diagnosis';
const ACTIVE_PROJECT_ID_KEY = 'simulador_financiero_active_project_id';

export function createEmptyInputs(): FinancialModelInputs {
  return {
    student: {
      projectName: '',
      studentName: '',
      studentId: '',
      teamMembers: [],
      programName: '',
      centerName: '',
      instructorName: '',
      sector: 'software',
      city: '',
    },
    investments: [],
    equityContribution: 0,
    grantFunding: 0,
    loan: {
      hasLoan: false,
      loanAmount: 0,
      annualInterestRatePercent: 0,
      termMonths: 12,
    },
    products: [],
    operatingExpenses: [],
    parameters: {
      discountRatePercent: 0,
      taxRatePercent: 0,
      inflationRatePercent: 0,
    },
  };
}

export function hasAnyProjectData(inputs: FinancialModelInputs): boolean {
  const s = inputs.student;
  const hasStudentInfo =
    Boolean(s.projectName?.trim()) ||
    Boolean(s.studentName?.trim()) ||
    Boolean(s.studentId?.trim()) ||
    Boolean(s.programName?.trim()) ||
    Boolean(s.centerName?.trim()) ||
    Boolean(s.instructorName?.trim()) ||
    Boolean(s.city?.trim()) ||
    (s.teamMembers && s.teamMembers.some((m) => m.fullName.trim() || m.documentNumber.trim()));

  const hasArrays =
    inputs.investments.length > 0 ||
    inputs.products.length > 0 ||
    inputs.operatingExpenses.length > 0;

  const hasNumbers =
    inputs.equityContribution > 0 ||
    inputs.grantFunding > 0 ||
    (inputs.loan.hasLoan && inputs.loan.loanAmount > 0) ||
    inputs.parameters.discountRatePercent > 0 ||
    inputs.parameters.taxRatePercent > 0 ||
    inputs.parameters.inflationRatePercent > 0;

  return Boolean(hasStudentInfo || hasArrays || hasNumbers);
}

export function loadSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(SAVED_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading saved projects:', e);
    return [];
  }
}

export function saveProjectsList(projects: SavedProject[]): void {
  try {
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects list:', e);
  }
}

export function upsertSavedProject(project: SavedProject): SavedProject[] {
  const existing = loadSavedProjects();
  const idx = existing.findIndex((p) => p.id === project.id);
  let updated: SavedProject[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = project;
  } else {
    updated = [project, ...existing];
  }
  saveProjectsList(updated);
  return updated;
}

export function deleteSavedProject(projectId: string): SavedProject[] {
  const existing = loadSavedProjects();
  const updated = existing.filter((p) => p.id !== projectId);
  saveProjectsList(updated);
  return updated;
}

export function loadActiveDraft(): {
  inputs: FinancialModelInputs;
  diagnosis: AIFinancialDiagnosis | null;
  activeProjectId: string | null;
} | null {
  try {
    const rawInputs = localStorage.getItem(ACTIVE_DRAFT_INPUTS_KEY);
    if (!rawInputs) return null;
    const inputs = JSON.parse(rawInputs) as FinancialModelInputs;

    let diagnosis: AIFinancialDiagnosis | null = null;
    const rawDiag = localStorage.getItem(ACTIVE_DRAFT_DIAGNOSIS_KEY);
    if (rawDiag) {
      try {
        diagnosis = JSON.parse(rawDiag);
      } catch {
        diagnosis = null;
      }
    }

    const activeProjectId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
    return { inputs, diagnosis, activeProjectId };
  } catch (e) {
    console.error('Error loading active draft:', e);
    return null;
  }
}

export function saveActiveDraft(
  inputs: FinancialModelInputs,
  diagnosis: AIFinancialDiagnosis | null,
  activeProjectId: string | null
): void {
  try {
    localStorage.setItem(ACTIVE_DRAFT_INPUTS_KEY, JSON.stringify(inputs));
    if (diagnosis) {
      localStorage.setItem(ACTIVE_DRAFT_DIAGNOSIS_KEY, JSON.stringify(diagnosis));
    } else {
      localStorage.removeItem(ACTIVE_DRAFT_DIAGNOSIS_KEY);
    }
    if (activeProjectId) {
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, activeProjectId);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  } catch (e) {
    console.error('Error saving active draft:', e);
  }
}

export function clearActiveDraft(): void {
  try {
    localStorage.removeItem(ACTIVE_DRAFT_INPUTS_KEY);
    localStorage.removeItem(ACTIVE_DRAFT_DIAGNOSIS_KEY);
    localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
  } catch (e) {
    console.error('Error clearing active draft:', e);
  }
}

export function exportProjectToJson(project: SavedProject): void {
  const dataStr = JSON.stringify(project, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const safeName = (project.name || 'proyecto-financiero')
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ_-]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName || 'proyecto-sena'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedProjectJson(jsonText: string): SavedProject | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') return null;

    // Support both wrapped SavedProject and raw FinancialModelInputs
    if (parsed.inputs && parsed.inputs.student && Array.isArray(parsed.inputs.products)) {
      const now = new Date().toISOString();
      return {
        id: `proj_${Date.now()}`,
        name: parsed.name || parsed.inputs.student.projectName || 'Proyecto Importado',
        createdAt: parsed.createdAt || now,
        updatedAt: now,
        inputs: parsed.inputs,
        diagnosis: parsed.diagnosis || null,
        summary: parsed.summary,
      };
    }

    if (parsed.student && Array.isArray(parsed.products) && Array.isArray(parsed.investments)) {
      const now = new Date().toISOString();
      return {
        id: `proj_${Date.now()}`,
        name: parsed.student.projectName || 'Proyecto Importado',
        createdAt: now,
        updatedAt: now,
        inputs: parsed as FinancialModelInputs,
        diagnosis: null,
      };
    }

    return null;
  } catch {
    return null;
  }
}
