import { Button } from '@guesty/shared/dist';
import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            Guesty App
          </Link>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant={isActive('/') ? 'primary' : 'secondary'}>
                Home
              </Button>
            </Link>
            <Link to="/users">
              <Button variant={isActive('/users') ? 'primary' : 'secondary'}>
                Users
              </Button>
            </Link>
            <Link to="/statistics">
              <Button variant={isActive('/statistics') ? 'primary' : 'secondary'}>
                Statistics
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;