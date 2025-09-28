"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface GroupMember {
  uid: string;
  name: string;
  email: string;
  bio: string;
  interests: string[];
  skills: string[];
  goals: string[];
  isMentor: boolean;
  expLevel: number[];
  groupSize: number;
  joinedAt: Date;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  mentors: GroupMember[];
  maxMembers: number;
  interests: string[];
  goals: string[];
  groupSize: number;
  createdAt: Date;
  isActive: boolean;
}

interface UserProfile {
  uid: string;
  name: string;
  bio: string;
  interests: string[];
  skills: string[];
  goals: string[];
  isMentor: boolean;
  groupId: string | null;
  expLevel: number[];
  groupSize: number;
  currentEventId?: string;
  currentGroupId?: string;
}

const MyGroup: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadUserData();
    }
  }, [user, loading, router]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as UserProfile;
        setProfile(profileData);

        // Load current group if user is in one
        if (profileData.groupId) {
          const groupDoc = await getDoc(doc(db, 'groups', profileData.groupId));
          if (groupDoc.exists()) {
            const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
            setCurrentGroup(groupData);
          }
        }

        // Load available groups for the current event
        if (profileData.currentEventId) {
          await loadAvailableGroups(profileData.currentEventId);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableGroups = async (eventId: string) => {
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('eventId', '==', eventId), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      const groups = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      
      setAvailableGroups(groups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const createGroup = async () => {
    if (!user || !profile || !newGroupName.trim()) return;

    setIsCreatingGroup(true);
    try {
      const groupData = {
        name: newGroupName,
        description: newGroupDescription,
        eventId: profile.currentEventId,
        members: [{
          userId: user.uid,
          name: profile.name,
          email: user.email,
          bio: profile.bio,
          interests: profile.interests,
          skills: profile.skills,
          goals: profile.goals,
          joinedAt: new Date()
        }],
        maxMembers: 8,
        interests: profile.interests,
        goals: profile.goals,
        createdAt: new Date(),
        isActive: true
      };

      const groupRef = await addDoc(collection(db, 'groups'), groupData);
      
      // Update user's current group
      await updateDoc(doc(db, 'profiles', user.uid), {
        currentGroupId: groupRef.id
      });

      // Update group state
      setCurrentGroup({ id: groupRef.id, ...groupData });
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupDescription('');
      
      // Refresh available groups
      if (profile.currentEventId) {
        await loadAvailableGroups(profile.currentEventId);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const joinGroup = async (group: Group) => {
    if (!user || !profile) return;

    try {
      const memberData = {
        uid: user.uid,
        name: profile.name,
        email: user.email,
        bio: profile.bio,
        interests: profile.interests,
        skills: profile.skills,
        goals: profile.goals,
        isMentor: profile.isMentor,
        expLevel: profile.expLevel,
        groupSize: profile.groupSize,
        joinedAt: new Date()
      };

      // Add user to group
      await updateDoc(doc(db, 'groups', group.id), {
        members: arrayUnion(memberData)
      });

      // Update user's current group
      await updateDoc(doc(db, 'profiles', user.uid), {
        currentGroupId: group.id
      });

      // Update state
      setCurrentGroup({ ...group, members: [...group.members, memberData] });
      
      // Refresh available groups
      if (profile.currentEventId) {
        await loadAvailableGroups(profile.currentEventId);
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const leaveGroup = async () => {
    if (!user || !currentGroup) return;

    try {
      // Remove user from group
      const memberToRemove = currentGroup.members.find(m => m.userId === user.uid);
      if (memberToRemove) {
        await updateDoc(doc(db, 'groups', currentGroup.id), {
          members: arrayRemove(memberToRemove)
        });
      }

      // Update user's current group
      await updateDoc(doc(db, 'profiles', user.uid), {
        currentGroupId: null
      });

      // Update state
      setCurrentGroup(null);
      
      // Refresh available groups
      if (profile?.currentEventId) {
        await loadAvailableGroups(profile.currentEventId);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
              <p className="text-gray-600">Connect and collaborate with fellow attendees</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Group */}
        {currentGroup ? (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentGroup.name}</h2>
                  <p className="text-gray-600">{currentGroup.description}</p>
                </div>
                <button
                  onClick={leaveGroup}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Leave Group
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Group Members ({currentGroup.members.length}/{currentGroup.maxMembers})</h3>
                
                {/* Mentors Section */}
                {currentGroup.mentors && currentGroup.mentors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-purple-900 mb-3">👑 Mentors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentGroup.mentors.map((mentor) => (
                        <div key={mentor.uid} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-purple-900">{mentor.name}</h5>
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                              Mentor
                            </span>
                          </div>
                          <p className="text-sm text-purple-700 mb-2">{mentor.bio}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {mentor.interests.slice(0, 3).map(interest => (
                              <span key={interest} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {interest}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-purple-600">
                            Expertise Level: {Math.max(...mentor.expLevel)}/10
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Members */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentGroup.members
                    .filter(member => !currentGroup.mentors?.some(mentor => mentor.uid === member.uid))
                    .map((member) => (
                    <div key={member.uid} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{member.bio}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {member.interests.slice(0, 3).map(interest => (
                          <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Expertise: {Math.max(...member.expLevel)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/chat')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open Group Chat
                </button>
                <button
                  onClick={() => router.push('/notes')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Shared Notes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">You're not in a group yet</h2>
              <p className="text-gray-600 mb-4">Join an existing group or create your own to start collaborating</p>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create New Group
              </button>
            </div>
          </div>
        )}

        {/* Available Groups */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGroups
              .filter(group => !currentGroup || group.id !== currentGroup.id)
              .map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Members: {group.members.length}/{group.maxMembers}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {group.interests.slice(0, 3).map(interest => (
                        <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => joinGroup(group)}
                    disabled={group.members.length >= group.maxMembers}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {group.members.length >= group.maxMembers ? 'Group Full' : 'Join Group'}
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Group</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your group's purpose"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGroup;
