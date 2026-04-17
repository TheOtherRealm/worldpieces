/**
 * World Pieces — Public profile detail page.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonAvatar, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonIcon, IonSpinner, IonButton,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { logoGithub, arrowForwardOutline } from 'ionicons/icons';
import { profilesApi, examplesApi } from '../services/api';
import { getDisciplineBadgeClass, getDisciplineLabel } from '../utils/disciplines';

interface Profile {
  user_id: string;
  display_name: string;
  bio: string;
  github_login: string;
  avatar_url: string;
  working_on: string;
  solved_example_ids: string[];
  contributed_example_ids: string[];
  github_sponsors_url?: string;
}

const ProfileDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profilesApi
      .getProfile(userId)
      .then(async (res) => {
        const p: Profile = res.data;
        setProfile(p);
        if (p.contributed_example_ids?.length) {
          const results = await Promise.allSettled(
            p.contributed_example_ids.slice(0, 6).map((id) => examplesApi.get(id))
          );
          setContributions(
            results
              .filter((r) => r.status === 'fulfilled')
              .map((r) => (r as PromiseFulfilledResult<any>).value.data)
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Profile</IonTitle>
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

  if (!profile) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p style={{ padding: '2rem', textAlign: 'center' }}>Profile not found.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton /></IonButtons>
          <IonTitle>{profile.display_name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <IonAvatar style={{ width: '80px', height: '80px' }}>
              <img src={profile.avatar_url} alt={profile.display_name} />
            </IonAvatar>
            <div>
              <h2 style={{ margin: '0 0 0.2rem 0' }}>{profile.display_name}</h2>
              <p className="sans" style={{ margin: 0, color: 'var(--wp-text-muted)', fontSize: '0.85rem' }}>
                @{profile.github_login}
              </p>
              {profile.github_sponsors_url && (
                <IonButton
                  size="small"
                  fill="outline"
                  color="secondary"
                  href={profile.github_sponsors_url}
                  target="_blank"
                  style={{ marginTop: '0.5rem' }}
                >
                  <IonIcon slot="start" icon={logoGithub} />
                  Sponsor
                </IonButton>
              )}
            </div>
          </div>

          {profile.bio && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1rem' }}>About</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ margin: 0 }}>{profile.bio}</p>
              </IonCardContent>
            </IonCard>
          )}

          {profile.working_on && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1rem' }}>Currently Working On</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ margin: 0 }}>{profile.working_on}</p>
              </IonCardContent>
            </IonCard>
          )}

          <h2 className="wp-section-title" style={{ marginTop: '1.5rem' }}>
            Contributions ({profile.contributed_example_ids?.length ?? 0})
          </h2>
          {contributions.length === 0 ? (
            <p style={{ color: 'var(--wp-text-muted)', fontSize: '0.9rem' }}>No contributions yet.</p>
          ) : (
            <IonList style={{ borderRadius: '8px', overflow: 'hidden' }}>
              {contributions.map((ex) => (
                <IonItem
                  key={ex.id}
                  button
                  detail={false}
                  onClick={() => history.push(`/app/examples/${ex.id}`)}
                >
                  <IonLabel>
                    <h3>{ex.title}</h3>
                    <p>
                      <span className={`wp-badge ${getDisciplineBadgeClass(ex.discipline)}`}>
                        {getDisciplineLabel(ex.discipline)}
                      </span>
                    </p>
                  </IonLabel>
                  <IonIcon slot="end" icon={arrowForwardOutline} color="medium" />
                </IonItem>
              ))}
            </IonList>
          )}

          <p
            className="sans"
            style={{ color: 'var(--wp-text-muted)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}
          >
            {profile.solved_example_ids?.length ?? 0} examples solved
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileDetailPage;
