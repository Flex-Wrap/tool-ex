import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createDocument, createSubcollectionDocument } from '../utils/firebase/db';
import '../styles/CreateNeighborhoodPage.css';

export default function CreateNeighborhoodPage() {
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [neighborhoodPassword, setNeighborhoodPassword] = useState('');
  const [neighborhoodImage, setNeighborhoodImage] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{id: string; name: string; password: string} | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user?.uid) throw new Error('User not authenticated');
      if (!neighborhoodName.trim()) throw new Error('Neighborhood name is required');
      if (!neighborhoodPassword.trim()) throw new Error('Password is required');
      if (!neighborhoodImage.trim()) throw new Error('Image URL is required');

      const neighborhoodId = `ne-${Date.now()}-${user.uid.slice(0, 8)}`;

      // Generate QR code URL (encodes the neighborhood ID for joining)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(neighborhoodId)}`;

      // Create neighborhood document in Neighbourhoods collection
      await createDocument('Neighbourhoods', neighborhoodId, {
        id: neighborhoodId,
        name: neighborhoodName,
        password: neighborhoodPassword, // Note: In production, this should be hashed
        image: neighborhoodImage,
        description: description,
        createdBy: user.uid,
        qrCode: qrCodeUrl,
        createdAt: new Date(),
        members: [user.uid],
      });

      // Add neighborhood to user's Neighbourhoods subcollection
      await createSubcollectionDocument('Users', user.uid, 'Neighbourhoods', neighborhoodId, {
        id: neighborhoodId,
        name: neighborhoodName,
        image: neighborhoodImage,
        joinedAt: new Date(),
      });

      // Show success overlay
      setSuccessData({
        id: neighborhoodId,
        name: neighborhoodName,
        password: neighborhoodPassword,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create neighborhood';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="success-overlay">
        <div className="success-card">
          {/* QR Code */}
          <div className="qr-code-container">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(successData.id)}`} alt="QR Code" className="qr-code" />
            <p className="qr-text">Use QR code to invite</p>
          </div>

          {/* Success Title */}
          <h1 className="success-title">{successData.name} Created!</h1>

          {/* Neighborhood Details */}
          <div className="details-box">
            <label className="detail-label">ID</label>
            <p className="detail-value">{successData.id}</p>
          </div>

          <div className="details-box">
            <label className="detail-label">PASSWORD</label>
            <p className="detail-value">{successData.password}</p>
          </div>

          {/* Continue Button */}
          <button
            className="btn-continue"
            onClick={() => navigate('/home')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-neighborhood-container">
      <div className="create-neighborhood-content">
        {/* Header */}
        <div className="neighborhood-header">
          <h3 className="neighborhood-label">Create a Neighbourhood</h3>
          <h1 className="neighborhood-title">Start Sharing!</h1>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Form */}
        <form onSubmit={handleCreateNeighborhood} className="neighborhood-form">
          {/* Image Upload */}
          <div className="image-upload-area">
            {neighborhoodImage ? (
              <div className="image-preview">
                <img src={neighborhoodImage} alt="Neighborhood" className="preview-image" />
              </div>
            ) : (
              <div className="image-placeholder">
                <button
                  type="button"
                  className="btn-add-image"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) setNeighborhoodImage(url);
                  }}
                >
                  Add Image
                </button>
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="neighborhood-name" className="form-label">NAME</label>
            <input
              type="text"
              id="neighborhood-name"
              placeholder="Enter neighbourhood name"
              value={neighborhoodName}
              onChange={(e) => setNeighborhoodName(e.target.value)}
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="neighborhood-password" className="form-label">PASSWORD</label>
            <input
              type="password"
              id="neighborhood-password"
              placeholder="Enter password"
              value={neighborhoodPassword}
              onChange={(e) => setNeighborhoodPassword(e.target.value)}
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="neighborhood-description" className="form-label">DESCRIPTION</label>
            <textarea
              id="neighborhood-description"
              placeholder="Describe your neighborhood"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="form-input"
              rows={3}
            />
          </div>

          {/* Create Button */}
          <button
            type="submit"
            className="btn-create-neighborhood"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Neighbourhood'}
          </button>
        </form>
      </div>
    </div>
  );
}
