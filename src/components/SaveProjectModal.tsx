import React, { useState, useEffect } from 'react';
import { X, Save, CopyPlus, CheckCircle2, Cloud, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName: string;
  isExistingProject: boolean;
  existingProjectName?: string;
  onSave: (name: string, saveAsNew: boolean) => void | Promise<void>;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  defaultName,
  isExistingProject,
  existingProjectName,
  onSave,
  user,
  authLoading,
  onSignIn,
}) => {
  const [projectName, setProjectName] = useState(defaultName);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProjectName(defaultName || '');
      setError('');
      setSaving(false);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleConfirm = async (saveAsNew: boolean) => {
    const trimmed = projectName.trim();
    if (!trimmed) {
      setError('Por favor ingresa un nombre para identificar este proyecto.');
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed, saveAsNew);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar Proyecto Simulado</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {user ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
              <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Se guardará de forma segura en tu cuenta en la nube (<strong>{user.email}</strong>) para acceder desde cualquier dispositivo.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2 text-[11px] text-blue-900 dark:text-blue-200">
              <p>
                Sin sesión iniciada, el proyecto se guardará solo en este navegador. Conéctate con Google para guardarlo en Firebase Cloud entre sesiones y dispositivos.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                disabled={authLoading}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                {authLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
              </button>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre del Proyecto Guardado
            </label>
            <input
              type="text"
              value={projectName}
              maxLength={150}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm(!isExistingProject);
                }
              }}
              placeholder="Ej. EcoEmpaques SENA - Escenario Base"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
              autoFocus
            />
            {error && <p className="text-red-500 text-[11px] mt-1 font-medium">{error}</p>}
          </div>

          {isExistingProject && existingProjectName && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-700 dark:text-slate-300">
              Actualmente estás editando el proyecto guardado: <strong>{existingProjectName}</strong>. Puedes actualizarlo o guardarlo como una nueva copia.
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            {isExistingProject ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CopyPlus className="w-3.5 h-3.5" /> Guardar como Nuevo
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Actualizar Actual'}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleConfirm(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar Proyecto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
