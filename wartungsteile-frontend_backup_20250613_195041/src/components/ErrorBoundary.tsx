// src/components/ErrorBoundary.tsx - VOLLSTÄNDIG KORRIGIERTE VERSION
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-xl font-bold text-red-600 mb-4">
                Etwas ist schiefgelaufen
              </h1>
              
              <p className="text-gray-600 mb-6">
                Beim Laden der Seite ist ein Fehler aufgetreten. Das liegt möglicherweise an:
              </p>
              
              <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Backend-Verbindungsproblemen</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>API-Proxy-Konfiguration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Temporären Netzwerkfehlern</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Seite neu laden</span>
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Fehler ignorieren
                </button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Debug-Informationen anzeigen
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 overflow-auto max-h-40">
                    <div className="mb-2 font-bold">Error:</div>
                    <div className="mb-4">{this.state.error.message}</div>
                    <div className="mb-2 font-bold">Stack:</div>
                    <div>{this.state.error.stack}</div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;