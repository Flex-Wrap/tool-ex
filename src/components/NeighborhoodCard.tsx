interface Neighborhood {
  id: string;
  name: string;
  image: string;
  createdBy: string;
}

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
  userUid: string;
  onClick: () => void;
}

export const NeighborhoodCard: React.FC<NeighborhoodCardProps> = ({ neighborhood, userUid, onClick }) => {
  const isOwner = neighborhood.createdBy === userUid;

  return (
    <div className="item-card" onClick={onClick}>
      <img src={neighborhood.image} alt={neighborhood.name} className="item-image" />
      <div className="item-info">
        <h3 className="item-name">{neighborhood.name}</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: isOwner ? 'var(--update-blue)' : 'var(--label-grey)' }}
        >
          {isOwner ? 'Owner' : 'Member'}
        </span>
      </div>
    </div>
  );
};
