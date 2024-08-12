"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    sessionStorage.removeItem('user');
    router.push('/signin');
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">Chat Support</div>
        <div className="navbar-links">
          {user ? (
            <button className="navbar-button" onClick={handleSignOut}>
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/signin" className="navbar-button navbar-link">
                Sign In
              </Link>
              <Link href="/signup" className="navbar-button navbar-link">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="landing-content">
        <h1>Welcome to Chat Support</h1>
        <p>Your reliable AI chat assistance</p>
      </div>
    </div>
  );
};

export default LandingPage;
