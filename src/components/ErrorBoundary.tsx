import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-rose-500/5 animate-pulse">
            ⚠️
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-rose-400">ប្រព័ន្ធមានបញ្ហាបច្ចេកទេស!</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
              An unexpected runtime error occurred, causing a temporary white screen. The error has been intercepted successfully.
            </p>
          </div>

          <div className="w-full text-left bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs overflow-x-auto space-y-3 shadow-inner">
            <div className="text-rose-400 font-bold border-b border-slate-800 pb-2">
              Error Message:
            </div>
            <div className="text-slate-300 break-words whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>
            {this.state.errorInfo && (
              <>
                <div className="text-amber-400 font-bold border-b border-slate-800 pt-2 pb-2">
                  Component Stack Trace:
                </div>
                <div className="text-slate-400 break-words whitespace-pre-wrap max-h-48 overflow-y-auto text-[10px]">
                  {this.state.errorInfo.componentStack}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition duration-150 cursor-pointer shadow-md"
            >
              🔄 Refresh Page
            </button>
            <button
              onClick={this.handleReset}
              className="flex-1 px-5 py-3 bg-slate-850 hover:bg-rose-950 hover:text-rose-400 text-slate-300 font-extrabold rounded-xl text-xs transition duration-150 border border-slate-800 hover:border-rose-900 cursor-pointer"
              title="This will clear your local storage to resolve any corrupt cache."
            >
              🧹 Clear Cache & Reset App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
