/**
 * World Pieces — Auth callback page.
 * Receives the JWT token from the backend OAuth redirect and stores it.
 */
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useAuthStore } from '../store/authStore';
import { saveToken } from '../services/api';

const AuthCallbackPage: React.FC = () => {
  const history = useHistory();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      saveToken(token);
      fetchMe().then(() => {
        history.replace('/app/home');
      });
    } else {
      history.replace('/login');
    }
  }, [fetchMe, history]);

  return (
    <IonPage>
      <IonContent>
        <div
          style={{
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--wp-deep-navy)',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <IonSpinner name="crescent" color="light" style={{ transform: 'scale(1.5)' }} />
          <p
            style={{
              color: 'var(--wp-cream)',
              fontFamily: 'Merriweather, serif',
              margin: 0,
            }}
          >
            Signing you in…
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthCallbackPage;
