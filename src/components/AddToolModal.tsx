import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSubcollection, createSubcollectionDocument, updateSubcollectionDocument } from '../utils/firebase/db';
import { uploadImage } from '../utils/firebase/storage';

interface Tool {
  id: string;
  name: string;
  image: string;
  description: string;
  dateAdded: any;
  timesUsed: number;
  rating: number | null;
  inUse: boolean;
  userId: string;
}

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToolAdded: (tools: Tool[]) => void;
  toolToEdit?: Tool | null;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({ isOpen, onClose, onToolAdded, toolToEdit }) => {
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [toolImage, setToolImage] = useState('');
  const [addToolLoading, setAddToolLoading] = useState(false);
  const [addToolError, setAddToolError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const isEditMode = !!toolToEdit;

  useEffect(() => {
    if (isOpen && isEditMode && toolToEdit) {
      setToolName(toolToEdit.name);
      setToolDescription(toolToEdit.description);
      setToolImage(toolToEdit.image);
    }
  }, [isOpen, isEditMode, toolToEdit]);

  const handleClose = () => {
    setToolName('');
    setToolDescription('');
    setToolImage('');
    setAddToolError(null);
    setUploadError(null);
    if (isCameraOpen) {
      handleCloseCamera();
    }
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    try {
      setIsUploadingImage(true);
      setUploadError(null);
      const imageUrl = await uploadImage(file, user.uid, 'tool');
      setToolImage(imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setUploadError(errorMessage);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setUploadError(errorMessage);
    }
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !user?.uid) return;

    try {
      setIsUploadingImage(true);
      setUploadError(null);

      const videoElement = videoRef.current;
      
      // Wait a bit for video to stabilize and load
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 500);
      });

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Try to draw the image even if dimensions seem off
      try {
        canvasRef.current.width = videoElement.videoWidth || 640;
        canvasRef.current.height = videoElement.videoHeight || 480;
        ctx.drawImage(videoElement, 0, 0);
      } catch (drawError) {
        // If drawing fails, try with fixed dimensions
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 640, 480);
        throw new Error('Failed to draw video frame - camera may not be ready');
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Blob creation timeout'));
        }, 5000);

        canvasRef.current?.toBlob(
          (b) => {
            clearTimeout(timeout);
            if (b) {
              resolve(b);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/jpeg',
          0.9
        );
      });

      if (blob.size === 0) {
        throw new Error('Blob is empty');
      }

      // Create a File from the blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const imageUrl = await uploadImage(file, user.uid, 'tool');
      setToolImage(imageUrl);
      handleCloseCamera();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture photo';
      setUploadError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCloseCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddToolError(null);
    setAddToolLoading(true);

    try {
      if (!user?.uid) throw new Error('User not authenticated');

      if (isEditMode && toolToEdit) {
        // Update existing tool
        await updateSubcollectionDocument('Users', user.uid, 'Tools', toolToEdit.id, {
          name: toolName,
          description: toolDescription,
          image: toolImage,
        });
      } else {
        // Create new tool
        const toolId = `tool-${Date.now()}`;
        await createSubcollectionDocument('Users', user.uid, 'Tools', toolId, {
          id: toolId,
          name: toolName,
          description: toolDescription,
          image: toolImage,
          userId: user.uid,
          dateAdded: new Date(),
          timesUsed: 0,
          rating: null,
          inUse: false,
        });
      }

      const userTools = await getSubcollection('Users', user.uid, 'Tools') as Tool[];
      onToolAdded(userTools);
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : isEditMode ? 'Failed to update tool' : 'Failed to add tool';
      setAddToolError(errorMessage);
    } finally {
      setAddToolLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="add-tool-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEditMode ? 'Edit Tool' : 'Add a Tool'}</h2>

        {addToolError && <div className="error-message">{addToolError}</div>}

        <form onSubmit={handleSaveTool} className="add-tool-form">
          <div className="form-group">
            <label htmlFor="add-tool-name">Tool Name</label>
            <input
              type="text"
              id="add-tool-name"
              placeholder="e.g., Power Drill"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              required
              disabled={addToolLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="add-tool-description">Description</label>
            <textarea
              id="add-tool-description"
              placeholder="Describe your tool (brand, condition, features, etc.)"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              required
              disabled={addToolLoading}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="add-tool-image">Image URL</label>
            <input
              type="url"
              id="add-tool-image"
              placeholder="Enter image URL"
              value={toolImage}
              onChange={(e) => setToolImage(e.target.value)}
              required
              disabled={addToolLoading || isUploadingImage || isCameraOpen}
            />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!isCameraOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={addToolLoading || isUploadingImage}
                  className="btn-update"
                >
                  {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
                
                <button
                  type="button"
                  onClick={handleOpenCamera}
                  disabled={addToolLoading || isUploadingImage}
                  className="btn-update"
                >
                  Take Picture
                </button>
              </div>
            )}
            
            {isCameraOpen && (
              <div style={{ marginTop: '8px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    backgroundColor: '#000',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={isUploadingImage}
                    className="btn-update"
                  >
                    {isUploadingImage ? 'Uploading...' : 'Capture'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    disabled={isUploadingImage}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {uploadError && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{uploadError}</div>}
          </div>

          {toolImage && (
            <div className="photo-preview">
              <img src={toolImage} alt="Tool preview" className="preview-image" />
            </div>
          )}

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={addToolLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={isEditMode ? 'btn-update' : 'btn-create'}
              disabled={addToolLoading}
            >
              {addToolLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Tool')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
