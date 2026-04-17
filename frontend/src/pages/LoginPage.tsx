/**
 * World Pieces — Login page.
 * GitHub OAuth only. Redirects within the same tab (no popup).
 */
import React from 'react';
import {
  IonContent, IonPage, IonButton, IonIcon,
} from '@ionic/react';
import { logoGithub } from 'ionicons/icons';
import { authApi } from '../services/api';

const LoginPage: React.FC = () => {
  const handleGitHubLogin = () => {
    // Navigate in the same tab — no new window opened
    window.location.href = authApi.githubLoginUrl();
  };

  return (
    <IonPage>
      <IonContent>
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, var(--wp-deep-navy) 0%, var(--wp-slate) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '3rem 2.5rem',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Logo / Brand */}
            <div style={{ marginBottom: '2rem' }}>
              <h1
                style={{
                  color: 'var(--wp-cream)',
                  fontSize: '2.4rem',
                  margin: '0 0 0.25rem 0',
                  fontFamily: 'Merriweather, Georgia, serif',
                }}
              >
                World Pieces
              </h1>
              <p
                style={{
                  color: 'var(--wp-gold)',
                  fontFamily: 'Merriweather Sans, sans-serif',
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Engineering &amp; Physics Learning Platform
              </p>
            </div>

            <p
              style={{
                color: 'rgba(248,244,237,0.75)',
                fontFamily: 'Merriweather, Georgia, serif',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                marginBottom: '2.5rem',
              }}
            >
              Sign in with your GitHub account to access code examples,
              contribute solutions, and post bounties for new content.
            </p>

            <IonButton
              expand="block"
              size="large"
              onClick={handleGitHubLogin}
              style={{
                '--background': '#24292e',
                '--background-hover': '#1a1f24',
                '--color': '#ffffff',
                '--border-radius': '8px',
                fontFamily: 'Merriweather Sans, sans-serif',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              <IonIcon slot="start" icon={logoGithub} />
              Continue with GitHub
            </IonButton>

            <p
              style={{
                color: 'rgba(248,244,237,0.4)',
                fontFamily: 'Merriweather Sans, sans-serif',
                fontSize: '0.75rem',
                marginTop: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              By signing in you agree to our terms of service.
              We only request read access to your public GitHub profile.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
