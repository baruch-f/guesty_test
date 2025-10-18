import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button, Card } from '@guesty/shared/dist';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card title="404 - Page Not Found" className="max-w-md">
        <p className="text-gray-600 mb-4">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;