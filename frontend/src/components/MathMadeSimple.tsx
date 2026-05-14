import Icon from './Icon';

interface EquationData {
  equation: string;
  explanation: string;
}

interface MathMadeSimpleProps {
  equations?: EquationData[];
}

export default function MathMadeSimple({ equations = [] }: MathMadeSimpleProps) {
  return (
    <section className="result-card" id="math">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Math made simple</p>
          <h2>Equations in plain language</h2>
        </div>
        <span className="status-pill"><Icon name="math" /> Beginner friendly</span>
      </div>

      {equations.length ? (
        <div className="equation-list">
          {equations.map((item, index) => (
            <article key={`${item.equation}-${index}`} className="equation-card">
              <code>{item.equation}</code>
              <p>{item.explanation}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state-inline">
          <Icon name="math" />
          <div>
            <strong>No major mathematical equation found.</strong>
            <span>The paper can still be explained through concepts, method, and results.</span>
          </div>
        </div>
      )}
    </section>
  );
}
