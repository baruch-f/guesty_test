import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Card } from '@guesty/shared';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Guesty App</h1>
              <div className="flex gap-4">
                <Link to="/">
                  <Button variant="secondary">Home</Button>
                </Link>
                <Link to="/users">
                  <Button variant="secondary">Users</Button>
                </Link>
                <Link to="/statistics">
                  <Button variant="secondary">Statistics</Button>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<div>Users Remote (coming soon)</div>} />
            <Route path="/statistics" element={<div>Statistics Remote (coming soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card title="Welcome to Guesty">
        <p className="text-gray-600 mb-4">
          This is a Module Federation micro-frontend demo with shared UI components.
        </p>
        <Button onClick={() => alert('Button clicked!')}>
          Test Shared Button
        </Button>
      </Card>
      
      <Card title="Features">
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Shared React instance across all micro-frontends</li>
          <li>Common UI kit with Tailwind CSS</li>
          <li>TypeScript support</li>
          <li>i18n integration (coming soon)</li>
        </ul>
      </Card>
    </div>
  );
};

export default App;