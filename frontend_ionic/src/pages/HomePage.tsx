/**
 * World Pieces — Home page.
 */
import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowForwardOutline } from 'ionicons/icons';
import { DISCIPLINES } from '../utils/disciplines';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>World Pieces</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Hero */}
        <div className="wp-hero">
          <h1>World Pieces</h1>
          <p>
            A collaborative platform for learning modern engineering techniques
            grounded in statistics and quantum physics — through real-world,
            runnable code examples.
          </p>
          {!isAuthenticated && (
            <IonButton
              style={{ marginTop: '1.5rem' }}
              color="secondary"
              onClick={() => history.push('/login')}
            >
              Sign in with GitHub
            </IonButton>
          )}
          {isAuthenticated && (
            <p style={{ color: 'var(--wp-gold)', marginTop: '1rem', fontSize: '0.9rem' }}>
              Welcome back, {user?.name}
            </p>
          )}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Disciplines */}
          <h2 className="wp-section-title">Explore Disciplines</h2>
          <IonGrid>
            <IonRow>
              {DISCIPLINES.map((d) => (
                <IonCol size="12" sizeMd="6" sizeLg="4" key={d.key}>
                  <IonCard
                    className="wp-discipline-card"
                    onClick={() => history.push(`/app/disciplines/${d.key}`)}
                    style={{ borderTop: `3px solid ${d.color}` }}
                  >
                    <IonCardHeader>
                      <IonCardSubtitle>
                        <span className={`wp-badge ${d.badgeClass}`}>{d.label}</span>
                      </IonCardSubtitle>
                      <IonCardTitle style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>
                        {d.label}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p style={{ fontSize: '0.9rem', color: 'var(--wp-text-muted)', margin: 0 }}>
                        {d.description}
                      </p>
                      <IonButton
                        fill="clear"
                        size="small"
                        style={{ marginTop: '0.5rem', paddingLeft: 0 }}
                      >
                        View examples <IonIcon slot="end" icon={arrowForwardOutline} />
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          {/* Call to action */}
          <div
            style={{
              background: 'var(--wp-navy)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              marginTop: '1rem',
            }}
          >
            <h3 style={{ color: 'var(--wp-cream)', marginTop: 0 }}>
              Have a problem you want solved?
            </h3>
            <p style={{ color: 'rgba(248,244,237,0.7)', fontSize: '0.9rem' }}>
              Post a monetary bounty via GitHub Sponsors and let the community
              build the example for you.
            </p>
            <IonButton color="secondary" onClick={() => history.push('/app/bounties')}>
              Browse Bounties
            </IonButton>
            {isAuthenticated && (
              <IonButton
                fill="outline"
                color="light"
                style={{ marginLeft: '0.5rem' }}
                onClick={() => history.push('/app/examples/new')}
              >
                Contribute an Example
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
