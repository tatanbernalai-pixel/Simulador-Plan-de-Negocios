import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InputsSection } from './components/InputsSection';
import { MetricsOverview } from './components/MetricsOverview';
import { ChartsSection } from './components/ChartsSection';
import { FinancialStatements } from './components/FinancialStatements';
import { AIAssessor } from './components/AIAssessor';
import { EvidenceReportModal } from './components/EvidenceReportModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { ConfirmClearModal } from './components/ConfirmClearModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useFirebase } from './contexts/FirebaseContext';
import {
  subscribeUserProjects,
  createCloudProject,
  updateCloudProject,
  deleteCloudProject,
} from './services/firestoreProjects';
import { AIFinancialDiagnosis, FinancialModelInputs, ModelPreset, SavedProject } from './types/financial';
import { computeFinancialModel } from './utils/financialCalculations';
import {
  createEmptyInputs,
  hasAnyProjectData,
  loadSavedProjects,
  saveProjectsList,
  upsertSavedProject,
  deleteSavedProject,
  loadActiveDraft,
  saveActiveDraft,
  clearActiveDraft,
  exportProjectToJson,
  parseImportedProjectJson,
} from './utils/projectStorage';
import {
  Sparkles,
  Layers,
  BarChart3,
  ArrowLeft,
  Eraser,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const { user, authReady, authLoading, authError, signInWithGoogle, signOutUser, clearAuthError } = useFirebase();

  // Initial draft lookup
  const initialDraft = useMemo(() => loadActiveDraft(), []);

  // View Mode State: 'wizard' | 'results'
  const [viewMode, setViewMode] = useState<'wizard' | 'results'>('wizard');
  const [resultsTab, setResultsTab] = useState<'dashboard' | 'statements' | 'ai'>('dashboard');
  const [resetStepTrigger, setResetStepTrigger] = useState<number>(0);

  // Financial Inputs State (Starts clean by default if no prior draft exists)
  const [inputs, setInputs] = useState<FinancialModelInputs>(() => {
    if (initialDraft?.inputs) {
      return initialDraft.inputs;
    }
    return createEmptyInputs();
  });

  // AI Diagnosis State
  const [diagnosis, setDiagnosis] = useState<AIFinancialDiagnosis | null>(() => {
    return initialDraft?.diagnosis || null;
  });

  // Saved Projects State (local fallback + Firestore real-time sync when signed in)
  const [localProjects, setLocalProjects] = useState<SavedProject[]>(() => loadSavedProjects());
  const [cloudProjects, setCloudProjects] = useState<SavedProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return initialDraft?.activeProjectId || null;
  });

  const savedProjects = user ? cloudProjects : localProjects;

  // Startup banner when a previous session draft is loaded
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(() => {
    return Boolean(initialDraft?.inputs && hasAnyProjectData(initialDraft.inputs));
  });

  // Modals State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedProjectsModalOpen, setIsSavedProjectsModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Show auth errors in toast
  useEffect(() => {
    if (authError) {
      showToast(authError, 'error');
      clearAuthError();
    }
  }, [authError]);

  // Attach Firestore real-time listener ONLY when auth is ready and user is authenticated
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setCloudProjects([]);
      return;
    }

    const unsubscribe = subscribeUserProjects(
      user.uid,
      (projects) => {
        setCloudProjects(projects);
      },
      (err) => {
        if (err.message.includes('Quota exceeded')) {
          showToast('Cuota diaria de Firestore alcanzada. Intenta nuevamente mañana.', 'error');
        } else {
          showToast('Error sincronizando proyectos con Firebase.', 'error');
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  // Persist active draft to LocalStorage whenever inputs, diagnosis, or activeProjectId change
  useEffect(() => {
    saveActiveDraft(inputs, diagnosis, activeProjectId);
  }, [inputs, diagnosis, activeProjectId]);

  // Recalculate financial model in real time as inputs change
  const calculations = useMemo(() => {
    return computeFinancialModel(inputs);
  }, [inputs]);

  const activeSavedProject = useMemo(
    () => savedProjects.find((p) => p.id === activeProjectId) || null,
    [savedProjects, activeProjectId]
  );

  const hasData = useMemo(() => hasAnyProjectData(inputs), [inputs]);

  // Handler for selecting a preset model
  const handleSelectPreset = (preset: ModelPreset) => {
    setInputs(preset.inputs);
    setDiagnosis(null);
    setActiveProjectId(null);
    setShowRestoredBanner(false);
    setViewMode('wizard');
    setResetStepTrigger((n) => n + 1);
    showToast(`Ejemplo cargado: ${preset.name}`, 'info');
  };

  // Clear all fields to a blank project
  const executeClearFields = () => {
    setInputs(createEmptyInputs());
    setDiagnosis(null);
    setActiveProjectId(null);
    setShowRestoredBanner(false);
    clearActiveDraft();
    setViewMode('wizard');
    setResetStepTrigger((n) => n + 1);
    showToast('Campos limpiados. Puedes iniciar un nuevo proyecto desde el Paso 1.', 'info');
  };

  const handleRequestClearFields = () => {
    if (!hasData) {
      executeClearFields();
      return;
    }
    setIsConfirmClearOpen(true);
  };

  // Save current project (Firestore Cloud if signed in, localStorage fallback otherwise)
  const handleSaveProject = async (name: string, saveAsNew: boolean) => {
    const now = new Date().toISOString();
    const isUpdatingExisting = !saveAsNew && Boolean(activeSavedProject);
    const targetId = isUpdatingExisting && activeSavedProject ? activeSavedProject.id : `proj_${Date.now()}`;
    const createdAt = isUpdatingExisting && activeSavedProject ? activeSavedProject.createdAt : now;

    const updatedInputs: FinancialModelInputs = {
      ...inputs,
      student: {
        ...inputs.student,
        projectName: inputs.student.projectName.trim() || name,
      },
    };

    const projectToSave: SavedProject = {
      id: targetId,
      name,
      createdAt,
      updatedAt: now,
      inputs: updatedInputs,
      diagnosis,
      summary: {
        totalInvestment: calculations.totalInitialInvestment,
        npv: calculations.npv,
        irr: calculations.irr,
      },
    };

    if (user) {
      try {
        let finalId = targetId;
        if (isUpdatingExisting) {
          await updateCloudProject(projectToSave, user.uid);
        } else {
          finalId = await createCloudProject(projectToSave, user.uid);
        }
        setInputs(updatedInputs);
        setActiveProjectId(finalId);
        setShowRestoredBanner(false);
        showToast(`Proyecto "${name}" guardado en Firebase Cloud.`, 'success');
      } catch (err: any) {
        showToast('Error al guardar en Firebase: verifica permisos o conexión.', 'error');
        throw err;
      }
      return;
    }

    const updatedList = upsertSavedProject(projectToSave);
    setLocalProjects(updatedList);
    setInputs(updatedInputs);
    setActiveProjectId(targetId);
    setShowRestoredBanner(false);
    showToast(`Proyecto "${name}" guardado localmente en este navegador.`, 'success');
  };

  // Load a saved project
  const handleLoadSavedProject = (project: SavedProject) => {
    setInputs(project.inputs);
    setDiagnosis(project.diagnosis || null);
    setActiveProjectId(project.id);
    setShowRestoredBanner(false);
    setViewMode('wizard');
    setResetStepTrigger((n) => n + 1);
    showToast(`Proyecto "${project.name}" cargado.`, 'success');
  };

  // Delete a saved project
  const handleDeleteSavedProject = async (projectId: string) => {
    if (user) {
      try {
        await deleteCloudProject(projectId);
        if (activeProjectId === projectId) {
          setActiveProjectId(null);
        }
        showToast('Proyecto eliminado de la nube Firebase.', 'info');
      } catch {
        showToast('No se pudo eliminar el proyecto de Firebase.', 'error');
      }
      return;
    }

    const updatedList = deleteSavedProject(projectId);
    setLocalProjects(updatedList);
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
    showToast('Proyecto eliminado de la lista guardada.', 'info');
  };

  // Import JSON project file
  const handleImportProjectFile = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseImportedProjectJson(text);
      if (!imported) {
        showToast('El archivo seleccionado no tiene un formato de proyecto válido.', 'error');
        return;
      }

      if (user) {
        const finalId = await createCloudProject(imported, user.uid);
        handleLoadSavedProject({ ...imported, id: finalId });
        return;
      }

      const updatedList = upsertSavedProject(imported);
      setLocalProjects(updatedList);
      handleLoadSavedProject(imported);
    } catch {
      showToast('No se pudo leer o guardar el archivo del proyecto.', 'error');
    }
  };

  // Migrate local projects to Firebase Cloud
  const handleMigrateLocalToCloud = async () => {
    if (!user || localProjects.length === 0) return;
    try {
      for (const proj of localProjects) {
        await createCloudProject(
          { ...proj, id: `proj_${Date.now()}_${Math.floor(Math.random() * 1000)}` },
          user.uid
        );
      }
      saveProjectsList([]);
      setLocalProjects([]);
      showToast('Proyectos locales subidos a Firebase Cloud correctamente.', 'success');
    } catch {
      showToast('Ocurrió un error al migrar los proyectos locales a la nube.', 'error');
    }
  };

  const handleSignIn = async () => {
    const signedUser = await signInWithGoogle();
    if (signedUser) {
      showToast(`Sesión iniciada como ${signedUser.displayName || signedUser.email}`, 'success');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setActiveProjectId(null);
    showToast('Sesión cerrada. Ahora estás en modo local.', 'info');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        onClearFields={handleRequestClearFields}
        onSaveProject={() => setIsSaveModalOpen(true)}
        onOpenSavedProjects={() => setIsSavedProjectsModalOpen(true)}
        savedProjectsCount={savedProjects.length}
        onExportPDF={() => setIsExportModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        hasAIAnalysis={!!diagnosis}
        onOpenAI={() => {
          setViewMode('results');
          setResultsTab('ai');
        }}
        user={user}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 no-print animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-red-600 text-white border-red-500'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Startup Restored Session Banner */}
        {showRestoredBanner && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Se cargaron los datos del último proyecto trabajado en este navegador
                {inputs.student.projectName ? (
                  <> (<strong>{inputs.student.projectName}</strong>)</>
                ) : null}
                . ¿Deseas limpiar los campos para comenzar un proyecto nuevo?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={executeClearFields}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" /> Limpiar Campos
              </button>
              <button
                type="button"
                onClick={() => setShowRestoredBanner(false)}
                className="p-1.5 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
                title="Continuar editando estos datos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Project Header Bar */}
        <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-x-2 gap-y-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex-wrap">
              <span className="break-words">{inputs.student.projectName || 'Nuevo Plan de Negocio'}</span>
              <span aria-hidden="true">·</span>
              <span className="break-words">{inputs.student.programName || 'Formación Tecnológica'}</span>
              {activeSavedProject && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 normal-case tracking-normal">
                    Guardado: {activeSavedProject.name}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {viewMode === 'wizard' ? 'Paso a Paso: Diligenciamiento del Modelo Financiero' : 'Resultados, Métricas y Evaluador IA'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 max-w-full">
            {viewMode === 'results' && (
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> Volver a Editar Pasos
              </button>
            )}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 max-w-full">
              <span className="shrink-0">
                {inputs.student.teamMembers && inputs.student.teamMembers.filter((m) => m.fullName.trim()).length > 1
                  ? 'Aprendices:'
                  : 'Aprendiz:'}
              </span>
              <strong className="text-slate-900 dark:text-white font-sans break-words">
                {(() => {
                  const team = inputs.student.teamMembers || [];
                  const validNames = team.map((m) => m.fullName.trim()).filter(Boolean);
                  if (validNames.length > 0) {
                    return validNames.join(' - ');
                  }
                  return inputs.student.studentName || 'Sin registrar';
                })()}
              </strong>
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: WIZARD (Steps 1 to 6) */}
        {viewMode === 'wizard' && (
          <div className="max-w-3xl mx-auto">
            <p className="mb-4 text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
              Diligencia cada uno de los 6 pasos del simulador financiero de tu plan de negocio. Al completar el paso 6, podrás ver el análisis financiero completo, gráficos y el evaluador de IA.
            </p>
            <InputsSection
              inputs={inputs}
              setInputs={setInputs}
              onGoToResults={() => setViewMode('results')}
              resetStepTrigger={resetStepTrigger}
            />
          </div>
        )}

        {/* VIEW MODE 2: RESULTS (Full Financial Dashboard, Statements & AI Evaluator) */}
        {viewMode === 'results' && (
          <div className="space-y-6">
            
            {/* Results Navigation Tabs */}
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs no-print">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => setResultsTab('dashboard')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    resultsTab === 'dashboard'
                      ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Métricas &amp; Gráficos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResultsTab('statements')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    resultsTab === 'statements'
                      ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Estados Financieros (EEFF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResultsTab('ai')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 relative ${
                    resultsTab === 'ai'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Evaluador IA &amp; Mentor</span>
                  {diagnosis && (
                    <span className="w-2 h-2 rounded-full bg-emerald-300 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Always Visible Top Key KPI Cards */}
            <MetricsOverview calculations={calculations} parameters={inputs.parameters} />

            {/* Dynamic View based on Results Tab */}
            {resultsTab === 'dashboard' && (
              <ChartsSection calculations={calculations} inputs={inputs} />
            )}

            {resultsTab === 'statements' && (
              <FinancialStatements calculations={calculations} inputs={inputs} />
            )}

            {resultsTab === 'ai' && (
              <ErrorBoundary
                title="Ocurrió un error en el Evaluador IA"
                onReset={() => setDiagnosis(null)}
              >
                <AIAssessor
                  inputs={inputs}
                  calculations={calculations}
                  diagnosis={diagnosis}
                  setDiagnosis={setDiagnosis}
                />
              </ErrorBoundary>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div>
            <strong>Simulador Modelo Financiero Plan de Negocio</strong> · Herramienta interactiva para evidencias de aprendizaje.
          </div>
          <div className="flex items-center gap-4">
            <span>Evaluador Inteligente IA</span>
            <span>·</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors underline font-semibold text-emerald-600 dark:text-emerald-400"
            >
              Exportar Evidencia PDF / Imprimir
            </button>
          </div>
        </div>
      </footer>

      {/* Save Project Modal */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultName={inputs.student.projectName || activeSavedProject?.name || ''}
        isExistingProject={Boolean(activeSavedProject)}
        existingProjectName={activeSavedProject?.name}
        onSave={handleSaveProject}
        user={user}
        authLoading={authLoading}
        onSignIn={handleSignIn}
      />

      {/* Saved Projects Browser Modal */}
      <SavedProjectsModal
        isOpen={isSavedProjectsModalOpen}
        onClose={() => setIsSavedProjectsModalOpen(false)}
        projects={savedProjects}
        activeProjectId={activeProjectId}
        onLoadProject={handleLoadSavedProject}
        onDeleteProject={handleDeleteSavedProject}
        onExportProject={exportProjectToJson}
        onImportProjectFile={handleImportProjectFile}
        onNewBlankProject={executeClearFields}
        user={user}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        localProjectsCount={localProjects.length}
        onMigrateLocalToCloud={handleMigrateLocalToCloud}
      />

      {/* Confirm Clear Fields Modal */}
      <ConfirmClearModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirmClear={executeClearFields}
        onSaveFirst={() => setIsSaveModalOpen(true)}
        hasUnsavedData={hasData}
      />

      {/* Formal Printable Evidence PDF Modal */}
      <EvidenceReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        inputs={inputs}
        calculations={calculations}
        diagnosis={diagnosis}
      />
    </div>
  );
}
