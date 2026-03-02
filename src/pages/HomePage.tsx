import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FeatureCard } from '../components/FeatureCard';
import qrshareImg from '../assets/qrshare.png';
import qrshareLightImg from '../assets/qrshare-light.png';
import shakhandsImg from '../assets/shakehands.png';
import shakehandsLightImg from '../assets/shakehands-light.png';
import moneyzImg from '../assets/moneyz.png';
import moneyzLightImg from '../assets/moneyz-light.png';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      navigate('/login');
    }
    
    // Check if light theme is applied
    const isLightTheme = document.documentElement.classList.contains('light-theme');
    setIsDarkMode(!isLightTheme);
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setIsDarkMode(!isLight);
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=400&fit=crop" alt="Power Drill" className="hero-image" />
        
        <div className="hero-content">
          <h1 className="hero-title">Start Building Your Dream</h1>
          <p className="hero-subtitle">
            Share tools with your neighbors and build a stronger community. Connect with people nearby, borrow what you need, and lend what you have.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-create"
            onClick={() => navigate('/create-neighbourhood')}
          >
            Create a Neighbourhood
          </button>
          <button 
            className="btn-update"
            onClick={() => navigate('/join-neighbourhood')}
          >
            Join a Neighbourhood
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <FeatureCard 
          icon="⚒️"
          title="Share Tools"
          description="List your tools and make them available to neighbors"
          watermarkImg={isDarkMode ? qrshareLightImg : qrshareImg}
        />
        <FeatureCard 
          icon="💛"
          title="Build Community"
          description="Connect with neighbors and strengthen local bonds"
          watermarkImg={isDarkMode ? shakehandsLightImg : shakhandsImg}
          reversed
        />
        <FeatureCard 
          icon="🏠"
          title="Save Money"
          description="Borrow instead of buying tools you rarely use"
          watermarkImg={isDarkMode ? moneyzLightImg : moneyzImg}
        />
      </div>

      {/* My Profile Button */}
      <div className="profile-section">
        <button 
          className="btn-profile"
          onClick={() => navigate('/profile')}
        >
          My Profile
        </button>
        <button 
          className="btn-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
