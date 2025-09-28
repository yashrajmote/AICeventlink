// src/app/checkin/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  qrCode: string;
  isActive: boolean;
}

interface CheckInData {
  userId: string;
  eventId: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  method: 'qr' | 'location' | 'manual';
}

export default function CheckInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInMethod, setCheckInMethod] = useState<'qr' | 'location' | 'manual'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadActiveEvents();
      getCurrentLocation();
    }
  }, [user, loading, router]);

  const loadActiveEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleQRCodeScan = () => {
    // In a real implementation, you would use a QR code scanner library
    // For demo purposes, we'll simulate it
    const scannedCode = prompt('Enter QR Code (for demo):');
    if (scannedCode) {
      setQrCode(scannedCode);
      const event = events.find(e => e.qrCode === scannedCode);
      if (event) {
        setSelectedEvent(event);
        setCheckInMethod('qr');
      } else {
        setError('Invalid QR code. Please try again.');
      }
    }
  };

  const handleLocationCheckIn = async () => {
    if (!location || !selectedEvent) return;

    // Check if user is within event location radius (simplified)
    // In a real implementation, you'd check against the event's actual location
    const isWithinRadius = true; // Simplified for demo
    
    if (!isWithinRadius) {
      setError('You are not at the event location. Please move closer.');
      return;
    }

    await performCheckIn('location');
  };

  const handleManualCheckIn = async () => {
    if (!selectedEvent) return;
    await performCheckIn('manual');
  };

  const performCheckIn = async (method: 'qr' | 'location' | 'manual') => {
    if (!user || !selectedEvent) return;

    setIsCheckingIn(true);
    setError('');

    try {
      const checkInData: CheckInData = {
        userId: user.uid,
        eventId: selectedEvent.id,
        timestamp: new Date(),
        method,
        ...(method === 'location' && location && { location })
      };

      // Save check-in data
      await setDoc(doc(db, 'checkins', `${user.uid}_${selectedEvent.id}`), checkInData);

      // Update user's current event
      await setDoc(doc(db, 'users', user.uid), {
        currentEventId: selectedEvent.id,
        lastCheckIn: new Date()
      }, { merge: true });

      // Trigger matching algorithm
      await triggerMatching(user.uid, selectedEvent.id);

      alert('Successfully checked in! You will be matched with other attendees shortly.');
      router.push('/mygroup');
    } catch (error) {
      console.error('Error checking in:', error);
      setError('Failed to check in. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const triggerMatching = async (userId: string, eventId: string) => {
    try {
      // This would typically call a cloud function or API endpoint
      // For now, we'll create a simple matching document
      await setDoc(doc(db, 'matching_queue', `${eventId}_${userId}`), {
        userId,
        eventId,
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Check-In</h1>
            <p className="text-gray-600">
              Choose your preferred check-in method
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Event Selection */}
          {!selectedEvent && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Event</h2>
              <div className="space-y-4">
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      📍 {event.location} • 📅 {event.date} at {event.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-in Methods */}
          {selectedEvent && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Check in to: {selectedEvent.name}
                </h2>
                <p className="text-gray-600">{selectedEvent.location}</p>
              </div>

              {/* QR Code Check-in */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">QR Code Scan</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Scan the QR code at the event entrance
                  </p>
                  <button
                    onClick={handleQRCodeScan}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Scan QR Code
                  </button>
                </div>
              </div>

              {/* Location-based Check-in */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location Check-in</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Automatically detect your location
                  </p>
                  <button
                    onClick={handleLocationCheckIn}
                    disabled={!location || isCheckingIn}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {location ? 'Check In with Location' : 'Getting Location...'}
                  </button>
                </div>
              </div>

              {/* Manual Check-in */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Manual Check-in</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Check in manually (requires organizer approval)
                  </p>
                  <button
                    onClick={handleManualCheckIn}
                    disabled={isCheckingIn}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Manual Check-in
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back to Events
                </button>
              </div>
            </div>
          )}

          {isCheckingIn && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking you in...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
