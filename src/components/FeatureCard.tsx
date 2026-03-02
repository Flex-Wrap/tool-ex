interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  watermarkImg: string;
  reversed?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, watermarkImg, reversed = false }) => {
  return (
    <div className={`feature-card ${reversed ? 'reversed' : ''}`}>
      <img src={watermarkImg} alt="" className="card-watermark" />
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
