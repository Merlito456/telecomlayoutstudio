/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ToastMessage } from '../types/cad';
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let border = 'border-sky-500/40 bg-slate-900/95 text-sky-200';
        let Icon = Info;
        if (toast.type === 'success') {
          border = 'border-emerald-500/40 bg-slate-900/95 text-emerald-200';
          Icon = CheckCircle;
        } else if (toast.type === 'error') {
          border = 'border-rose-500/40 bg-slate-900/95 text-rose-200';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          border = 'border-amber-500/40 bg-slate-900/95 text-amber-200';
          Icon = TriangleAlert;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${border}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
              <div className="text-xs opacity-90 leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
