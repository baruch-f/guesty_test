import React from 'react';
import { Button, Card } from '@guesty/shared/dist';

const UsersApp: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card title="Users Module">
        <p className="text-gray-600 mb-4">
          This is a remote micro-frontend for user management.
        </p>
        <Button>Add User</Button>
      </Card>
    </div>
  );
};

export default UsersApp;