import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation('host');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {t('header.brand_name')}
          </Link>
          <nav className="flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('header.nav.home')}
            </Link>
            <Link to="/users" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('header.nav.users')}
            </Link>
            <Link to="/statistics" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('header.nav.statistics')}
            </Link>
          </nav>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-3 py-1 rounded transition-colors ${
              i18n.language === 'en' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('ru')}
            className={`px-3 py-1 rounded transition-colors ${
              i18n.language === 'ru' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => changeLanguage('he')}
            className={`px-3 py-1 rounded transition-colors ${
              i18n.language === 'he' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            HE
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;