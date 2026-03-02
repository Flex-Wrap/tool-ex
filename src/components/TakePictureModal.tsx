import React, { useEffect, useRef, useState } from 'react';
import { uploadImage } from '../utils/firebase/storage';

interface TakePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (imageUrl: string) => void;
  userId: string;
}

export const TakePictureModal: React.FC<TakePictureModalProps> = ({
  isOpen,
  onClose,
  onImageCapture,
  userId,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamStarted, setStreamStarted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        setError(null);
        setStreamStarted(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setStreamStarted(true);
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
        setError(errorMessage);
        console.error('Error accessing camera', err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const captureImage = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    try {
      setIsUploading(true);
      setError(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Get actual and visible dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const { width: displayWidth, height: displayHeight } = video.getBoundingClientRect();

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const videoAspect = videoWidth / videoHeight;
      const displayAspect = displayWidth / displayHeight;

      let sx = 0, sy = 0, sWidth = videoWidth, sHeight = videoHeight;

      if (videoAspect > displayAspect) {
        sWidth = videoHeight * displayAspect;
        sx = (videoWidth - sWidth) / 2;
      } else {
        sHeight = videoWidth / displayAspect;
        sy = (videoHeight - sHeight) / 2;
      }

      context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and upload
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      const blob = await fetch(imageDataUrl).then(res => res.blob());
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const imageUrl = await uploadImage(file, userId, 'tool');
      
      // Stop stream before closing
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }

      onImageCapture(imageUrl);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture image';
      setError(errorMessage);
      console.error('Error capturing image', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-tool-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Take a Picture</h2>

        <video
          ref={videoRef}
          className="take-picture-video"
          muted
          playsInline
          style={{
            width: '100%',
            height: '300px',
            borderRadius: '6px',
            objectFit: 'cover',
            backgroundColor: '#000',
            display: 'block',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!streamStarted && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '16px 24px',
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            Loading camera...
          </div>
        )}

        {error && (
          <div style={{
            color: '#EF4444',
            fontSize: '12px',
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '4px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={captureImage}
            disabled={!streamStarted || isUploading}
            className="btn-update"
          >
            {isUploading ? 'Uploading...' : 'Capture'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
