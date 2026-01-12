import { useAuth } from '../hooks/useAuth';
import { getSubcollection, deleteSubcollectionDocument } from '../utils/firebase/db';

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

interface ToolDetailsModalProps {
  isOpen: boolean;
  tool: Tool | null;
  onClose: () => void;
  onToolDeleted: (tools: Tool[]) => void;
  onEdit?: (tool: Tool) => void;
}

export const ToolDetailsModal: React.FC<ToolDetailsModalProps> = ({ 
  isOpen, 
  tool, 
  onClose, 
  onToolDeleted,
  onEdit
}) => {
  const { user } = useAuth();

  const handleRequestTool = async () => {
    if (!tool || !user?.uid) return;
    
    console.log('Tool request sent for:', tool.name);
    alert('Request sent! The tool owner will be notified.');
    onClose();
  };

  const handleDeleteTool = async () => {
    if (!tool || !user?.uid) return;
    
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    try {
      await deleteSubcollectionDocument('Users', user.uid, 'Tools', tool.id);
      
      const userTools = await getSubcollection('Users', user.uid, 'Tools') as Tool[];
      onToolDeleted(userTools);
      onClose();
    } catch (err) {
      console.error('Error deleting tool:', err);
      alert('Failed to delete tool');
    }
  };

  if (!isOpen || !tool) return null;

  const isOwner = tool.userId === user?.uid;
  const canRequest = !isOwner && !tool.inUse;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tool-details-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>×</button>

        {/* Tool Image */}
        <img src={tool.image} alt={tool.name} className="tool-details-image" />

        {/* Tool Name */}
        <h1 className="tool-details-title">{tool.name}</h1>

        {/* Tool Description */}
        <p className="tool-details-description">{tool.description}</p>

        {/* Tool Info Grid */}
        <div className="tool-info-grid">
          <div className="info-item">
            <label className="info-label">DATE ADDED</label>
            <p className="info-value">
              {tool.dateAdded?.toDate?.().toLocaleDateString() || 'N/A'}
            </p>
          </div>

          <div className="info-item">
            <label className="info-label">USED</label>
            <p className="info-value">{tool.timesUsed} times</p>
          </div>

          <div className="info-item">
            <label className="info-label">RATING</label>
            <p className="info-value">{tool.rating ? `${tool.rating} / 5` : 'No rating'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tool-actions">
          {/* Show Request button only if not owner and tool is free */}
          {canRequest && (
            <button className="btn-update" onClick={handleRequestTool}>
              Request
            </button>
          )}

          {/* Show Edit and Delete buttons only if owner */}
          {isOwner && (
            <>
              <button 
                className="btn-update" 
                onClick={() => {
                  if (onEdit) onEdit(tool);
                  onClose();
                }}
              >
                Edit
              </button>
              <button className="btn-delete" onClick={handleDeleteTool}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
