import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSubcollection, getDocument } from '../utils/firebase/db';
import { ToolCard } from '../components/ToolCard';
import { ToolDetailsModal } from '../components/ToolDetailsModal';
import BackButton from '../components/BackButton';
import '../styles/ShedPage.css';

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
  members: string[];
}

export default function ShedPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToolDetailsModal, setShowToolDetailsModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchShedTools = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user's neighborhood IDs from subcollection
        const userNeighborhoodRefs = await getSubcollection('Users', user.uid, 'Neighbourhoods') as any[];

        // Fetch full neighbourhood documents and get members
        const neighbourhoods = await Promise.all(
          userNeighborhoodRefs.map(ref => getDocument('Neighbourhoods', ref.id))
        );

        const validNeighbourhoods = neighbourhoods.filter(doc => doc) as Neighborhood[];

        // Get all unique member IDs across all neighborhoods
        const memberIds = new Set<string>();
        validNeighbourhoods.forEach(neighborhood => {
          if (neighborhood.members && Array.isArray(neighborhood.members)) {
            neighborhood.members.forEach(memberId => memberIds.add(memberId));
          }
        });

        // Fetch tools from all members
        const allTools: Tool[] = [];
        for (const memberId of memberIds) {
          try {
            const memberTools = await getSubcollection('Users', memberId, 'Tools') as Tool[];
            allTools.push(...memberTools);
          } catch (err) {
            console.error(`Error fetching tools for member ${memberId}:`, err);
          }
        }

        setTools(allTools);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shed tools';
        setError(errorMessage);
        console.error('Error fetching shed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShedTools();
  }, [user?.uid]);

  return (
    <div className="shed-container">
      <BackButton />
      <div className="shed-header">
        <h1 className="shed-title">The Shed</h1>
        <p className="shed-subtitle">Tools from your neighborhoods</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading tools...</p>
        </div>
      ) : tools.length === 0 ? (
        <div className="empty-state">
          <p>No tools available. Join a neighborhood or add tools to get started!</p>
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => {
                setSelectedTool(tool);
                setShowToolDetailsModal(true);
              }}
            />
          ))}
        </div>
      )}

      {selectedTool && (
        <ToolDetailsModal
          isOpen={showToolDetailsModal}
          tool={selectedTool}
          onClose={() => {
            setShowToolDetailsModal(false);
            setSelectedTool(null);
          }}
          onToolDeleted={() => {
            // Refresh tools list (optional - user can navigate back)
          }}
        />
      )}
    </div>
  );
}
