import React from 'react';
import { Download, Eraser, Moon, Sun, Sparkles, Save, FolderOpen, Cloud, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { ModelPreset } from '../types/financial';
import { PRESET_MODELS } from '../utils/presets';
import { SenaLogo } from './SenaLogo';

interface HeaderProps {
  onSelectPreset: (preset: ModelPreset) => void;
  onClearFields: () => void;
  onSaveProject: () => void;
  onOpenSavedProjects: () => void;
  savedProjectsCount: number;
  onExportPDF: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  hasAIAnalysis: boolean;
  onOpenAI: () => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onClearFields,
  onSaveProject,
  onOpenSavedProjects,
  savedProjectsCount,
  onExportPDF,
  isDarkMode,
  setIsDarkMode,
  hasAIAnalysis,
  onOpenAI,
  user,
  authLoading,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs no-print">
      {/* Row 1: Brand Title + Primary Account & Export Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2.5 gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm p-1.5 shrink-0">
              <SenaLogo className="w-full h-full text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Simulador Modelo Financiero Plan de Negocio
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                <span className="truncate">Servicio Nacional de Aprendizaje</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0 font-semibold">SENA</span>
              </div>
            </div>
          </div>

          {/* Right Global Controls: Cloud Auth, Theme & Export PDF */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs">
                <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden sm:inline font-semibold text-emerald-800 dark:text-emerald-200 max-w-[130px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={authLoading}
                  title="Cerrar sesión en la nube"
                  className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                disabled={authLoading}
                title="Iniciar sesión con Google para guardar en la nube Firebase"
                className="px-3 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{authLoading ? 'Conectando...' : 'Conectar Nube'}</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary CTA: Export Evidence PDF */}
            <button
              type="button"
              onClick={onExportPDF}
              title="Exportar Evidencia PDF / Imprimir"
              className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Exportar Evidencia PDF</span>
              <span className="hidden sm:inline lg:hidden">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Workspace Action Toolbar (Wrapped cleanly inside max-w-7xl) */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Left Tools: Sector Examples, Saved Projects & AI Evaluator */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <select
              onChange={(e) => {
                const selected = PRESET_MODELS.find((p) => p.id === e.target.value);
                if (selected) {
                  onSelectPreset(selected);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              aria-label="Cargar ejemplo por sector"
              className="text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-full sm:max-w-[230px]"
            >
              <option value="" disabled>
                Cargar Ejemplo por Sector...
              </option>
              {PRESET_MODELS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.program.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOpenSavedProjects}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Mis Proyectos ({savedProjectsCount})</span>
            </button>

            <button
              type="button"
              onClick={onOpenAI}
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Evaluador IA</span>
              {hasAIAnalysis && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
          </div>

          {/* Right Tools: Save & Clear */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSaveProject}
              title="Guardar proyecto simulado"
              className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Guardar Proyecto</span>
            </button>

            <button
              type="button"
              onClick={onClearFields}
              title="Limpiar campos de información"
              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800/60 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Eraser className="w-3.5 h-3.5 shrink-0" />
              <span>Limpiar Campos</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
