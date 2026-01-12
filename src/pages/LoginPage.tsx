import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css';

const REMEMBER_ME_KEY = 'toolex_remember_email';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Signup modal state
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
      
      navigate('/home');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    try {
      await signup(signupEmail, signupPassword, signupName);
      setShowSignup(false);
      setEmail(signupEmail);
      setPassword(signupPassword);
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      navigate('/home');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setSignupError(errorMessage);
    } finally {
      setSignupLoading(false);
    }
  };

  const closeSignupModal = () => {
    setShowSignup(false);
    setSignupEmail('');
    setSignupPassword('');
    setSignupName('');
    setSignupError(null);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to ToolEx</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignIn} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-footer">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="btn-sign-in" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <button
            type="button"
            className="sign-up-link"
            onClick={(e) => {
              e.preventDefault();
              setShowSignup(true);
            }}
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Signup Modal Overlay */}
      {showSignup && (
        <div className="modal-overlay" onClick={closeSignupModal}>
          <div className="signup-card" onClick={(e) => e.stopPropagation()}>
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Join ToolEx to get started</p>

            {signupError && <div className="error-message">{signupError}</div>}

            <form onSubmit={handleSignUp} className="login-form">
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  type="text"
                  id="signup-name"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  placeholder="Create a password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-sign-in" disabled={signupLoading}>
                {signupLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="login-footer">
              <span>Already have an account?</span>
              <button
                type="button"
                className="sign-up-link"
                onClick={(e) => {
                  e.preventDefault();
                  closeSignupModal();
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
