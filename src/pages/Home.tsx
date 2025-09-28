import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Home Page Placeholder
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to AICeventlink - Your AI-powered event management platform
          </p>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700">
              This is a placeholder for the home page. The actual content will be implemented during the hackathon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
