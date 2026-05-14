import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { paperAPI } from '../services/api';

const steps = [
  {
    label: 'Paper received',
    detail: 'Checking the source and preparing extraction.',
    progress: 15,
    icon: 'file' as const,
  },
  {
    label: 'Reading content',
    detail: 'Finding abstract, sections, methods, and references.',
    progress: 35,
    icon: 'book' as const,
  },
  {
    label: 'Finding key ideas',
    detail: 'Pulling out concepts, claims, and contribution.',
    progress: 55,
    icon: 'target' as const,
  },
  {
    label: 'Explaining math',
    detail: 'Turning equations and symbols into plain language.',
    progress: 75,
    icon: 'math' as const,
  },
  {
    label: 'Building visual summary',
    detail: 'Preparing mind map, preview, and learning cards.',
    progress: 100,
    icon: 'map' as const,
  },
];

export default function Processing() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(8);
  const [status, setStatus] = useState('Starting analysis');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        if (!paperId) return;

        const response = await paperAPI.getPaperStatus(paperId);
        const paperStatus = response.data.status || 'processing';
        const paperProgress = Number(response.data.progress ?? 0);

        if (!isMounted) return;

        setStatus(paperStatus === 'completed' ? 'Analysis complete' : paperStatus);
        setProgress(Math.max(8, Math.min(100, paperProgress)));

        if (paperStatus === 'completed') {
          window.setTimeout(() => navigate(`/explanation/${paperId}`), 700);
        }

        if (paperStatus === 'failed') {
          setError('The analysis failed. Please return home and try another file or source.');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Could not reach the backend status endpoint.');
        console.error(err);
      }
    };

    checkStatus();
    const interval = window.setInterval(checkStatus, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [paperId, navigate]);

  return (
    <div className="app-page processing-page">
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
              <small>Analysis in progress</small>
            </span>
          </button>
        </div>
      </header>

      <main className="app-container processing-main">
        <section className="processing-card" aria-live="polite">
          <div className="processing-summary">
            <p className="eyebrow"><Icon name="spark" /> Working on your paper</p>
            <h1>Building the visual explanation</h1>
            <p>
              PaperLens is turning the source into structured sections that are easier to scan, review, and present.
            </p>
          </div>

          {error ? (
            <div className="error-state">
              <div className="error-icon"><Icon name="alert" /></div>
              <h2>Processing paused</h2>
              <p>{error}</p>
              <button className="primary-button" type="button" onClick={() => navigate('/')}>
                <Icon name="refresh" />
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="progress-panel">
                <div className="progress-meta">
                  <span>{status}</span>
                  <strong>{Math.round(progress)}%</strong>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="processing-steps">
                {steps.map((step) => {
                  const isDone = progress >= step.progress;
                  const isActive = !isDone && progress >= step.progress - 20;

                  return (
                    <div
                      key={step.label}
                      className={`process-step ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
                    >
                      <div className="step-icon">
                        <Icon name={isDone ? 'check' : step.icon} />
                      </div>
                      <div>
                        <strong>{step.label}</strong>
                        <span>{step.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
