// src/app/captions/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

interface Caption {
  id: string;
  text: string;
  timestamp: any;
  confidence: number;
  speaker?: string;
}

interface UserProfile {
  name: string;
  currentEventId?: string;
}

export default function CaptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const captionsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadUserProfile();
      initializeSpeechRecognition();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (captionsEndRef.current) {
      captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [captions]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as UserProfile;
        setProfile(profileData);

        if (profileData.currentEventId) {
          loadCaptions(profileData.currentEventId);
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsLoading(false);
    }
  };

  const loadCaptions = (eventId: string) => {
    const captionsRef = collection(db, 'events', eventId, 'captions');
    const q = query(captionsRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const captionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Caption[];
      setCaptions(captionsData);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && profile?.currentEventId) {
        addCaption(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognition);
  };

  const addCaption = async (text: string) => {
    if (!profile?.currentEventId) return;

    try {
      await addDoc(collection(db, 'events', profile.currentEventId, 'captions'), {
        text: text.trim(),
        timestamp: serverTimestamp(),
        confidence: 0.9, // Mock confidence score
        speaker: profile.name
      });
    } catch (error) {
      console.error('Error adding caption:', error);
    }
  };

  const startListening = () => {
    if (!recognition) return;

    try {
      recognition.start();
      setIsListening(true);
      setError('');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (!recognition) return;

    try {
      recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  const handleLogout = async () => {
    if (isListening) {
      stopListening();
    }
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

  if (!profile.currentEventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Event</h1>
          <p className="text-gray-600 mb-6">You need to check into an event to access live captions.</p>
          <button
            onClick={() => router.push('/checkin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Check In to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Captions</h1>
              <p className="text-gray-600">Real-time speech-to-text for accessibility</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/mygroup')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back to Groups
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Speech Recognition</h2>
              <p className="text-gray-600">
                {isListening ? 'Listening for speech...' : 'Click start to begin live captioning'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isListening ? (
                <button
                  onClick={stopListening}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  Stop Listening
                </button>
              ) : (
                <button
                  onClick={startListening}
                  disabled={!recognition}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start Listening
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Captions Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Captions</h2>
          
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-lg leading-relaxed min-h-[400px] max-h-[600px] overflow-y-auto">
            {captions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No captions yet. Start listening to begin!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {captions.map((caption, index) => (
                  <div key={caption.id} className="flex items-start gap-3">
                    <span className="text-gray-500 text-sm mt-1 min-w-[3rem]">
                      {caption.timestamp?.toDate?.()?.toLocaleTimeString() || `${index + 1}:00`}
                    </span>
                    <span className="flex-1">
                      {caption.speaker && (
                        <span className="text-blue-400 font-semibold mr-2">
                          {caption.speaker}:
                        </span>
                      )}
                      {caption.text}
                    </span>
                  </div>
                ))}
                <div ref={captionsEndRef} />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <p>Captions are generated in real-time and may contain errors</p>
            <p>{captions.length} captions generated</p>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Accessibility Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Visual Features:</h4>
              <ul className="space-y-1">
                <li>• High contrast green-on-black display</li>
                <li>• Large, readable font</li>
                <li>• Timestamped captions</li>
                <li>• Speaker identification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Audio Features:</h4>
              <ul className="space-y-1">
                <li>• Real-time speech recognition</li>
                <li>• Continuous listening mode</li>
                <li>• Error handling and recovery</li>
                <li>• Cross-platform compatibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
