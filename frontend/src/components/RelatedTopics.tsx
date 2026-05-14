import Icon from './Icon';

interface RelatedTopicsProps {
  topics?: string[];
}

const fallbackTopics = [
  'Vector databases',
  'Semantic search',
  'Model evaluation',
  'Prompt grounding',
  'Transformer architecture',
];

export default function RelatedTopics({ topics = fallbackTopics }: RelatedTopicsProps) {
  const visibleTopics = topics.length ? topics : fallbackTopics;

  return (
    <section className="result-card" id="related">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Related topics</p>
          <h2>What to learn next</h2>
        </div>
        <span className="status-pill"><Icon name="search" /> Explore</span>
      </div>

      <div className="topic-list">
        {visibleTopics.map((topic) => (
          <a key={topic} href={`https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`} target="_blank" rel="noreferrer">
            <span>{topic}</span>
            <Icon name="arrowRight" />
          </a>
        ))}
      </div>
    </section>
  );
}
