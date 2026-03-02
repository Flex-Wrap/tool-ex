import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createDocument } from '../utils/firebase/db';
import BackButton from '../components/BackButton';
import '../styles/ToolboxPage.css';

export default function ToolboxPage() {
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [toolImage, setToolImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user?.uid) throw new Error('User not authenticated');

      const toolId = `${user.uid}-${Date.now()}`;

      await createDocument('Tools', toolId, {
        id: toolId,
        name: toolName,
        description: toolDescription,
        image: toolImage,
        userId: user.uid,
        dateAdded: new Date(),
        timesUsed: 0,
        rating: null,
      });

      setSuccess(true);
      setToolName('');
      setToolDescription('');
      setToolImage('');

      // Redirect back to profile after 1.5 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add tool';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="toolbox-container">
      <BackButton />
      <div className="toolbox-card">
        <h1 className="toolbox-title">Add a Tool</h1>
        <p className="toolbox-subtitle">Share your tools with your neighbors</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Tool added successfully! Redirecting...</div>}

        <form onSubmit={handleAddTool} className="tool-form">
          <div className="form-group">
            <label htmlFor="tool-name">Tool Name</label>
            <input
              type="text"
              id="tool-name"
              placeholder="e.g., Power Drill"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tool-description">Description</label>
            <textarea
              id="tool-description"
              placeholder="Describe your tool (brand, condition, features, etc.)"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tool-image">Image URL</label>
            <input
              type="url"
              id="tool-image"
              placeholder="Enter image URL"
              value={toolImage}
              onChange={(e) => setToolImage(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {toolImage && (
            <div className="image-preview">
              <img src={toolImage} alt="Tool preview" className="preview-image" />
            </div>
          )}

          <div className="form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
