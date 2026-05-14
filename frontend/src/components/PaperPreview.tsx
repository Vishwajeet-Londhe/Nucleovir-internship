import Icon from './Icon';

interface PaperPreviewProps {
  pdfUrl?: string;
  sourceUrl?: string;
}

function canEmbed(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function PaperPreview({ pdfUrl, sourceUrl }: PaperPreviewProps) {
  const displayUrl = pdfUrl || sourceUrl;
  const isEmbeddable = canEmbed(pdfUrl);

  const copyLink = async () => {
    if (!displayUrl) return;
    await navigator.clipboard?.writeText(displayUrl);
  };

  return (
    <section className="result-card" id="preview">
      <div className="result-card-header">
        <div>
          <p className="section-kicker">Paper preview</p>
          <h2>Original source reference</h2>
        </div>
        <span className="status-pill"><Icon name="file" /> Document</span>
      </div>

      {pdfUrl && isEmbeddable ? (
        <div className="preview-layout">
          <div className="pdf-frame">
            <iframe src={`${pdfUrl}#toolbar=0`} title="Paper preview" />
          </div>
          <div className="preview-actions">
            <a className="primary-button" href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="download" />
              Open PDF
            </a>
            <button className="secondary-button" type="button" onClick={copyLink}>
              <Icon name="copy" />
              Copy link
            </button>
          </div>
        </div>
      ) : displayUrl ? (
        <div className="document-preview">
          <div className="document-page">
            <span />
            <span />
            <span />
            <span className="short" />
            <div />
            <span />
            <span className="medium" />
          </div>
          <div>
            <strong>Original paper source</strong>
            <p>This source cannot be embedded here, but you can open it in a new tab.</p>
            <div className="preview-actions">
              <a className="primary-button" href={displayUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="download" />
                Open source
              </a>
              <button className="secondary-button" type="button" onClick={copyLink}>
                <Icon name="copy" />
                Copy link
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="document-preview">
          <div className="document-page">
            <span />
            <span />
            <span />
            <span className="short" />
            <div />
            <span />
            <span className="medium" />
          </div>
          <div>
            <strong>No paper source attached.</strong>
            <p>The explanation is available, but the original document link was not saved with this analysis.</p>
          </div>
        </div>
      )}
    </section>
  );
}
