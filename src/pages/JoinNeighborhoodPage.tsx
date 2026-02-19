import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDocument, updateDocument, createSubcollectionDocument } from '../utils/firebase/db';
import QrScanner from 'qr-scanner';
import '../styles/JoinNeighborhoodPage.css';

export default function JoinNeighborhoodPage() {
  const [neighborhoodId, setNeighborhoodId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Validate ID format: ne-${Date.now()}-${user.uid.slice(0, 8)}
  const isValidId = (id: string): boolean => {
    return id.startsWith('ne-') && id.length > 0 && id.split('-').length === 3;
  };

  const isFormValid = neighborhoodId.trim() && password.trim() && isValidId(neighborhoodId);

  // Handle QR code scan
  const handleStartCamera = async () => {
    try {
      setError(null);
      setShowCamera(true);
      
      // Small delay to ensure video element is rendered in DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // QR code detected - extract the neighborhood ID
          console.log('QR Code detected:', result.data);
          setNeighborhoodId(result.data);
          setQrScanned(true);
          // Keep camera open, just show green border
        },
        {
          onDecodeError: (error) => {
            // Silently ignore decode errors - they happen frequently while scanning
            console.log('Decode attempt:', error?.message || 'scanning...');
          },
          preferredCamera: 'environment',
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      );

      await qrScannerRef.current.start();
      setCameraActive(true);
      console.log('Camera started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera. Please check camera permissions.';
      setError(errorMessage);
      setShowCamera(false);
      setCameraActive(false);
      console.error('Camera error:', err);
    }
  };

  const handleStopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setCameraActive(false);
    setShowCamera(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  const handleJoinNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user?.uid) throw new Error('User not authenticated');
      if (!isValidId(neighborhoodId)) throw new Error('Invalid neighborhood ID');
      if (!password.trim()) throw new Error('Password is required');

      // Fetch neighborhood document
      const neighborhood = await getDocument('Neighbourhoods', neighborhoodId);

      if (!neighborhood) {
        throw new Error('Neighborhood not found');
      }

      // Verify password
      if (neighborhood.password !== password) {
        throw new Error('Incorrect password');
      }

      // Check if user is already a member
      if (neighborhood.members && neighborhood.members.includes(user.uid)) {
        throw new Error('You are already a member of this neighborhood');
      }

      // Add user to neighborhood members array
      const updatedMembers = [...(neighborhood.members || []), user.uid];
      await updateDocument('Neighbourhoods', neighborhoodId, {
        members: updatedMembers,
      });

      // Add neighborhood reference to user's Neighbourhoods subcollection
      await createSubcollectionDocument('Users', user.uid, 'Neighbourhoods', neighborhoodId, {
        id: neighborhoodId,
        name: neighborhood.name,
        image: neighborhood.image,
        joinedAt: new Date(),
      });

      // Navigate to profile
      navigate('/profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join neighborhood';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-neighborhood-container">
      <div className="join-neighborhood-content">
        {/* Header */}
        <div className="neighborhood-header">
          <h3 className="neighborhood-label">Join a Neighbourhood</h3>
          <h1 className="neighborhood-title">Connect with Your Community</h1>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Form */}
        <form onSubmit={handleJoinNeighborhood} className="neighborhood-form">
          {/* QR Code Scanner Area */}
          <div className="image-upload-area">
            {showCamera ? (
              <div className="camera-preview-container">
                <video ref={videoRef} className="camera-video"></video>
              </div>
            ) : (
              <div className="image-placeholder">
                <button
                  type="button"
                  className="btn-add-image"
                  onClick={handleStartCamera}
                  disabled={cameraActive}
                >
                  Scan QR Code
                </button>
              </div>
            )}
          </div>

          {/* ID Input */}
          <div className="form-group">
            <label htmlFor="neighborhood-id" className="form-label">ID</label>
            <input
              type="text"
              id="neighborhood-id"
              placeholder="Enter or scan neighbourhood ID"
              value={neighborhoodId}
              onChange={(e) => setNeighborhoodId(e.target.value)}
              className={qrScanned ? 'input-scanned' : ''}
              required
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">PASSWORD</label>
            <input
              type="password"
              id="password"
              placeholder="Enter neighbourhood password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Join Button */}
          <button
            type="submit"
            className="btn-join-neighborhood"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Joining...' : 'Join Neighbourhood'}
          </button>
        </form>
      </div>
    </div>
  );
}
