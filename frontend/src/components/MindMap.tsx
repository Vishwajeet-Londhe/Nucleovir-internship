import Icon from './Icon';

interface MindMapData {
  nodes?: string[];
  connections?: string[];
}

interface MindMapProps {
  mindMap?: MindMapData;
}

const fallbackNodes = ['Main idea', 'Problem', 'Method', 'Evidence', 'Limitations', 'Next steps'];

export default function MindMap({ mindMap }: MindMapProps) {
  const nodes = mindMap?.nodes?.length ? mindMap.nodes : fallbackNodes;
  const centerNode = nodes[0];
  const branchNodes = nodes.slice(1, 7);

  return (
    <section className="result-card" id="mindmap">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Mind map</p>
          <h2>How the paper is structured</h2>
        </div>
        <span className="status-pill"><Icon name="map" /> Visual map</span>
      </div>

      <div className="mindmap-canvas">
        <div className="mindmap-center">
          <Icon name="brain" />
          <strong>{centerNode}</strong>
        </div>

        <div className="mindmap-branches">
          {branchNodes.map((node, index) => (
            <article key={`${node}-${index}`} className="mindmap-node">
              <span>{index + 1}</span>
              <strong>{node}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="connection-note">
        <Icon name="layers" />
        <span>{mindMap?.connections?.length || branchNodes.length} relationships identified between topics.</span>
      </div>
    </section>
  );
}
