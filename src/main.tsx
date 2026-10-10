import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Telecom Site Layout Studio runtime error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('TELECOM_CAD_AUTO_SAVE_v1');
      localStorage.removeItem('TELECOM_CAD_AUTO_SAVE_BACKUP_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070d19] text-slate-100 p-6 select-none">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Layout Workspace Recovery
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              An unexpected render issue occurred while loading the CAD layout workspace. You can reload or reset the session state to start fresh.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-slate-950 p-3 rounded text-rose-300 font-mono text-left overflow-x-auto max-h-28">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Reset Canvas Data
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Safely register PWA service worker with error suppression for sandboxed environments
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({ immediate: true });
  } catch (err) {
    console.warn('PWA service worker registration bypassed:', err);
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
