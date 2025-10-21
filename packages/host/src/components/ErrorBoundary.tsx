import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null; onReset: () => void }> = ({ error, onReset }) => {
  const { t } = useTranslation('host');

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4 p-8 bg-red-50 rounded-lg max-w-2xl">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-red-800">{t('error_boundary.title')}</h2>
        <p className="text-red-600">{t('error_boundary.description')}</p>
        {error && (
          <pre className="text-left text-sm bg-red-100 p-4 rounded overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            {t('error_boundary.retry_button')}
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {t('error_boundary.home_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;