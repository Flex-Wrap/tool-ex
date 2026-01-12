import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateDocument } from '../utils/firebase/db';
import * as authService from '../utils/firebase/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const [editName, setEditName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleOpen = () => {
    setEditName(user?.displayName || '');
    setEditPhotoURL(user?.photoURL || '');
    setEditError(null);
  };

  const handleClose = () => {
    setEditName('');
    setEditPhotoURL('');
    setEditError(null);
    onClose();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      if (!user) throw new Error('User not found');

      await authService.updateUserProfile(editName, editPhotoURL);
      await updateDocument('Users', user.uid, {
        displayName: editName,
        photoURL: editPhotoURL,
      });

      handleClose();
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  if (!isOpen) return null;

  // Initialize values when modal opens
  if (!editName && user?.displayName) {
    handleOpen();
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="edit-profile-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit Profile</h2>

        {editError && <div className="error-message">{editError}</div>}

        <form onSubmit={handleSaveProfile} className="edit-form">
          <div className="form-group">
            <label htmlFor="edit-name">Full Name</label>
            <input
              type="text"
              id="edit-name"
              placeholder="Enter your full name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-photo">Photo URL</label>
            <input
              type="url"
              id="edit-photo"
              placeholder="Enter image URL"
              value={editPhotoURL}
              onChange={(e) => setEditPhotoURL(e.target.value)}
            />
          </div>

          {editPhotoURL && (
            <div className="photo-preview">
              <img src={editPhotoURL} alt="Preview" className="preview-image" />
            </div>
          )}

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-update"
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
