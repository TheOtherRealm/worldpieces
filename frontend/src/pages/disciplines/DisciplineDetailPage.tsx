/**
 * World Pieces — Discipline detail page.
 * Lists all examples for a given discipline with filtering.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonSearchbar, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonChip, IonLabel, IonSpinner,
  IonFab, IonFabButton,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { addOutline, arrowForwardOutline } from 'ionicons/icons';
import { getDiscipline, getDifficultyBadgeClass } from '../../utils/disciplines';
import { examplesApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface Example {
  id: string;
  title: string;
  slug: string;
  discipline: string;
  discipline_label: string;
  tags: string[];
  difficulty: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

const DisciplineDetailPage: React.FC = () => {
  const { discipline } = useParams<{ discipline: string }>();
  const history = useHistory();
  const { isAuthenticated } = useAuthStore();
  const meta = getDiscipline(discipline);

  const [examples, setExamples] = useState<Example[]>([]);
  const [filtered, setFiltered] = useState<Example[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examplesApi
      .listByDiscipline(discipline)
      .then((res) => {
        setExamples(res.data);
        setFiltered(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [discipline]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(examples);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      examples.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      )
    );
  }, [search, examples]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/disciplines" />
          </IonButtons>
          <IonTitle>{meta?.label ?? discipline}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Discipline header */}
        <div
          className="wp-hero"
          style={{ borderBottom: `4px solid ${meta?.color ?? 'var(--wp-teal)'}` }}
        >
          <h1 style={{ fontSize: '1.7rem' }}>{meta?.label}</h1>
          <p style={{ fontSize: '0.9rem' }}>{meta?.description}</p>
        </div>

        <div style={{ padding: '1rem' }}>
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value ?? '')}
            placeholder="Search examples by title or tag…"
            style={{ marginBottom: '1rem' }}
          />

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--wp-text-muted)' }}>
              <p>No examples found yet.</p>
              {isAuthenticated && (
                <IonButton onClick={() => history.push('/app/examples/new')}>
                  Be the first to contribute
                </IonButton>
              )}
            </div>
          )}

          {filtered.map((ex) => (
            <IonCard
              key={ex.id}
              className="wp-discipline-card"
              onClick={() => history.push(`/app/examples/${ex.id}`)}
              style={{ borderLeft: `4px solid ${meta?.color ?? 'var(--wp-teal)'}` }}
            >
              <IonCardHeader>
                <IonCardSubtitle>
                  <span className={`wp-badge ${getDifficultyBadgeClass(ex.difficulty)}`}>
                    {ex.difficulty}
                  </span>
                  {' '}
                  <span
                    className="sans"
                    style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)' }}
                  >
                    by {ex.author_name}
                  </span>
                </IonCardSubtitle>
                <IonCardTitle style={{ fontSize: '1.05rem', marginTop: '0.3rem' }}>
                  {ex.title}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                  {ex.tags.map((tag) => (
                    <IonChip key={tag} outline style={{ fontSize: '0.72rem' }}>
                      <IonLabel>{tag}</IonLabel>
                    </IonChip>
                  ))}
                </div>
                <IonButton fill="clear" size="small" style={{ paddingLeft: 0 }}>
                  View Example <IonIcon slot="end" icon={arrowForwardOutline} />
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        {isAuthenticated && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton
              color="primary"
              onClick={() => history.push('/app/examples/new')}
            >
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DisciplineDetailPage;
