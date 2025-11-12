// src/pages/SignIn.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputComponent from "../components/InputComponent";
import { signIn } from "../api/api";
import "../styles/SignIn.css";
import axios from "axios";

export default function SignIn() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim() || "";
    const password = passwordRef.current?.value.trim() || "";

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn({ email, password });
      navigate("/home");
    } catch (err: unknown) {
      console.error("SignIn error raw:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Signin failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Signin failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-root">
      <form
        className="signin-form"
        onSubmit={handleSubmit}
        aria-describedby="signin-error"
      >
        <h2>Sign in</h2>

        <InputComponent
          title="Email"
          type="email"
          placeholder="you@example.com"
          refValue={emailRef}
        />

        <InputComponent
          title="Password"
          type="password"
          placeholder="Enter your password"
          refValue={passwordRef}
        />

        {error && (
          <div id="signin-error" className="error-box" role="alert">
            {error}
          </div>
        )}

        <button className="signin-btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="signup-prompt">
          Don't have an account? <a href="/signup">Create one</a>
        </p>
      </form>
    </div>
  );
}
