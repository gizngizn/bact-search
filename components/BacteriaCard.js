export default function BacteriaCard({ bacteria }) {
  return (
    <div className="bacteria-card">
      <div className="bacteria-card-header">
        <h3 className="bacteria-name">{bacteria.fullname}</h3>
        <span className={`relevancy-badge relevancy-${bacteria.relevancy.level}`}>
          {bacteria.relevancy.label}
        </span>
      </div>
      <div className="bacteria-meta">
        <span className="rank-badge">{bacteria.rank}</span>
        {bacteria.family && bacteria.family !== '(unknown family)' && (
          <span className="family-info">{bacteria.family}</span>
        )}
        {bacteria.genus && bacteria.genus !== '(unknown genus)' && (
          <span className="genus-info">{bacteria.genus}</span>
        )}
      </div>
    </div>
  );
}
