import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AIspire Uncaught UI Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocalState = () => {
    try {
      // Clear potentially corrupted navigation or cached state
      localStorage.removeItem('aispire_user_profile');
      localStorage.removeItem('aispire_test_answers');
      localStorage.removeItem('aispire_question_idx');
    } catch {
      // ignore
    }
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#2B2118] text-[#FAF7F2]">
          <div className="w-full max-w-lg bg-[#231A12] border border-[#6B523E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAF7F2]">
                Something interrupted your session
              </h1>
              <p className="text-xs sm:text-sm text-[#E2D5C3] leading-relaxed">
                AIspire encountered an unexpected display state. Your assessment progress and profile remain safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3.5 bg-[#2B2118] rounded-xl border border-[#6B523E] text-left text-xs font-mono text-[#D8C7B0] overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] font-semibold text-xs rounded-xl shadow-md transition cursor-pointer border border-[#C9B79C]/40 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-[#C9B79C]" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetLocalState}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2B2118] hover:bg-[#382B20] text-[#E2D5C3] hover:text-[#FAF7F2] font-semibold text-xs rounded-xl transition cursor-pointer border border-[#6B523E] flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 text-[#C9B79C]" />
                <span>Reset to Start</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

