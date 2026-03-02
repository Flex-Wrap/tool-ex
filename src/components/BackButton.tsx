import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/BackButton.css';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)} 
      className="back-button"
      aria-label="Go back"
    >
      <ArrowLeft size={32} />
    </button>
  );
}
