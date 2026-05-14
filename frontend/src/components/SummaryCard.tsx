import Icon from './Icon';

interface SummaryCardProps {
  summary: string;
  title?: string;
  category?: string;
  difficulty?: string;
  method?: string;
}

export default function SummaryCard({
  summary,
  title = 'Research paper',
  category = 'AI research',
  difficulty = 'Intermediate',
  method = 'Literature analysis',
}: SummaryCardProps) {
  return (
    <section className="result-card summary-card" id="summary">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Summary card</p>
          <h2>{title}</h2>
        </div>
        <span className="status-pill"><Icon name="book" /> Overview</span>
      </div>

      <p className="summary-text">
        {summary || 'The paper summary will appear here after the AI analysis is complete.'}
      </p>

      <div className="summary-facts">
        <div>
          <span>Category</span>
          <strong>{category}</strong>
        </div>
        <div>
          <span>Difficulty</span>
          <strong>{difficulty}</strong>
        </div>
        <div>
          <span>Method used</span>
          <strong>{method}</strong>
        </div>
      </div>
    </section>
  );
}
