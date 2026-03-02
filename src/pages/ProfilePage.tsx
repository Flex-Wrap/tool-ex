import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSubcollection, getDocument } from '../utils/firebase/db';
import { EditProfileModal } from '../components/EditProfileModal';
import { AddToolModal } from '../components/AddToolModal';
import { ToolDetailsModal } from '../components/ToolDetailsModal';
import { ToolCard } from '../components/ToolCard';
import { NeighborhoodCard } from '../components/NeighborhoodCard';
import { NeighborhoodDetailsModal } from '../components/NeighborhoodDetailsModal';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';
import '../styles/ProfilePage.css';

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

interface Neighborhood {
  id: string;
  name: string;
  image: string;
  createdBy: string;
  password: string;
  qrCode?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'tools' | 'neighborhoods'>('tools');
  const [tools, setTools] = useState<Tool[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showToolDetailsModal, setShowToolDetailsModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolToEdit, setToolToEdit] = useState<Tool | null>(null);
  const [showNeighborhoodDetailsModal, setShowNeighborhoodDetailsModal] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        
        // Fetch user's tools from subcollection
        const userTools = await getSubcollection('Users', user.uid, 'Tools') as Tool[];
        setTools(userTools);

        // Fetch user's neighborhood IDs from subcollection
        const userNeighborhoodRefs = await getSubcollection('Users', user.uid, 'Neighbourhoods') as any[];
        
        // Fetch full neighbourhood documents from main collection
        const neighbourhoodDocs = await Promise.all(
          userNeighborhoodRefs.map(ref => getDocument('Neighbourhoods', ref.id))
        );
        
        setNeighborhoods(neighbourhoodDocs.filter(doc => doc) as Neighborhood[]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleToolAdded = async () => {
    // Refresh tools list after a tool is added
    if (user?.uid) {
      const userTools = await getSubcollection('Users', user.uid, 'Tools') as Tool[];
      setTools(userTools);
    }
  };

  const handleToolDeleted = async () => {
    // Refresh tools list after a tool is deleted
    if (user?.uid) {
      const userTools = await getSubcollection('Users', user.uid, 'Tools') as Tool[];
      setTools(userTools);
    }
    setShowToolDetailsModal(false);
    setSelectedTool(null);
  };

  const openToolDetailsModal = (tool: Tool) => {
    setSelectedTool(tool);
    setShowToolDetailsModal(true);
  };

  return (
    <div className="profile-container">
      <BackButton />
      <ThemeToggle />
      {/* Profile Header */}
      <div className="profile-header">
        <img
          src={user?.photoURL || 'https://static.vecteezy.com/system/resources/thumbnails/053/964/117/small/a-silhouette-of-a-person-with-a-circular-head-and-a-minimalistic-body-structure-showcasing-a-simple-design-png.png'}
          alt="Profile"
          className="profile-avatar"
        />
        <h1 className="profile-name">{user?.displayName || 'User'}</h1>
        <button
          className="btn-update"
          onClick={() => setShowEditModal(true)}
        >
          Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <button
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Tool Box
        </button>
        <button
          className={`tab ${activeTab === 'neighborhoods' ? 'active' : ''}`}
          onClick={() => setActiveTab('neighborhoods')}
        >
          Neighbourhoods
        </button>
      </div>

      {/* Content */}
      <div className="tabs-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="tools-section">
                <div className="tools-header">
                  <button
                    className="btn-add-tool"
                    onClick={() => setShowAddToolModal(true)}
                    title="Add a new tool"
                  >
                    +
                  </button>
                </div>

                {tools.length === 0 ? (
                  <div className="empty-state">
                    <p>No tools yet. Add your first tool!</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {tools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onClick={() => openToolDetailsModal(tool)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Neighborhoods Tab */}
            {activeTab === 'neighborhoods' && (
              <div className="neighborhoods-section">
                {neighborhoods.length === 0 ? (
                  <div className="empty-state">
                    <p>You haven't joined any neighborhoods yet.</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {neighborhoods.map((neighborhood) => (
                      <NeighborhoodCard
                        key={neighborhood.id}
                        neighborhood={neighborhood}
                        userUid={user?.uid || ''}
                        onClick={() => {
                          setSelectedNeighborhood(neighborhood);
                          setShowNeighborhoodDetailsModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Components */}
      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />

      <AddToolModal 
        isOpen={showAddToolModal} 
        onClose={() => {
          setShowAddToolModal(false);
          setToolToEdit(null);
        }}
        onToolAdded={handleToolAdded}
        toolToEdit={toolToEdit}
      />

      {selectedTool && (
        <ToolDetailsModal 
          isOpen={showToolDetailsModal} 
          tool={selectedTool}
          onClose={() => {
            setShowToolDetailsModal(false);
            setSelectedTool(null);
          }}
          onToolDeleted={handleToolDeleted}
          onEdit={(tool) => {
            setToolToEdit(tool);
            setShowAddToolModal(true);
          }}
        />
      )}

      {selectedNeighborhood && (
        <NeighborhoodDetailsModal
          isOpen={showNeighborhoodDetailsModal}
          neighborhood={selectedNeighborhood}
          onClose={() => {
            setShowNeighborhoodDetailsModal(false);
            setSelectedNeighborhood(null);
          }}
          onDeleted={async () => {
            if (user?.uid) {
              const userNeighborhoodRefs = await getSubcollection('Users', user.uid, 'Neighbourhoods') as any[];
              const neighbourhoodDocs = await Promise.all(
                userNeighborhoodRefs.map(ref => getDocument('Neighbourhoods', ref.id))
              );
              setNeighborhoods(neighbourhoodDocs.filter(doc => doc) as Neighborhood[]);
            }
          }}
        />
      )}

      {/* My Shed Button */}
      <button 
        className="btn-my-shed"
        onClick={() => navigate('/shed')}
      >
        The Shed
      </button>
    </div>
  );
}
