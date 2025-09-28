// Firebase Setup Instructions and Demo Event Creation
// Run this in your browser console after setting up Firebase

const createDemoEvent = async () => {
  // Import Firebase functions
  const { db } = await import('./src/lib/firebase');
  const { addDoc, collection } = await import('firebase/firestore');
  
  const eventData = {
    name: 'Tech Innovation Summit 2024',
    description: 'A comprehensive tech conference featuring AI, web development, and startup discussions',
    location: 'San Francisco Convention Center',
    date: '2024-12-15',
    time: '09:00',
    qrCode: 'TECH_SUMMIT_2024',
    isActive: true,
    attendeeCount: 0,
    createdAt: new Date()
  };
  
  try {
    const docRef = await addDoc(collection(db, 'events'), eventData);
    console.log('✅ Demo event created with ID:', docRef.id);
    console.log('Event QR Code:', eventData.qrCode);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating demo event:', error);
  }
};

// Instructions for Firebase Setup:
console.log(`
🚀 FIREBASE SETUP INSTRUCTIONS:

1. Go to https://console.firebase.google.com/
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
5. Update src/lib/firebase.ts with your config
6. Run createDemoEvent() in console to create demo event

📱 DEMO FLOW:
1. Sign up/Sign in with any email + password (6+ chars)
2. Complete profile setup
3. Check in using QR code: TECH_SUMMIT_2024
4. Get matched with groups
5. Chat, ask questions, use captions!

🎯 Ready to demo? Run: createDemoEvent()
`);

// Uncomment the line below to automatically create demo event
// createDemoEvent();
