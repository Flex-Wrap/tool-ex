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

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <div className="item-card" onClick={onClick}>
      <img src={tool.image} alt={tool.name} className="item-image" />
      <div className="item-info">
        <h3 className="item-name">{tool.name}</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: tool.inUse ? 'var(--delete-red)' : 'var(--create-green)' }}
        >
          {tool.inUse ? 'In Use' : 'Free'}
        </span>
      </div>
    </div>
  );
};
