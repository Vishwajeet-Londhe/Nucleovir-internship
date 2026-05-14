import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import KeyConcepts from '../components/KeyConcepts';
import MathMadeSimple from '../components/MathMadeSimple';
import PaperPreview from '../components/PaperPreview';
import MindMap from '../components/MindMap';
import VisualLearningCards from '../components/VisualLearningCards';
import RelatedTopics from '../components/RelatedTopics';
import Icon from '../components/Icon';
import { paperAPI } from '../services/api';

interface PaperData {
  title?: string;
  abstract?: string;
  summary?: string;
  category?: string;
  difficulty?: string;
  method?: string;
  concepts?: string[];
  equations?: { equation: string; explanation: string }[];
  pdfUrl?: string;
  sourceUrl?: string;
  mindMap?: { nodes?: string[]; connections?: string[] };
  learningCards?: { question: string; answer: string }[];
  relatedTopics?: string[];
}

const navItems = [
  { id: 'summary', label: 'Summary', icon: 'book' as const },
  { id: 'concepts', label: 'Concepts', icon: 'target' as const },
  { id: 'math', label: 'Math', icon: 'math' as const },
  { id: 'preview', label: 'Preview', icon: 'file' as const },
  { id: 'mindmap', label: 'Mind map', icon: 'map' as const },
  { id: 'cards', label: 'Cards', icon: 'cards' as const },
  { id: 'related', label: 'Related', icon: 'search' as const },
];

export default function Explanation() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        if (!paperId) return;

        const response = await paperAPI.getPaper(paperId);
        setPaper(response.data);
      } catch (err) {
        setError('Failed to load the paper explanation from the backend.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  if (loading) {
    return (
      <div className="app-page center-state">
        <div className="loading-card">
          <span className="button-spinner" />
          <strong>Loading explanation</strong>
          <p>Preparing the visual result page.</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="app-page center-state">
        <div className="error-state">
          <div className="error-icon"><Icon name="alert" /></div>
          <h1>Could not open the result</h1>
          <p>{error || 'No paper data was returned.'}</p>
          <button className="primary-button" type="button" onClick={() => navigate('/')}>
            <Icon name="home" />
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const title = paper.title || 'Untitled research paper';
  const abstract =
    paper.abstract ||
    'A structured explanation is ready. Add abstract data from the backend to show the original paper context here.';

  return (
    <div className="app-page result-page">
      <header className="app-header">
        <div className="app-container header-inner">
          <button className="brand" type="button" onClick={() => navigate('/')}>
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>
              <strong>PaperLens AI</strong>
              <small>Visual explanation</small>
            </span>
          </button>

          <button className="secondary-button" type="button" onClick={() => navigate('/')}>
            <Icon name="upload" />
            New analysis
          </button>
        </div>
      </header>

      <main className="app-container result-main">
        <aside className="result-sidebar" aria-label="Result sections">
          <div className="sidebar-title">
            <Icon name="layers" />
            <span>Sections</span>
          </div>
          <nav>
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="result-content">
          <section className="result-hero">
            <p className="eyebrow"><Icon name="spark" /> Analysis complete</p>
            <h1>{title}</h1>
            <p>{abstract}</p>
            <div className="result-meta">
              <span><Icon name="target" /> {paper.concepts?.length || 0} concepts</span>
              <span><Icon name="math" /> {paper.equations?.length || 0} equations</span>
              <span><Icon name="cards" /> {paper.learningCards?.length || 0} cards</span>
            </div>
          </section>

          <SummaryCard
            title={title}
            summary={paper.summary || ''}
            category={paper.category}
            difficulty={paper.difficulty}
            method={paper.method}
          />
          <KeyConcepts concepts={paper.concepts} />
          <MathMadeSimple equations={paper.equations} />
          <PaperPreview pdfUrl={paper.pdfUrl} sourceUrl={paper.sourceUrl} />
          <MindMap mindMap={paper.mindMap} />
          <VisualLearningCards cards={paper.learningCards} />
          <RelatedTopics topics={paper.relatedTopics} />
        </div>
      </main>
    </div>
  );
}
