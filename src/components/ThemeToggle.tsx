import { useState, useEffect } from 'react';
import '../styles/ThemeToggle.css';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    // Get theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light';
  });

  useEffect(() => {
    // Apply theme to root element
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  const handleToggle = () => {
    setIsLight(!isLight);
  };

  return (
    <button
      className={`theme-toggle ${isLight ? 'light' : 'dark'}`}
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      <div className="toggle-labels">
        <span className="toggle-label dark">Dark</span>
        <span className="toggle-label light">Light</span>
      </div>
      <div className="toggle-circle" />
    </button>
  );
}
