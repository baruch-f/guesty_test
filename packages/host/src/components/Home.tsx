import { Button, Card } from '@guesty/shared/dist';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { t } = useTranslation('host');

  return (
    <div className="space-y-6">
      <Card title={t('home.welcome.title')}>
        <p className="text-gray-600 mb-4">
          {t('home.welcome.description')}
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <strong>{t('home.welcome.architecture_label')}:</strong> {t('home.welcome.architecture_value')}
          </p>
          <p className="text-sm text-gray-500">
            <strong>{t('home.welcome.deployment_label')}:</strong> {t('home.welcome.deployment_value')}
          </p>
          <p className="text-sm text-gray-500">
            <strong>{t('home.welcome.ui_kit_label')}:</strong> {t('home.welcome.ui_kit_value')}
          </p>
        </div>
      </Card>
      
      <Card title={t('home.features.title')}>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>{t('home.features.shared_react')}</li>
          <li>{t('home.features.ui_kit')}</li>
          <li>{t('home.features.typescript')}</li>
          <li>{t('home.features.lazy_loading')}</li>
          <li>{t('home.features.error_boundaries')}</li>
          <li>{t('home.features.env_switching')}</li>
        </ul>
      </Card>

      <Card title={t('home.quick_start.title')}>
        <div className="space-y-3">
          <p className="text-gray-600">{t('home.quick_start.navigate_prompt')}</p>
          <div className="flex gap-3">
            <Link to="/users">
              <Button>{t('home.quick_start.view_users_button')}</Button>
            </Link>
            <Link to="/statistics">
              <Button>{t('home.quick_start.view_statistics_button')}</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;