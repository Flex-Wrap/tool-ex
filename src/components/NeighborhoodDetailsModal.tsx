import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { deleteDocument, updateDocument, deleteSubcollectionDocument, getDocument } from '../utils/firebase/db';

interface Neighborhood {
  id: string;
  name: string;
  image: string;
  createdBy: string;
  password: string;
  qrCode?: string;
}

interface NeighborhoodDetailsModalProps {
  isOpen: boolean;
  neighborhood: Neighborhood | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const NeighborhoodDetailsModal: React.FC<NeighborhoodDetailsModalProps> = ({
  isOpen,
  neighborhood,
  onClose,
  onDeleted,
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const { user } = useAuth();

  if (!isOpen || !neighborhood) return null;

  const isOwner = neighborhood.createdBy === user?.uid;

  const handleDeleteNeighborhood = async () => {
    if (!window.confirm('Are you sure you want to delete this neighborhood?')) return;

    setDeleteLoading(true);
    try {
      // Delete the neighborhood document from main collection
      await deleteDocument('Neighbourhoods', neighborhood.id);

      // Delete from owner's Neighbourhoods subcollection
      if (user?.uid) {
        await deleteSubcollectionDocument('Users', user.uid, 'Neighbourhoods', neighborhood.id);
      }

      onClose();
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Error deleting neighborhood:', err);
      alert('Failed to delete neighborhood');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLeaveNeighborhood = async () => {
    if (!window.confirm('Are you sure you want to leave this neighborhood?')) return;

    setLeaveLoading(true);
    try {
      if (!user?.uid) throw new Error('User not authenticated');

      // Get current neighborhood to access members array
      const currentNeighborhood = await getDocument('Neighbourhoods', neighborhood.id) as any;
      
      // Remove user from members array
      const updatedMembers = currentNeighborhood.members.filter((memberId: string) => memberId !== user.uid);
      
      // Update the neighborhood's members array
      await updateDocument('Neighbourhoods', neighborhood.id, {
        members: updatedMembers,
      });

      // Remove neighborhood from user's Neighbourhoods subcollection
      await deleteSubcollectionDocument('Users', user.uid, 'Neighbourhoods', neighborhood.id);

      onClose();
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Error leaving neighborhood:', err);
      alert('Failed to leave neighborhood');
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="neighborhood-details-card" onClick={(e) => e.stopPropagation()}>
          {/* Neighborhood Image */}
          <img src={neighborhood.image} alt={neighborhood.name} className="neighborhood-details-image" />

          {/* Neighborhood Name */}
          <h1 className="neighborhood-details-title">{neighborhood.name}</h1>

          {/* Details */}
          <div className="details-box">
            <label className="detail-label">NAME</label>
            <p className="detail-value">{neighborhood.name}</p>
          </div>

          <div className="details-box">
            <label className="detail-label">ID</label>
            <p className="detail-value">{neighborhood.id}</p>
          </div>

          <div className="details-box">
            <label className="detail-label">PASSWORD</label>
            <p className="detail-value">{neighborhood.password}</p>
          </div>

          {/* Show QR Button */}
          <button
            className="btn-update"
            onClick={() => setShowQRModal(true)}
            style={{ width: '100%' }}
          >
            Show QR
          </button>

          {/* Action Buttons */}
          <div className="neighborhood-actions">
            <button
              className="btn-update"
              onClick={handleLeaveNeighborhood}
              disabled={leaveLoading}
              style={{ width: '100%' }}
            >
              {leaveLoading ? 'Leaving...' : 'Leave'}
            </button>

            {isOwner && (
              <button
                className="btn-delete"
                onClick={handleDeleteNeighborhood}
                disabled={deleteLoading}
                style={{ width: '100%' }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal Overlay */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* QR Code */}
            <div className="qr-code-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(neighborhood.id)}`}
                alt="QR Code"
                className="qr-code"
              />
              <p className="qr-text">Use QR code to invite</p>
            </div>

            {/* Welcome Title */}
            <h1 className="qr-modal-title">Welcome to {neighborhood.name}</h1>

            {/* Continue Button */}
            <button className="btn-continue" onClick={() => setShowQRModal(false)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};
