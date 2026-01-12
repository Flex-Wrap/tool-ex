import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSubcollection, createSubcollectionDocument, updateSubcollectionDocument } from '../utils/firebase/db';

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
    onClose();
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
              disabled={addToolLoading}
            />
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
