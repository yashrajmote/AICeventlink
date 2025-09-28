"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  
  const features = [
    {
      title: 'Smart Check-In',
      description: 'Automatic check-in using QR codes or location-based detection. No hassle for organizers!',
      icon: '📱',
      href: '/checkin'
    },
    {
      title: 'AI-Powered Matching',
      description: 'Get matched with like-minded attendees based on your interests, skills, and goals.',
      icon: '🤖',
      href: '/mygroup'
    },
    {
      title: 'Dynamic Groups',
      description: 'Join groups freely and switch between them. No restrictions on networking!',
      icon: '👥',
      href: '/mygroup'
    },
    {
      title: 'Real-Time Chat',
      description: 'Communicate with your group members through our instant messaging system.',
      icon: '💬',
      href: '/chat'
    },
    {
      title: 'Q&A Sessions',
      description: 'Ask questions to panelists and vote on the most important ones.',
      icon: '❓',
      href: '/qa'
    },
    {
      title: 'Live Captions',
      description: 'Accessibility-first live captioning for all event sessions.',
      icon: '📝',
      href: '/captions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-indigo-600">AICeventlink</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The future of IRL events. AI-powered networking, seamless check-ins, and meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    href="/profile-setup"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Complete Profile
                  </Link>
                  <Link
                    href="/checkin"
                    className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-indigo-600"
                  >
                    Check In to Event
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-indigo-600"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Perfect Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From automatic check-ins to AI-powered networking, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, seamless, and smart event networking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete Your Profile</h3>
              <p className="text-gray-600">
                Tell us about your interests, skills, and goals to help us match you with the right people.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Check In Automatically</h3>
              <p className="text-gray-600">
                Scan a QR code or use location-based check-in. No waiting in lines!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Collaborate</h3>
              <p className="text-gray-600">
                Get matched with groups, chat in real-time, ask questions, and make meaningful connections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join the future of event networking. Create meaningful connections, not just contacts.
          </p>
          <Link
            href={user ? "/profile-setup" : "/login"}
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {user ? "Complete Your Profile" : "Start Your Journey"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
