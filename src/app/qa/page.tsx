// src/app/qa/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

interface Question {
  id: string;
  text: string;
  askerId: string;
  askerName: string;
  timestamp: any;
  votes: number;
  answered: boolean;
  answer?: string;
  answeredBy?: string;
  answeredAt?: any;
  category: string;
}

interface UserProfile {
  name: string;
  currentEventId?: string;
  isPanelist?: boolean;
}

const CATEGORIES = [
  'General', 'Technology', 'Business', 'Career', 'Networking', 'Product', 'Marketing', 'Other'
];

export default function QAPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isLoading, setIsLoading] = useState(true);
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadUserProfile();
    }
  }, [user, loading, router]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as UserProfile;
        setProfile(profileData);

        if (profileData.currentEventId) {
          loadQuestions(profileData.currentEventId);
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsLoading(false);
    }
  };

  const loadQuestions = (eventId: string) => {
    const questionsRef = collection(db, 'events', eventId, 'questions');
    const q = query(questionsRef, orderBy('votes', 'desc'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(questionsData);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !profile.currentEventId || !newQuestion.trim()) return;

    try {
      await addDoc(collection(db, 'events', profile.currentEventId, 'questions'), {
        text: newQuestion.trim(),
        askerId: user.uid,
        askerName: profile.name,
        timestamp: serverTimestamp(),
        votes: 0,
        answered: false,
        category: selectedCategory
      });

      setNewQuestion('');
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const voteQuestion = async (questionId: string, increment: boolean) => {
    if (!user) return;

    try {
      const questionRef = doc(db, 'events', profile?.currentEventId || '', 'questions', questionId);
      await updateDoc(questionRef, {
        votes: increment ? questions.find(q => q.id === questionId)?.votes + 1 : questions.find(q => q.id === questionId)?.votes - 1
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const answerQuestion = async (questionId: string) => {
    if (!user || !profile || !answerText.trim()) return;

    try {
      const questionRef = doc(db, 'events', profile.currentEventId || '', 'questions', questionId);
      await updateDoc(questionRef, {
        answered: true,
        answer: answerText.trim(),
        answeredBy: profile.name,
        answeredAt: serverTimestamp()
      });

      setAnsweringQuestion(null);
      setAnswerText('');
    } catch (error) {
      console.error('Error answering question:', error);
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Q&A Session</h1>
              <p className="text-gray-600">Ask questions and get answers from panelists</p>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ask Question Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ask a Question</h2>
              
              <form onSubmit={submitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What would you like to know?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newQuestion.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Question
                </button>
              </form>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Questions & Answers</h2>
              
              {questions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>No questions yet. Be the first to ask!</p>
                </div>
              ) : (
                questions.map((question) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {question.category}
                          </span>
                          {question.answered && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Answered
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">{question.text}</h3>
                        <p className="text-sm text-gray-600">
                          Asked by {question.askerName} • {question.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => voteQuestion(question.id, true)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                          {question.votes}
                        </span>
                        <button
                          onClick={() => voteQuestion(question.id, false)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Answer Section */}
                    {question.answered ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-green-900">Answer</h4>
                          <span className="text-sm text-green-700">
                            by {question.answeredBy} • {question.answeredAt?.toDate?.()?.toLocaleString() || 'Just now'}
                          </span>
                        </div>
                        <p className="text-green-800">{question.answer}</p>
                      </div>
                    ) : profile.isPanelist ? (
                      <div className="border-t pt-4">
                        {answeringQuestion === question.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Provide your answer..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => answerQuestion(question.id)}
                                disabled={!answerText.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Submit Answer
                              </button>
                              <button
                                onClick={() => {
                                  setAnsweringQuestion(null);
                                  setAnswerText('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAnsweringQuestion(question.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Answer Question
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        Waiting for panelist to answer...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
