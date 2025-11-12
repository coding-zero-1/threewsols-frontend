import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputComponent from "../components/InputComponent";
import { signUp } from "../api/api"; 
import "../styles/SignUp.css";
import axios from "axios";

export default function SignUp() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = nameRef.current?.value.trim() || "";
    const email = emailRef.current?.value.trim() || "";
    const password = passwordRef.current?.value.trim() || "";

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signUp({ username, email, password });
      alert("Account created successfully!");
      navigate("/signin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Signup failed. Try again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Signup failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <InputComponent
          title="Name"
          type="text"
          placeholder="Enter your full name"
          refValue={nameRef}
        />
        <InputComponent
          title="Email"
          type="email"
          placeholder="Enter your email"
          refValue={emailRef}
        />
        <InputComponent
          title="Password"
          type="password"
          placeholder="Enter your password"
          refValue={passwordRef}
        />

        {error && <p className="error-text">{error}</p>}

        <button className="signup-btn" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="signin-link">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </form>
    </div>
  );
}
