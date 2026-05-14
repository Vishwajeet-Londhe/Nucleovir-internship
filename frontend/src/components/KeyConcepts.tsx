import Icon from './Icon';

interface KeyConceptsProps {
  concepts?: string[];
}

const fallbackConcepts = [
  'Research problem',
  'Method',
  'Dataset',
  'Evaluation',
  'Limitations',
  'Future work',
];

export default function KeyConcepts({ concepts = fallbackConcepts }: KeyConceptsProps) {
  const visibleConcepts = concepts.length ? concepts : fallbackConcepts;

  return (
    <section className="result-card" id="concepts">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Key concepts</p>
          <h2>Core ideas to remember</h2>
        </div>
        <span className="status-pill"><Icon name="target" /> {visibleConcepts.length} found</span>
      </div>

      <div className="concept-grid">
        {visibleConcepts.map((concept, index) => (
          <article key={`${concept}-${index}`} className="concept-card">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{concept}</strong>
            <p>Important term or idea used by the paper's argument.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
