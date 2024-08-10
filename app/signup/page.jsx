"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import '../globals.css';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter(); // Initialize router

  const handleSignOut = async (e) => {
    e.preventDefault();

    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');
      // After sign-up, redirect to sign-in page
      router.push("/signin");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Sign Up</h2>
        <form onSubmit={handleSignOut} className="form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="form-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
