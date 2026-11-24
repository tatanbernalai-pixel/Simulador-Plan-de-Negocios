import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { SavedProject } from '../types/financial';
import {
  X,
  FolderOpen,
  Search,
  Trash2,
  Download,
  Upload,
  FilePlus2,
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  Cloud,
  LogIn,
  CloudUpload,
} from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculations';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  activeProjectId: string | null;
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onExportProject: (project: SavedProject) => void;
  onImportProjectFile: (file: File) => void;
  onNewBlankProject: () => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  localProjectsCount?: number;
  onMigrateLocalToCloud?: () => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onLoadProject,
  onDeleteProject,
  onExportProject,
  onImportProjectFile,
  onNewBlankProject,
  user,
  authLoading,
  onSignIn,
  localProjectsCount = 0,
  onMigrateLocalToCloud,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((proj) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const teamText = (proj.inputs.student.teamMembers || [])
      .map((m) => `${m.fullName} ${m.documentNumber}`)
      .join(' ')
      .toLowerCase();
    return (
      proj.name.toLowerCase().includes(q) ||
      (proj.inputs.student.projectName || '').toLowerCase().includes(q) ||
      (proj.inputs.student.studentName || '').toLowerCase().includes(q) ||
      (proj.inputs.student.studentId || '').toLowerCase().includes(q) ||
      (proj.inputs.student.programName || '').toLowerCase().includes(q) ||
      teamText.includes(q)
    );
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const getTeamLabel = (proj: SavedProject) => {
    const valid = (proj.inputs.student.teamMembers || [])
      .map((m) => m.fullName.trim())
      .filter(Boolean);
    if (valid.length > 0) return valid.join(' - ');
    return proj.inputs.student.studentName || 'Sin aprendices registrados';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            <span>Proyectos Simulados Guardados ({projects.length})</span>
            {user && (
              <span className="px-2 py-0.5 bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-full flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Nube Firebase
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Status Bar */}
        {!user ? (
          <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
            <span className="text-blue-900 dark:text-blue-200">
              Inicia sesión con Google para guardar tus proyectos en la nube (Firebase) entre sesiones y dispositivos.
            </span>
            <button
              type="button"
              onClick={onSignIn}
              disabled={authLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              {authLoading ? 'Conectando...' : 'Conectar con Google'}
            </button>
          </div>
        ) : (
          localProjectsCount > 0 &&
          onMigrateLocalToCloud && (
            <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
              <span className="text-emerald-900 dark:text-emerald-200">
                Tienes <strong>{localProjectsCount}</strong> proyecto(s) guardados localmente en este navegador. ¿Deseas subirlos a tu cuenta en la nube?
              </span>
              <button
                type="button"
                onClick={onMigrateLocalToCloud}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
              >
                <CloudUpload className="w-3.5 h-3.5" /> Subir a la Nube
              </button>
            </div>
          )
        )}

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por proyecto, aprendiz o ficha..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImportProjectFile(file);
                  e.target.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" /> Importar JSON
            </button>
            <button
              type="button"
              onClick={() => {
                onNewBlankProject();
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FilePlus2 className="w-3.5 h-3.5" /> Nuevo en Blanco
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {projects.length === 0
                  ? 'Aún no tienes proyectos simulados guardados'
                  : 'No se encontraron proyectos con ese criterio'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {projects.length === 0
                  ? 'Diligencia los pasos del simulador y haz clic en "Guardar Proyecto" para conservar cada simulación y retomarla en cualquier momento.'
                  : 'Intenta buscar con otro nombre de proyecto, aprendiz o número de ficha.'}
              </p>
            </div>
          ) : (
            filteredProjects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const isDeleting = confirmDeleteId === proj.id;

              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-700'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {proj.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> En edición
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-full uppercase">
                          {proj.inputs.student.sector}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {getTeamLabel(proj)}
                        </span>
                        {proj.inputs.student.studentId && (
                          <span className="font-mono">
                            Ficha: <strong className="text-slate-700 dark:text-slate-300">{proj.inputs.student.studentId}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(proj.updatedAt)}
                        </span>
                      </div>

                      {proj.summary && (
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                          <span className="text-slate-500">
                            Inversión: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(proj.summary.totalInvestment)}</strong>
                          </span>
                          <span className="text-slate-500">
                            VAN:{' '}
                            <strong className={proj.summary.npv >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                              {formatCurrency(proj.summary.npv)}
                            </strong>
                          </span>
                          <span className="text-slate-500">
                            TIR: <strong className="text-slate-800 dark:text-slate-200">{proj.summary.irr !== null ? `${proj.summary.irr}%` : 'N/A'}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDeleting ? (
                        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 p-1 rounded-xl border border-red-200 dark:border-red-900">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteProject(proj.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-300 text-[11px] font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onExportProject(proj)}
                            title="Descargar respaldo .json"
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(proj.id)}
                            title="Eliminar proyecto"
                            className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onLoadProject(proj);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            Cargar <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
