import React from 'react';

interface GroupCardProps {
  id?: string;
  name?: string;
  description?: string;
  memberCount?: number;
  // Add more props as needed
}

const GroupCard: React.FC<GroupCardProps> = ({ 
  id = "1",
  name = "Sample Group",
  description = "This is a placeholder group description",
  memberCount = 0
}) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <span className="text-sm text-gray-500">#{id}</span>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {memberCount} members
          </span>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Join Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
