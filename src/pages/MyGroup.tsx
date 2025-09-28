import React from 'react';
import GroupCard from '../components/GroupCard';

const MyGroup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Group Page Placeholder
          </h1>
          <p className="text-xl text-gray-600">
            Manage your groups and collaborations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GroupCard 
            id="1"
            name="Study Group Alpha"
            description="Advanced AI concepts and machine learning discussions"
            memberCount={12}
          />
          <GroupCard 
            id="2"
            name="Project Beta"
            description="Collaborative development for the hackathon project"
            memberCount={8}
          />
          <GroupCard 
            id="3"
            name="Research Gamma"
            description="Exploring new technologies and frameworks"
            memberCount={15}
          />
        </div>
      </div>
    </div>
  );
};

export default MyGroup;
