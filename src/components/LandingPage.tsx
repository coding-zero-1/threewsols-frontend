import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <header className="landing-header">
        <h1 className="landing-logo">Connectify</h1>
        <nav className="landing-nav">
          <button onClick={() => navigate("/signin")} className="nav-btn">
            Sign In
          </button>
          <button onClick={() => navigate("/signup")} className="nav-btn filled">
            Sign Up
          </button>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero">
          <h2 className="hero-title">Your world, your stories.</h2>
          <p className="hero-subtitle">
            Share posts, connect with people, and explore ideas — all in one place.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate("/signup")} className="hero-btn">
              Get Started
            </button>
            <button onClick={() => navigate("/signin")} className="hero-btn outline">
              Sign In
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Connectify — Built with ❤️ by Yash Sangwan.</p>
      </footer>
    </div>
  );
}
