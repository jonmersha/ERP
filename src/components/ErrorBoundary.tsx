import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
          <div className="max-w-md w-full bg-[var(--color-surface)] rounded-3xl shadow-xl p-8 border border-red-100 text-center">
            <h2 className="text-2xl font-serif font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-[var(--color-text)]/60 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <pre className="text-xs bg-red-50 p-4 rounded-xl overflow-auto text-left mb-6 max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--color-main)] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
