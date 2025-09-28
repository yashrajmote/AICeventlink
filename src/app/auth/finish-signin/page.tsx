// src/app/auth/finish-signin/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function FinishSignInPage() {
  const router = useRouter();

  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // If email is not in storage, prompt user for it
          email = window.prompt('Please provide your email for confirmation');
        }

        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // You are now signed in. Redirect to the profile setup or home.
            router.push('/profile-setup'); 
          } catch (error) {
            console.error('Error signing in with email link', error);
            router.push('/login'); // Redirect to login on error
          }
        }
      }
    };

    completeSignIn();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Finalizing your login, please wait...</p>
    </div>
  );
}