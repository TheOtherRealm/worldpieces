/**
 * World Pieces — CodeBlock component.
 * Renders Python code with syntax highlighting and one-click launch buttons
 * for VS Code and Google Colab.
 */
import React, { useState } from 'react';
import { IonButton, IonIcon, IonToast } from '@ionic/react';
import { logoGithub, openOutline, copyOutline, checkmarkOutline } from 'ionicons/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { buildColabUrl } from '../../utils/disciplines';

interface CodeBlockProps {
  code: string;
  title: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, title, language = 'python' }) => {
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMsg('Could not copy to clipboard');
    }
  };

  const handleVSCode = () => {
    // Create a downloadable .py file and open it
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.py`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg('Python file downloaded — open in VS Code');
  };

  const handleColab = () => {
    const url = buildColabUrl(code, title);
    // Open Colab in the same tab to avoid popup blockers
    window.location.href = url;
  };

  return (
    <div className="wp-code-block">
      <div className="wp-code-header">
        <span>{title}.py</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <IonButton
            size="small"
            fill="clear"
            color="light"
            onClick={handleCopy}
            title="Copy code"
          >
            <IonIcon
              slot="icon-only"
              icon={copied ? checkmarkOutline : copyOutline}
            />
          </IonButton>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          maxHeight: '480px',
          overflowY: 'auto',
        }}
        showLineNumbers
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>

      <div
        style={{
          background: 'var(--wp-cream-dark)',
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--wp-border)',
        }}
      >
        <p
          className="sans"
          style={{
            fontSize: '0.78rem',
            color: 'var(--wp-text-muted)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Run this example locally or in the cloud:
        </p>
        <div className="wp-code-actions">
          <IonButton
            size="small"
            fill="outline"
            color="dark"
            onClick={handleVSCode}
          >
            <IonIcon slot="start" icon={openOutline} />
            Download for VS Code
          </IonButton>
          <IonButton
            size="small"
            fill="solid"
            color="warning"
            onClick={handleColab}
          >
            <IonIcon slot="start" icon={logoGithub} />
            Open in Google Colab
          </IonButton>
        </div>
      </div>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={2500}
        onDidDismiss={() => setToastMsg('')}
      />
    </div>
  );
};

export default CodeBlock;
