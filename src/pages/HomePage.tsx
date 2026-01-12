import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

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
        <div className="feature-card">
          <div className="feature-icon">⚒️</div>
          <h3>Share Tools</h3>
          <p>List your tools and make them available to neighbors</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💛</div>
          <h3>Build Community</h3>
          <p>Connect with neighbors and strengthen local bonds</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏠</div>
          <h3>Save Money</h3>
          <p>Borrow instead of buying tools you rarely use</p>
        </div>
      </div>

      {/* My Profile Button */}
      <div className="profile-section">
        <button 
          className="btn-profile"
          onClick={() => navigate('/profile')}
        >
          My Profile
        </button>
      </div>
    </div>
  );
}
