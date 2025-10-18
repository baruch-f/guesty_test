import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Card } from '@guesty/shared/dist';

const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card title="Welcome to Guesty">
        <p className="text-gray-600 mb-4">
          This is a Module Federation micro-frontend demo with shared UI components.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <strong>Architecture:</strong> Webpack Module Federation
          </p>
          <p className="text-sm text-gray-500">
            <strong>Deployment:</strong> AWS S3 + CloudFront CDN
          </p>
          <p className="text-sm text-gray-500">
            <strong>UI Kit:</strong> Shared components with Tailwind CSS
          </p>
        </div>
      </Card>
      
      <Card title="Features">
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Shared React instance across all micro-frontends</li>
          <li>Common UI kit with Tailwind CSS</li>
          <li>TypeScript support with strict mode</li>
          <li>Lazy loading of remote modules</li>
          <li>Error boundaries for resilience</li>
          <li>Development/Production environment switching</li>
        </ul>
      </Card>

      <Card title="Quick Start">
        <div className="space-y-3">
          <p className="text-gray-600">Navigate to different modules:</p>
          <div className="flex gap-3">
            <Link to="/users">
              <Button>View Users Module</Button>
            </Link>
            <Link to="/statistics">
              <Button>View Statistics Module</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;