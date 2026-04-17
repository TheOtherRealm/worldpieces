/**
 * World Pieces — Bounties listing page.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonButton, IonIcon, IonSpinner,
  IonFab, IonFabButton, IonChip, IonLabel, IonSearchbar,
  IonSelect, IonSelectOption, IonItem,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { addOutline, arrowForwardOutline, cashOutline } from 'ionicons/icons';
import { bountiesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getDisciplineBadgeClass, getDisciplineLabel, DISCIPLINES } from '../utils/disciplines';

interface Bounty {
  id: string;
  title: string;
  description: string;
  amount_usd: number;
  discipline?: string;
  example_id?: string;
  status: string;
  sponsor_github_login: string;
  sponsor_name: string;
  created_at: string;
  tags: string[];
}

const BountiesPage: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated } = useAuthStore();

  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [filtered, setFiltered] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');

  useEffect(() => {
    bountiesApi
      .list({ status: 'open' })
      .then((res) => {
        setBounties(res.data);
        setFiltered(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = bounties;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }
    if (disciplineFilter) {
      result = result.filter((b) => b.discipline === disciplineFilter);
    }
    setFiltered(result);
  }, [search, disciplineFilter, bounties]);

  const totalUsd = filtered.reduce((sum, b) => sum + (b.amount_usd ?? 0), 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Bounties</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Hero */}
        <div className="wp-hero" style={{ padding: '1.75rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem' }}>Open Bounties</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Fund new examples via GitHub Sponsors. Earn recognition by fulfilling them.
          </p>
          {filtered.length > 0 && (
            <p style={{ color: 'var(--wp-gold)', fontFamily: 'Merriweather Sans, sans-serif', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ${totalUsd.toLocaleString()} in open bounties
            </p>
          )}
        </div>

        <div style={{ padding: '1rem' }}>
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value ?? '')}
            placeholder="Search bounties…"
          />

          <IonItem>
            <IonLabel>Filter by discipline</IonLabel>
            <IonSelect
              value={disciplineFilter}
              onIonChange={(e) => setDisciplineFilter(e.detail.value)}
              placeholder="All disciplines"
            >
              <IonSelectOption value="">All disciplines</IonSelectOption>
              {DISCIPLINES.map((d) => (
                <IonSelectOption key={d.key} value={d.key}>{d.label}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--wp-text-muted)' }}>
              <IonIcon icon={cashOutline} style={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <p>No open bounties found.</p>
              {isAuthenticated && (
                <IonButton onClick={() => history.push('/app/bounties/new')}>
                  Post a Bounty
                </IonButton>
              )}
            </div>
          )}

          {filtered.map((b) => (
            <IonCard
              key={b.id}
              className="wp-discipline-card"
              onClick={() => history.push(`/app/bounties/${b.id}`)}
              style={{ borderLeft: '4px solid var(--wp-gold)' }}
            >
              <IonCardHeader>
                <IonCardSubtitle>
                  <span
                    style={{
                      background: 'var(--wp-gold)',
                      color: 'var(--wp-deep-navy)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontFamily: 'Merriweather Sans, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    ${b.amount_usd?.toLocaleString() ?? '?'} USD
                  </span>
                  {b.discipline && (
                    <span
                      className={`wp-badge ${getDisciplineBadgeClass(b.discipline)}`}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      {getDisciplineLabel(b.discipline)}
                    </span>
                  )}
                </IonCardSubtitle>
                <IonCardTitle style={{ fontSize: '1.05rem', marginTop: '0.3rem' }}>
                  {b.title}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ fontSize: '0.88rem', color: 'var(--wp-text-muted)', margin: '0 0 0.5rem 0' }}>
                  {b.description.substring(0, 120)}{b.description.length > 120 ? '…' : ''}
                </p>
                <p className="sans" style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)', margin: 0 }}>
                  Posted by @{b.sponsor_github_login} ·{' '}
                  {new Date(b.created_at).toLocaleDateString()}
                </p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {b.tags?.map((tag) => (
                    <IonChip key={tag} outline style={{ fontSize: '0.7rem' }}>
                      <IonLabel>{tag}</IonLabel>
                    </IonChip>
                  ))}
                </div>
                <IonButton fill="clear" size="small" style={{ paddingLeft: 0, marginTop: '0.25rem' }}>
                  View Details <IonIcon slot="end" icon={arrowForwardOutline} />
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        {isAuthenticated && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="secondary" onClick={() => history.push('/app/bounties/new')}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BountiesPage;
