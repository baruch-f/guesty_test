import { Button, Card } from '@guesty/shared/dist';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fullScreen?: boolean; // Новый prop для контроля layout
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
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Не перезагружаем всю страницу, просто сбрасываем состояние
  };

  isModuleLoadError(error: Error | null): boolean {
    if (!error) return false;
    const message = error.message || '';
    return (
      message.includes('Loading script failed') ||
      message.includes('Element type is invalid') ||
      message.includes('Lazy element type') ||
      message.includes('remoteEntry.js') ||
      message.includes('ChunkLoadError') ||
      error.name === 'ScriptExternalLoadError'
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isModuleError = this.isModuleLoadError(this.state.error);
      const wrapperClass = this.props.fullScreen 
        ? "min-h-screen flex items-center justify-center bg-gray-50 p-4"
        : "flex items-center justify-center p-4";

      return (
        <div className={wrapperClass}>
          <Card 
            title={isModuleError ? "⚠️ Remote Module Unavailable" : "Oops! Something went wrong"} 
            className="max-w-md"
          >
            {isModuleError ? (
              <>
                <p className="text-gray-700 mb-2 font-semibold">
                  Failed to load remote module
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  The remote service you're trying to access is currently unavailable. 
                  This could be because:
                </p>
                <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
                  <li>The remote service is not running</li>
                  <li>Network connectivity issues</li>
                  <li>The service is being deployed</li>
                </ul>
                <p className="text-xs text-gray-500 mb-4">
                  Error: {this.state.error?.message}
                </p>
                <div className="space-x-2">
                  <Button onClick={this.handleReset}>Try Again</Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => window.location.href = '/'}
                  >
                    Go Home
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Please try again. If the problem persists, contact support.
                </p>
                <div className="space-x-2">
                  <Button onClick={this.handleReset}>Try Again</Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => window.location.href = '/'}
                  >
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;