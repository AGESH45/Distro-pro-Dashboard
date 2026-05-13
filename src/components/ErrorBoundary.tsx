import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  handleReset = () => {
    // Clear any stale auth data that might be causing the crash
    try {
      localStorage.removeItem('artistdirect-auth');
      // Also clear any supabase auth keys
      Object.keys(localStorage).forEach((key) => {
        if (key.includes('supabase') || key.includes('artistdirect')) {
          localStorage.removeItem(key);
        }
      });
    } catch (_) { /* ignore */ }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl">
            <h1 className="text-2xl font-black text-white">Something went wrong</h1>
            <p className="mt-3 text-sm text-white/60">
              The app encountered an error. This is often caused by stale session data.
            </p>
            {this.state.error && (
              <pre className="mt-4 rounded-2xl bg-black/30 p-4 text-xs text-red-200 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-4 font-black text-white shadow-lg"
            >
              Clear session &amp; reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
