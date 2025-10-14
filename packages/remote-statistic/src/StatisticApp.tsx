import React from 'react';
import { Button, Card } from '@guesty/shared/dist';

const StatisticApp: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card title="Statistics Module">
        <p className="text-gray-600 mb-4">
          This is a remote micro-frontend for statistics and analytics.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">1,234</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">567</div>
            <div className="text-sm text-gray-500">Active Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>
        <Button>Refresh Stats</Button>
      </Card>
    </div>
  );
};

export default StatisticApp;