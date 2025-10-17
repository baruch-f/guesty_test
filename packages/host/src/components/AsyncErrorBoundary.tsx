import React, { ComponentType, lazy, useEffect, useState } from 'react';

interface RetryOptions {
  retries?: number;
  interval?: number;
}

export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: RetryOptions = {}
): React.LazyExoticComponent<T> {
  const { retries = 3, interval = 1000 } = options;

  const retry = (fn: () => Promise<any>, retriesLeft: number): Promise<any> => {
    return fn().catch((error) => {
      if (retriesLeft === 0) {
        // Когда все попытки исчерпаны, возвращаем компонент с ошибкой
        console.error('Failed to load remote module after retries:', error);
        throw error; // Бросаем ошибку, чтобы её поймал ErrorBoundary
      }
      console.log(`Retrying... (${retriesLeft} attempts left)`);
      return new Promise((resolve) => 
        setTimeout(() => resolve(retry(fn, retriesLeft - 1)), interval)
      );
    });
  };

  return lazy(() => retry(importFn, retries));
}

export function AsyncErrorBoundary({ 
  children, 
  moduleName 
}: { 
  children: React.ReactNode; 
  moduleName: string;
}) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || '';
      const errorName = event.reason?.name || '';
      
      // Ловим ошибки загрузки Module Federation
      if (
        errorMessage.includes('Loading script failed') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('remoteEntry.js') ||
        errorName === 'ScriptExternalLoadError' ||
        errorMessage.includes('ChunkLoadError')
      ) {
        event.preventDefault();
        console.log(`AsyncErrorBoundary caught loading error for ${moduleName}`);
        setError(new Error(`Failed to load ${moduleName} module. The remote service may be unavailable.`));
      }
    };

    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, [moduleName]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ Module Load Error
          </h2>
          <p className="text-gray-700 mb-2 font-semibold">{moduleName} module unavailable</p>
          <p className="text-gray-600 text-sm mb-4">{error.message}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}