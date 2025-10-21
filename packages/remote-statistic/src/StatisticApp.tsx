import { Card, LoadingSpinner } from '@guesty/shared/dist';
import React from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { useRemoteTranslations } from 'host/useRemoteTranslations';

const StatisticApp: React.FC = () => {
  const { t } = useTranslation('remote-statistic');
  const loaded = useRemoteTranslations('remote-statistic');

  if (!loaded) {
    return <LoadingSpinner message="Loading translations..." />;
  }

  return (
    <div className="space-y-6">
      <Card title={t('statistics.page_title')}>
        <p className="text-gray-600 mb-4">
          {t('statistics.page_description')}
        </p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">1,234</div>
            <div className="text-sm text-gray-600 mt-2">{t('statistics.metric_total_users')}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">567</div>
            <div className="text-sm text-gray-600 mt-2">{t('statistics.metric_active_sessions')}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-gray-600 mt-2">{t('statistics.metric_uptime')}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatisticApp;