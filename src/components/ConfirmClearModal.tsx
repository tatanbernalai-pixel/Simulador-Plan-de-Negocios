import React from 'react';
import { X, Eraser, Save } from 'lucide-react';

interface ConfirmClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  onSaveFirst: () => void;
  hasUnsavedData: boolean;
}

export const ConfirmClearModal: React.FC<ConfirmClearModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  onSaveFirst,
  hasUnsavedData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Eraser className="w-4 h-4 text-amber-400" />
            <span>Limpiar Campos de Información</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            ¿Deseas limpiar todos los campos del simulador para iniciar un <strong>nuevo proyecto en blanco</strong> desde el Paso 1?
          </p>

          {hasUnsavedData && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-900 dark:text-amber-200">
              Tienes datos diligenciados actualmente. Si deseas conservar esta simulación antes de limpiar los campos, puedes guardarla primero en tu lista de proyectos.
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            {hasUnsavedData && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSaveFirst();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Guardar Antes
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onConfirmClear();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" /> Sí, Limpiar Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
