import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroArt from '../assets/hero.png';
import Icon from '../components/Icon';
import { paperAPI } from '../services/api';

type SourceMode = 'pdf' | 'url' | 'text';

const sourceModes: Array<{
  id: SourceMode;
  label: string;
  detail: string;
  icon: 'upload' | 'link' | 'text';
}> = [
  { id: 'pdf', label: 'PDF', detail: 'Upload file', icon: 'upload' },
  { id: 'url', label: 'URL', detail: 'Paste link', icon: 'link' },
  { id: 'text', label: 'Text', detail: 'Paste abstract', icon: 'text' },
];

const examplePapers = [
  {
    name: 'Transformer paper',
    source: 'arXiv',
    value: 'https://arxiv.org/pdf/1706.03762',
    mode: 'url' as SourceMode,
  },
  {
    name: 'Graph learning abstract',
    source: 'Sample text',
    value:
      'This paper studies graph neural networks for learning from connected data. It explains how node features, message passing, and neighborhood aggregation help predict labels in citation and social networks.',
    mode: 'text' as SourceMode,
  },
  {
    name: 'Medical AI paper',
    source: 'bioRxiv',
    value: 'https://www.biorxiv.org/content/10.1101/2023.01.01.522000v1.full.pdf',
    mode: 'url' as SourceMode,
  },
];

