/**
 * World Pieces — Profile search page.
 */
import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonSearchbar, IonList, IonItem, IonLabel, IonAvatar,
  IonSpinner, IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowForwardOutline } from 'ionicons/icons';
import { profilesApi } from '../services/api';

interface ProfileResult {
  user_id: string;
  display_name: string;
  github_login: string;
  avatar_url: string;
  bio: string;
  working_on: string;
}

const ProfileSearchPage: React.FC = () => {
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await profilesApi.searchProfiles(q);
      setResults(res.data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search Profiles</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '1rem' }}>
          <IonSearchbar
            value={query}
            onIonInput={(e) => handleSearch(e.detail.value ?? '')}
            placeholder="Search by name or GitHub username…"
            debounce={350}
          />

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--wp-text-muted)', padding: '2rem' }}>
              No profiles found for "{query}"
            </p>
          )}

          {!loading && results.length > 0 && (
            <IonList style={{ borderRadius: '8px', overflow: 'hidden' }}>
              {results.map((p) => (
                <IonItem
                  key={p.user_id}
                  button
                  detail={false}
                  onClick={() => history.push(`/app/profiles/${p.user_id}`)}
                >
                  <IonAvatar slot="start">
                    <img src={p.avatar_url} alt={p.display_name} />
                  </IonAvatar>
                  <IonLabel>
                    <h2 style={{ fontFamily: 'Merriweather, serif' }}>{p.display_name}</h2>
                    <p className="sans" style={{ fontSize: '0.8rem', color: 'var(--wp-text-muted)' }}>
                      @{p.github_login}
                    </p>
                    {p.working_on && (
                      <p style={{ fontSize: '0.82rem' }}>Working on: {p.working_on}</p>
                    )}
                  </IonLabel>
                  <IonIcon slot="end" icon={arrowForwardOutline} color="medium" />
                </IonItem>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileSearchPage;
