/**
 * World Pieces — My Profile page.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonLabel, IonTextarea, IonInput,
  IonSpinner, IonToast, IonAvatar, IonChip, IonList,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  createOutline, saveOutline, searchOutline, arrowForwardOutline,
} from 'ionicons/icons';
import { profilesApi, examplesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
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

interface ExampleSummary {
  id: string;
  title: string;
  discipline: string;
  discipline_label: string;
  difficulty: string;
}

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [workingOn, setWorkingOn] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [solvedExamples, setSolvedExamples] = useState<ExampleSummary[]>([]);
  const [contributedExamples, setContributedExamples] = useState<ExampleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profilesApi.getMyProfile();
      const p: Profile = res.data;
      setProfile(p);
      setBio(p.bio ?? '');
      setWorkingOn(p.working_on ?? '');
      setDisplayName(p.display_name ?? '');

      // Load solved examples
      if (p.solved_example_ids?.length) {
        const solved = await Promise.allSettled(
          p.solved_example_ids.slice(0, 10).map((eid) => examplesApi.get(eid))
        );
        setSolvedExamples(
          solved
            .filter((r) => r.status === 'fulfilled')
            .map((r) => (r as PromiseFulfilledResult<any>).value.data)
        );
      }

      // Load contributed examples
      if (p.contributed_example_ids?.length) {
        const contrib = await Promise.allSettled(
          p.contributed_example_ids.slice(0, 10).map((eid) => examplesApi.get(eid))
        );
        setContributedExamples(
          contrib
            .filter((r) => r.status === 'fulfilled')
            .map((r) => (r as PromiseFulfilledResult<any>).value.data)
        );
      }
    } catch {
      setToast('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profilesApi.updateMyProfile({
        display_name: displayName,
        bio,
        working_on: workingOn,
      });
      setToast('Profile updated');
      setEditing(false);
      loadProfile();
    } catch {
      setToast('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonTitle>Profile</IonTitle></IonToolbar></IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Profile</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            color="light"
            onClick={() => history.push('/app/profile/search')}
          >
            <IonIcon slot="icon-only" icon={searchOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <IonAvatar style={{ width: '72px', height: '72px' }}>
              <img
                src={profile?.avatar_url || `https://avatars.githubusercontent.com/u/0?v=4`}
                alt={profile?.display_name}
              />
            </IonAvatar>
            <div>
              {editing ? (
                <IonInput
                  value={displayName}
                  onIonInput={(e) => setDisplayName(e.detail.value ?? '')}
                  style={{ fontFamily: 'Merriweather, serif', fontWeight: 700, fontSize: '1.3rem' }}
                />
              ) : (
                <h2 style={{ margin: 0 }}>{profile?.display_name || user?.name}</h2>
              )}
              <p
                className="sans"
                style={{ margin: 0, color: 'var(--wp-text-muted)', fontSize: '0.85rem' }}
              >
                @{profile?.github_login || user?.github_login}
              </p>
            </div>
            <IonButton
              fill="clear"
              slot="end"
              style={{ marginLeft: 'auto' }}
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
            >
              <IonIcon slot="icon-only" icon={editing ? saveOutline : createOutline} />
            </IonButton>
          </div>

          {/* Bio */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1rem' }}>About Me</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {editing ? (
                <IonTextarea
                  value={bio}
                  onIonInput={(e) => setBio(e.detail.value ?? '')}
                  placeholder="Tell the community about yourself…"
                  autoGrow
                  rows={3}
                />
              ) : (
                <p style={{ margin: 0, color: bio ? 'inherit' : 'var(--wp-text-muted)' }}>
                  {bio || 'No bio yet. Click the edit button to add one.'}
                </p>
              )}
            </IonCardContent>
          </IonCard>

          {/* Currently Working On */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1rem' }}>Currently Working On</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {editing ? (
                <IonTextarea
                  value={workingOn}
                  onIonInput={(e) => setWorkingOn(e.detail.value ?? '')}
                  placeholder="What problem or project are you currently exploring?"
                  autoGrow
                  rows={2}
                />
              ) : (
                <p style={{ margin: 0, color: workingOn ? 'inherit' : 'var(--wp-text-muted)' }}>
                  {workingOn || 'Nothing listed yet.'}
                </p>
              )}
            </IonCardContent>
          </IonCard>

          {editing && (
            <IonButton expand="block" onClick={handleSave} disabled={saving}>
              {saving ? <IonSpinner name="crescent" /> : 'Save Changes'}
            </IonButton>
          )}

          {/* Solved Examples */}
          <h2 className="wp-section-title" style={{ marginTop: '1.5rem' }}>
            Solved Examples ({profile?.solved_example_ids?.length ?? 0})
          </h2>
          {solvedExamples.length === 0 ? (
            <p style={{ color: 'var(--wp-text-muted)', fontSize: '0.9rem' }}>
              No solved examples yet. Mark examples as solved to track your progress.
            </p>
          ) : (
            <IonList style={{ borderRadius: '8px', overflow: 'hidden' }}>
              {solvedExamples.map((ex) => (
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

          {/* Contributed Examples */}
          <h2 className="wp-section-title" style={{ marginTop: '1.5rem' }}>
            Contributed Examples ({profile?.contributed_example_ids?.length ?? 0})
          </h2>
          {contributedExamples.length === 0 ? (
            <p style={{ color: 'var(--wp-text-muted)', fontSize: '0.9rem' }}>
              No contributions yet.{' '}
              <span
                style={{ color: 'var(--wp-teal)', cursor: 'pointer' }}
                onClick={() => history.push('/app/examples/new')}
              >
                Create your first example
              </span>
            </p>
          ) : (
            <IonList style={{ borderRadius: '8px', overflow: 'hidden' }}>
              {contributedExamples.map((ex) => (
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
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={2500}
          onDidDismiss={() => setToast('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
