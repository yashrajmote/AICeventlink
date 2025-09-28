import React from 'react';
import ProfileForm from '../components/ProfileForm';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Profile Page Placeholder
          </h1>
          <p className="text-xl text-gray-600">
            Manage your profile information
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
