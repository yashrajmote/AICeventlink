// src/app/profile-setup/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface UserProfile {
  name: string;
  bio: string;
  interests: string[];
  skills: string[];
  goals: string[];
  networkingPreference: 'casual' | 'professional' | 'both';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
}

const INTEREST_OPTIONS = [
  'Technology', 'AI/ML', 'Web Development', 'Mobile Development', 'Data Science',
  'Design', 'Marketing', 'Business', 'Finance', 'Healthcare', 'Education',
  'Gaming', 'Music', 'Art', 'Sports', 'Travel', 'Food', 'Environment',
  'Social Impact', 'Entrepreneurship', 'Research'
];

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++',
  'UI/UX Design', 'Graphic Design', 'Project Management', 'Data Analysis',
  'Machine Learning', 'Cloud Computing', 'DevOps', 'Mobile Development',
  'Web Design', 'Marketing', 'Sales', 'Leadership', 'Public Speaking'
];

const GOAL_OPTIONS = [
  'Find a co-founder', 'Learn new skills', 'Find a job', 'Hire talent',
  'Build a project', 'Get mentorship', 'Give mentorship', 'Network',
  'Find investors', 'Collaborate on ideas', 'Share knowledge'
];

export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    bio: '',
    interests: [],
    skills: [],
    goals: [],
    networkingPreference: 'both',
    experienceLevel: 'intermediate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  // This effect handles redirection and loads existing profile
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadExistingProfile();
    }
  }, [user, loading, router]);

  const loadExistingProfile = async () => {
    if (!user) return;
    
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data() as UserProfile;
        setProfile(data);
        setProfileExists(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create user profile with new schema
      const userProfile = {
        uid: user.uid,
        name: profile.name,
        email: user.email,
        interests: profile.interests,
        isMentor: false, // Will be determined later
        groupId: null, // Will be assigned by matching algorithm
        expLevel: profile.interests.map((interest, index) => {
          // Map experience level to 1-10 scale
          const levelMap = { 'beginner': 3, 'intermediate': 6, 'expert': 9 };
          return levelMap[profile.experienceLevel] || 5;
        }),
        groupSize: 0, // Will be set when group is formed
        bio: profile.bio,
        skills: profile.skills,
        goals: profile.goals,
        networkingPreference: profile.networkingPreference,
        experienceLevel: profile.experienceLevel,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'profiles', user.uid), userProfile);
      
      // Trigger matching algorithm
      await triggerMatching();
      
      router.push('/mygroup');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerMatching = async () => {
    try {
      // This would typically be a cloud function
      // For now, we'll create a simple matching document
      await setDoc(doc(db, 'matching_queue', user?.uid || 'temp'), {
        userId: user?.uid,
        timestamp: new Date(),
        status: 'pending'
      });
    } catch (error) {
      console.error('Error triggering matching:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profileExists ? 'Update Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              Help us match you with the right people at events
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Networking Preference
                  </label>
                  <select
                    value={profile.networkingPreference}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      networkingPreference: e.target.value as 'casual' | 'professional' | 'both' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={profile.experienceLevel}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      experienceLevel: e.target.value as 'beginner' | 'intermediate' | 'expert' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Interests</h2>
              <p className="text-sm text-gray-600">Select topics you're interested in</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      profile.interests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
              <p className="text-sm text-gray-600">Select your skills and expertise</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      profile.skills.includes(skill)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Event Goals</h2>
              <p className="text-sm text-gray-600">What do you hope to achieve at events?</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      profile.goals.includes(goal)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !profile.name.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (profileExists ? 'Update Profile' : 'Complete Setup')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
