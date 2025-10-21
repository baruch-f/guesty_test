import { Button, Card, LoadingSpinner } from '@guesty/shared/dist';
import React from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { useRemoteTranslations } from 'host/useRemoteTranslations';

const UsersApp: React.FC = () => {
  const { t } = useTranslation('remote-users');
  const loaded = useRemoteTranslations('remote-users');

  if (!loaded) {
    return <LoadingSpinner message="Loading translations..." />;
  }

  return (
    <div className="space-y-6">
      <Card title={t('users.page_title')}>
        <p className="text-gray-600 mb-4">
          {t('users.page_description')}
        </p>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{t('users.demo_user_name')}</h3>
            <p className="text-sm text-gray-500">{t('users.demo_user_email')}</p>
            <p className="text-sm text-gray-500">{t('users.demo_user_role')}</p>
          </div>
          
          <Button variant="secondary">
            {t('users.add_user_button')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UsersApp;