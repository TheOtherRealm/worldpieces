/**
 * World Pieces — Example detail page.
 * Displays: problem summary, detailed solution, syntax-highlighted Python code,
 * VS Code download button, and Google Colab launch button.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonButton, IonIcon, IonChip,
  IonLabel, IonSpinner, IonToast, IonAlert,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { createOutline, checkmarkCircleOutline, trashOutline } from 'ionicons/icons';
import { examplesApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  getDiscipline,
  getDisciplineBadgeClass,
  getDifficultyBadgeClass,
} from '../../utils/disciplines';
import CodeBlock from '../../components/code/CodeBlock';

interface ExampleFull {
  id: string;
  title: string;
  slug: string;
  discipline: string;
  discipline_label: string;
  problem_summary: string;
  solution_explanation: string;
  python_code: string;
  tags: string[];
  difficulty: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  colab_url?: string;
  created_at: string;
  updated_at: string;
  edit_history: Array<{ editor_name: string; edited_at: string }>;
}

const ExampleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user, isAuthenticated } = useAuthStore();

  const [example, setExample] = useState<ExampleFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    examplesApi
      .get(id)
      .then((res) => setExample(res.data))
      .catch(() => setToast('Failed to load example'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkSolved = async () => {
    if (!isAuthenticated) { history.push('/login'); return; }
    try {
      await examplesApi.markSolved(id);
      setToast('Marked as solved! Added to your profile.');
    } catch {
      setToast('Could not mark as solved');
    }
  };

  const handleDelete = async () => {
    try {
      await examplesApi.delete(id);
      history.replace(`/app/disciplines/${example?.discipline}`);
    } catch {
      setToast('Could not delete example');
    }
  };

  const canEdit =
    isAuthenticated &&
    example &&
    (user?.id === example.author_id || user?.is_admin);

  const meta = example ? getDiscipline(example.discipline) : undefined;

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Loading…</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!example) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p style={{ padding: '2rem', textAlign: 'center' }}>Example not found.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/app/disciplines/${example.discipline}`} />
          </IonButtons>
          <IonTitle style={{ fontSize: '0.95rem' }}>{example.title}</IonTitle>
          {canEdit && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/app/examples/${id}/edit`)}>
                <IonIcon slot="icon-only" icon={createOutline} />
              </IonButton>
              <IonButton color="danger" onClick={() => setShowDeleteAlert(true)}>
                <IonIcon slot="icon-only" icon={trashOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className={`wp-badge ${getDisciplineBadgeClass(example.discipline)}`}>
                {example.discipline_label}
              </span>
              <span className={`wp-badge ${getDifficultyBadgeClass(example.difficulty)}`}>
                {example.difficulty}
              </span>
            </div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>{example.title}</h1>
            <p
              className="sans"
              style={{ fontSize: '0.82rem', color: 'var(--wp-text-muted)', margin: 0 }}
            >
              By {example.author_name} ·{' '}
              {new Date(example.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
              {example.edit_history.length > 0 &&
                ` · Last edited by ${example.edit_history[example.edit_history.length - 1].editor_name}`}
            </p>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {example.tags.map((tag) => (
                <IonChip key={tag} outline style={{ fontSize: '0.72rem' }}>
                  <IonLabel>{tag}</IonLabel>
                </IonChip>
              ))}
            </div>
          </div>

          {/* Problem Summary */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 className="wp-section-title">Problem Summary</h2>
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--wp-border)',
                borderLeft: `4px solid ${meta?.color ?? 'var(--wp-teal)'}`,
                borderRadius: '0 8px 8px 0',
                padding: '1.25rem 1.5rem',
              }}
            >
              <p style={{ margin: 0, lineHeight: 1.8 }}>{example.problem_summary}</p>
            </div>
          </section>

          {/* Solution Explanation */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 className="wp-section-title">Detailed Solution</h2>
            <div style={{ lineHeight: 1.9 }}>
              {example.solution_explanation.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
              ))}
            </div>
          </section>

          {/* Python Code */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 className="wp-section-title">Python Code Example</h2>
            <CodeBlock
              code={example.python_code}
              title={example.slug}
              language="python"
            />
          </section>

          {/* Actions */}
          <div
            style={{
              background: 'var(--wp-cream-dark)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <IonButton
              color="success"
              fill="solid"
              onClick={handleMarkSolved}
            >
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              Mark as Solved
            </IonButton>
            <IonButton
              fill="outline"
              color="primary"
              onClick={() => history.push(`/app/bounties?example_id=${example.id}`)}
            >
              View Related Bounties
            </IonButton>
          </div>
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={2500}
          onDidDismiss={() => setToast('')}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          header="Delete Example"
          message="Are you sure you want to permanently delete this example? This cannot be undone."
          buttons={[
            { text: 'Cancel', role: 'cancel', handler: () => setShowDeleteAlert(false) },
            { text: 'Delete', role: 'destructive', handler: handleDelete },
          ]}
          onDidDismiss={() => setShowDeleteAlert(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ExampleDetailPage;
