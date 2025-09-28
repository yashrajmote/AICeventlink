# 🔧 Firebase Security Rules Setup

## **Issue**: Missing or insufficient permissions

This error occurs because Firestore security rules are blocking database operations. Here's how to fix it:

## **Solution 1: Set Up Firestore Security Rules (Recommended for Development)**

### **Step 1: Go to Firebase Console**
1. Open https://console.firebase.google.com/
2. Select your project
3. Go to **Firestore Database** → **Rules**

### **Step 2: Replace Rules with Development-Friendly Rules**
Replace the existing rules with these (for development/testing only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Step 3: Publish Rules**
Click **"Publish"** to save the rules.

## **Solution 2: Alternative Rules (More Secure)**

If you want more specific rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles collection - users can read/write their own profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Groups collection - authenticated users can read/write
    match /groups/{groupId} {
      allow read, write: if request.auth != null;
    }
    
    // Events collection - authenticated users can read/write
    match /events/{eventId} {
      allow read, write: if request.auth != null;
    }
    
    // Messages subcollection - authenticated users can read/write
    match /groups/{groupId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Questions subcollection - authenticated users can read/write
    match /events/{eventId}/questions/{questionId} {
      allow read, write: if request.auth != null;
    }
    
    // Captions subcollection - authenticated users can read/write
    match /events/{eventId}/captions/{captionId} {
      allow read, write: if request.auth != null;
    }
    
    // Matching queue - authenticated users can read/write
    match /matching_queue/{queueId} {
      allow read, write: if request.auth != null;
    }
    
    // Checkins collection - authenticated users can read/write
    match /checkins/{checkinId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## **Solution 3: Test Mode (Quick Fix)**

### **Enable Test Mode:**
1. Go to **Firestore Database** → **Rules**
2. Click **"Start in test mode"**
3. This allows read/write access for 30 days

## **Step-by-Step Instructions:**

### **1. Access Firebase Console**
- Go to https://console.firebase.google.com/
- Select your project: `eventlinkapp-d198a`

### **2. Navigate to Firestore Rules**
- Click **"Firestore Database"** in left sidebar
- Click **"Rules"** tab

### **3. Update Rules**
- Replace existing rules with Solution 1 rules (for development)
- Click **"Publish"**

### **4. Test Your App**
- Go back to your app
- Try creating a profile again
- The error should be resolved

## **Verification Steps:**

### **Check Authentication:**
1. Make sure user is logged in
2. Check browser console for auth status
3. Verify Firebase config is correct

### **Test Database Access:**
1. Try creating a profile
2. Check Firestore console for new documents
3. Verify data is being saved

## **Common Issues:**

### **1. Authentication Not Working:**
- Check if user is actually logged in
- Verify Firebase Auth is enabled
- Check browser console for auth errors

### **2. Wrong Project:**
- Make sure you're using the correct Firebase project
- Verify project ID in `src/lib/firebase.ts`

### **3. Rules Not Published:**
- Make sure to click "Publish" after updating rules
- Wait a few minutes for rules to propagate

## **Production Considerations:**

For production, you'll want more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow users to access their own data
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Groups - only members can access
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        resource.data.members[request.auth.uid] != null;
    }
  }
}
```

## **Quick Test:**

After updating rules, test with this in browser console:

```javascript
// Test database access
import { db } from './src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

try {
  await setDoc(doc(db, 'test', 'test'), { test: true });
  console.log('✅ Database access working!');
} catch (error) {
  console.error('❌ Database error:', error);
}
```

**The permissions error should be resolved after updating the Firestore rules!** 🚀
