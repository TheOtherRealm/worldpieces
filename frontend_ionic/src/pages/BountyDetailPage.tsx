/**
 * World Pieces — Bounty detail page.
 * Shows full bounty info and GitHub Sponsors funding link.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonChip, IonLabel, IonSpinner, IonToast, IonAlert, IonBadge,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { logoGithub, trashOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { bountiesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getDisciplineBadgeClass, getDisciplineLabel } from '../utils/disciplines';

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
  github_sponsors_url?: string;
  created_at: string;
  tags: string[];
}

const BountyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user, isAuthenticated } = useAuthStore();

  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    bountiesApi
      .get(id)
      .then((res) => setBounty(res.data))
      .catch(() => setToast('Failed to load bounty'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await bountiesApi.delete(id);
      history.replace('/app/bounties');
    } catch {
      setToast('Could not delete bounty');
    }
  };

  const handleMarkFulfilled = async () => {
    try {
      await bountiesApi.update(id, { status: 'fulfilled' });
      setToast('Bounty marked as fulfilled');
      setBounty((prev) => prev ? { ...prev, status: 'fulfilled' } : prev);
    } catch {
      setToast('Could not update bounty');
    }
  };

  const canManage =
    isAuthenticated &&
    bounty &&
    (user?.github_login === bounty.sponsor_github_login || user?.is_admin);

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

  if (!bounty) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p style={{ padding: '2rem', textAlign: 'center' }}>Bounty not found.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/bounties" />
          </IonButtons>
          <IonTitle style={{ fontSize: '0.95rem' }}>{bounty.title}</IonTitle>
          {canManage && (
            <IonButtons slot="end">
              <IonButton color="danger" onClick={() => setShowDeleteAlert(true)}>
                <IonIcon slot="icon-only" icon={trashOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          {/* Amount badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span
              style={{
                background: 'var(--wp-gold)',
                color: 'var(--wp-deep-navy)',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                fontFamily: 'Merriweather Sans, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              ${bounty.amount_usd?.toLocaleString() ?? '?'} USD
            </span>
            {bounty.discipline && (
              <span
                className={`wp-badge ${getDisciplineBadgeClass(bounty.discipline)}`}
                style={{ marginLeft: '0.75rem' }}
              >
                {getDisciplineLabel(bounty.discipline)}
              </span>
            )}
            <IonBadge
              color={bounty.status === 'open' ? 'success' : bounty.status === 'fulfilled' ? 'medium' : 'warning'}
              style={{ marginLeft: '0.75rem', fontFamily: 'Merriweather Sans, sans-serif' }}
            >
              {bounty.status}
            </IonBadge>
          </div>

          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.7rem' }}>{bounty.title}</h1>
          <p
            className="sans"
            style={{ color: 'var(--wp-text-muted)', fontSize: '0.82rem', margin: '0 0 1.5rem 0' }}
          >
            Posted by @{bounty.sponsor_github_login} ·{' '}
            {new Date(bounty.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>

          {/* Description */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1rem' }}>Description</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {bounty.description.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
              ))}
            </IonCardContent>
          </IonCard>

          {/* Tags */}
          {bounty.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', margin: '1rem 0' }}>
              {bounty.tags.map((tag) => (
                <IonChip key={tag} outline style={{ fontSize: '0.72rem' }}>
                  <IonLabel>{tag}</IonLabel>
                </IonChip>
              ))}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              background: 'var(--wp-cream-dark)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginTop: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>
              Fulfill this Bounty
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--wp-text-muted)', margin: '0 0 1rem 0' }}>
              Create or link an example that addresses this problem. Once accepted,
              the sponsor will process payment through GitHub Sponsors.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {isAuthenticated && (
                <IonButton
                  color="primary"
                  onClick={() =>
                    history.push(
                      `/app/examples/new?bounty_id=${bounty.id}&discipline=${bounty.discipline ?? ''}`
                    )
                  }
                >
                  Create Example for This Bounty
                </IonButton>
              )}
              {bounty.github_sponsors_url && (
                <IonButton
                  fill="outline"
                  color="dark"
                  href={bounty.github_sponsors_url}
                  target="_blank"
                >
                  <IonIcon slot="start" icon={logoGithub} />
                  View on GitHub Sponsors
                </IonButton>
              )}
            </div>
          </div>

          {/* Owner controls */}
          {canManage && bounty.status === 'open' && (
            <div style={{ marginTop: '1rem' }}>
              <IonButton
                expand="block"
                color="success"
                fill="outline"
                onClick={handleMarkFulfilled}
              >
                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                Mark as Fulfilled
              </IonButton>
            </div>
          )}
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={2500}
          onDidDismiss={() => setToast('')}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          header="Delete Bounty"
          message="Are you sure you want to delete this bounty? This cannot be undone."
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

export default BountyDetailPage;