export default function Home() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [plainText, setPlainText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const hasInput =
    sourceMode === 'pdf'
      ? Boolean(file)
      : sourceMode === 'url'
      ? Boolean(url.trim())
      : Boolean(plainText.trim());

  const acceptPdf = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setFile(selectedFile);
      setSourceMode('pdf');
      setError('');
      return;
    }

    setError('Please add a PDF file. Other formats can be pasted as text.');
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptPdf(event.dataTransfer.files[0]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    acceptPdf(event.target.files?.[0]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!hasInput) {
      setError('Add a PDF, paper URL, or abstract text first.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      if (sourceMode === 'pdf' && file) formData.append('file', file);
      if (sourceMode === 'url' && url.trim()) formData.append('url', url.trim());
      if (paperTitle.trim()) formData.append('title', paperTitle.trim());
      if (sourceMode === 'text' && plainText.trim()) formData.append('text', plainText.trim());

      const response = await paperAPI.uploadPaper(formData);

      navigate(`/processing/${response.data.paperId}`);
    } catch (err) {
      setError('Upload failed. Check that the backend is running, then try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyExample = (example: (typeof examplePapers)[number]) => {
    setSourceMode(example.mode);
    setError('');

    if (example.mode === 'url') {
      setUrl(example.value);
      setPlainText('');
    } else {
      setPlainText(example.value);
      setUrl('');
    }
  };

  return (
    <div className="app-page">
      <header className="app-header">
        <div className="app-container header-inner">
          <button className="brand" type="button" aria-label="PaperLens AI home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>
              <strong>PaperLens AI</strong>
              <small>Research made readable</small>
            </span>
          </button>

          <div className="header-actions" aria-label="Product highlights">
            <span><Icon name="zap" /> Fast analysis</span>
            <span><Icon name="brain" /> Visual learning</span>
          </div>
        </div>
      </header>

      <main className="app-container home-main">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="eyebrow"><Icon name="spark" /> AI research companion</p>
            <h1 id="home-title">Understand research papers without getting lost.</h1>
            <p className="hero-lead">
              Upload a paper, paste a URL, or add an abstract. PaperLens turns dense academic writing into a clear summary, concepts, math notes, a mind map, and study cards.
            </p>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-stage">
              <img src={heroArt} alt="" className="hero-art" />
              <div className="visual-note note-top">
                <Icon name="file" />
                <span>PDF received</span>
              </div>
              <div className="visual-note note-bottom">
                <Icon name="target" />
                <span>6 insights ready</span>
              </div>
            </div>
          </div>
        </section>

        <section className="workspace-grid" aria-label="Add paper">
          <form className="upload-tool" onSubmit={handleSubmit}>
            <div className="tool-heading">
              <div>
                <p className="section-kicker">Add paper</p>
                <h2>Start a new analysis</h2>
              </div>
              <span className="status-pill"><Icon name="clock" /> 30-60 sec</span>
            </div>

            <div className="input-group">
              <label htmlFor="paperTitle">Paper title</label>
              <input
                id="paperTitle"
                type="text"
                value={paperTitle}
                onChange={(event) => setPaperTitle(event.target.value)}
                placeholder="Optional, AI can detect it"
              />
            </div>

            <div className="mode-tabs" role="tablist" aria-label="Paper input type">
              {sourceModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={sourceMode === mode.id}
                  className={`mode-tab ${sourceMode === mode.id ? 'is-active' : ''}`}
                  onClick={() => setSourceMode(mode.id)}
                >
                  <Icon name={mode.icon} />
                  <span>{mode.label}</span>
                  <small>{mode.detail}</small>
                </button>
              ))}
            </div>

            {sourceMode === 'pdf' && (
              <div
                className={`drop-zone ${isDragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
                onDrop={handleFileDrop}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
              >
                <input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                />
                <div className="drop-icon">
                  <Icon name={file ? 'check' : 'upload'} />
                </div>
                <div>
                  <strong>{file ? file.name : 'Drop your PDF here'}</strong>
                  <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'or choose a file from your computer'}</span>
                </div>
                <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
                  Choose PDF
                </button>
              </div>
            )}

            {sourceMode === 'url' && (
              <div className="input-group">
                <label htmlFor="paperUrl">Paper URL</label>
                <div className="input-with-icon">
                  <Icon name="link" />
                  <input
                    id="paperUrl"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://arxiv.org/pdf/1706.03762"
                  />
                </div>
              </div>
            )}

            {sourceMode === 'text' && (
              <div className="input-group">
                <label htmlFor="paperText">Abstract or pasted text</label>
                <textarea
                  id="paperText"
                  value={plainText}
                  onChange={(event) => setPlainText(event.target.value)}
                  rows={8}
                  placeholder="Paste the abstract or important section of the paper..."
                />
              </div>
            )}

            {error && (
              <div className="form-alert" role="alert">
                <Icon name="alert" />
                <span>{error}</span>
              </div>
            )}

            <button className="primary-button submit-button" type="submit" disabled={isLoading || !hasInput}>
              {isLoading ? (
                <>
                  <span className="button-spinner" />
                  Processing upload
                </>
              ) : (
                <>
                  Analyze paper
                  <Icon name="arrowRight" />
                </>
              )}
            </button>
          </form>

          <aside className="insight-panel" aria-label="Analysis preview">
            <div className="panel-header">
              <p className="section-kicker">Output preview</p>
              <h2>What the result page covers</h2>
            </div>

            <div className="mini-dashboard">
              <div className="summary-strip">
                <Icon name="book" />
                <div>
                  <strong>One-line summary</strong>
                  <span>Problem, method, and contribution in plain language.</span>
                </div>
              </div>

              <div className="metric-grid">
                <div>
                  <Icon name="target" />
                  <strong>Concepts</strong>
                  <span>Tags and short explanations</span>
                </div>
                <div>
                  <Icon name="math" />
                  <strong>Math</strong>
                  <span>Symbols translated simply</span>
                </div>
                <div>
                  <Icon name="map" />
                  <strong>Mind map</strong>
                  <span>Connected visual structure</span>
                </div>
                <div>
                  <Icon name="cards" />
                  <strong>Cards</strong>
                  <span>Questions for revision</span>
                </div>
              </div>
            </div>

            <div className="examples">
              <div className="examples-heading">
                <Icon name="search" />
                <span>Try a sample</span>
              </div>
              {examplePapers.map((example) => (
                <button key={example.name} type="button" onClick={() => applyExample(example)}>
                  <span>
                    <strong>{example.name}</strong>
                    <small>{example.source}</small>
                  </span>
                  <Icon name="arrowRight" />
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="trust-row" aria-label="Workflow">
          <div>
            <span>1</span>
            <strong>Add</strong>
            <p>PDF, URL, or text</p>
          </div>
          <div>
            <span>2</span>
            <strong>Analyze</strong>
            <p>Extract structure</p>
          </div>
          <div>
            <span>3</span>
            <strong>Understand</strong>
            <p>Summary, math, map</p>
          </div>
          <div>
            <span>4</span>
            <strong>Remember</strong>
            <p>Review with cards</p>
          </div>
        </section>
      </main>
    </div>
  );
}
