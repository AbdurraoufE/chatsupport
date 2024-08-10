"use client"
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async (event) => {
    event.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(email, password);
      console.log({res})
      if (res) {
        setEmail("");
        setPassword("");
        router.push("/");
      }
    } catch (e) {
      console.error('Error signing in:', e.message);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Sign In</h2>
        <form onSubmit={handleSignIn} className="form">
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
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        {error && (
          <div className="error-message">
            <p>Error: {error.message}</p>
            {error.code && <p>Code: {error.code}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
