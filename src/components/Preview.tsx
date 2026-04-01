import { useEffect, useRef } from 'react';
import markdownit from 'markdown-it';

const md = markdownit();

interface PreviewProps {
  content: string;
}

function Preview({ content }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    previewRef.current.innerHTML = md.render(content);
  }, [content]);

  return (
    <section className="preview-section" id="preview-section">
      <div className="preview-header">
        <h2>Preview</h2>
      </div>
      <div id="preview-container" className="preview-container" ref={previewRef} />
    </section>
  );
}

export default Preview;