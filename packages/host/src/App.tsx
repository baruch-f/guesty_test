import React, { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Home from './components/Home';
import Loading from './components/Loading';
import NotFound from './components/NotFound';
import { AsyncErrorBoundary, lazyWithRetry } from './components/AsyncErrorBoundary';

// Ленивая загрузка удалённых модулей
const UsersApp = lazyWithRetry(() => import('remoteUsers/UsersApp'));
const StatisticApp = lazyWithRetry(() => import('remoteStatistic/StatisticApp'));

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={
                <ErrorBoundary key={'users'}>
                  <Suspense fallback={<Loading />}>
                    <UsersApp />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="/statistics" element={
                <ErrorBoundary key={'statistics'}>
                  <Suspense fallback={<Loading />}>
                    <StatisticApp />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;