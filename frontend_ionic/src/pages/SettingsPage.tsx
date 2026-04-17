/**
 * World Pieces — Settings page.
 * Shows personal data, GitHub sponsorship management, and account deletion.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonList, IonItem, IonLabel, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonAlert, IonToast, IonToggle, IonNote,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  logoGithub, logOutOutline, trashOutline,
  personOutline, shieldOutline, informationCircleOutline,
} from 'ionicons/icons';
import { profilesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const SettingsPage: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      profilesApi.getMyProfile().then((res) => setProfile(res.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      await profilesApi.deleteMyAccount();
      logout();
      history.replace('/login');
      setToast('Your account has been deleted.');
    } catch {
      setToast('Failed to delete account. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          {/* Account info */}
          {isAuthenticated && user ? (
            <>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1rem' }}>
                    <IonIcon icon={personOutline} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Account Information
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="none">
                    <IonItem>
                      <IonLabel>
                        <p className="sans" style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)', margin: 0 }}>Name</p>
                        <h3>{user.name}</h3>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <p className="sans" style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)', margin: 0 }}>Email</p>
                        <h3>{user.email || 'Not provided'}</h3>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <p className="sans" style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)', margin: 0 }}>GitHub Login</p>
                        <h3>@{user.github_login || 'N/A'}</h3>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <p className="sans" style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)', margin: 0 }}>Member Since</p>
                        <h3>{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <p className="sans" style={{ fontSize: '0.75rem', color: 'var(--wp-text-muted)', margin: 0 }}>User ID</p>
                        <h3 style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '0.8rem' }}>{user.id}</h3>
                      </IonLabel>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              {/* GitHub Sponsors */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1rem' }}>
                    <IonIcon icon={logoGithub} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    GitHub Sponsors
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                    World Pieces uses GitHub Sponsors to process bounty payments.
                    Connect your GitHub Sponsors account to post and receive bounties.
                  </p>
                  {profile?.github_sponsors_url ? (
                    <>
                      <p className="sans" style={{ fontSize: '0.82rem', color: 'var(--wp-text-muted)', marginBottom: '0.75rem' }}>
                        Sponsors URL: <a href={profile.github_sponsors_url} target="_blank" rel="noreferrer">{profile.github_sponsors_url}</a>
                      </p>
                      <IonButton
                        fill="outline"
                        color="dark"
                        href={profile.github_sponsors_url}
                        target="_blank"
                      >
                        <IonIcon slot="start" icon={logoGithub} />
                        Manage on GitHub
                      </IonButton>
                    </>
                  ) : (
                    <>
                      <p className="sans" style={{ fontSize: '0.82rem', color: 'var(--wp-text-muted)', marginBottom: '0.75rem' }}>
                        You have not linked a GitHub Sponsors profile yet.
                      </p>
                      <IonButton
                        fill="outline"
                        color="dark"
                        href={`https://github.com/sponsors/${user.github_login}`}
                        target="_blank"
                      >
                        <IonIcon slot="start" icon={logoGithub} />
                        Set Up GitHub Sponsors
                      </IonButton>
                    </>
                  )}
                </IonCardContent>
              </IonCard>

              {/* Privacy */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1rem' }}>
                    <IonIcon icon={shieldOutline} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Privacy
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ fontSize: '0.88rem', color: 'var(--wp-text-muted)', margin: '0 0 0.75rem 0' }}>
                    World Pieces stores only your public GitHub profile information
                    (name, username, avatar). We never store your GitHub access token
                    beyond the session, and we do not share your data with third parties.
                  </p>
                  <IonButton
                    fill="clear"
                    size="small"
                    href="https://github.com/other-realm/otherus/blob/main/PRIVACY.md"
                    target="_blank"
                  >
                    <IonIcon slot="start" icon={informationCircleOutline} />
                    Privacy Policy
                  </IonButton>
                </IonCardContent>
              </IonCard>

              {/* Session */}
              <IonList style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '1rem' }}>
                <IonItem
                  button
                  detail={false}
                  onClick={() => setShowLogoutAlert(true)}
                  style={{ '--background': '#fff' }}
                >
                  <IonIcon slot="start" icon={logOutOutline} color="medium" />
                  <IonLabel>Sign Out</IonLabel>
                </IonItem>
                <IonItem
                  button
                  detail={false}
                  onClick={() => setShowDeleteAlert(true)}
                  style={{ '--background': '#fff' }}
                >
                  <IonIcon slot="start" icon={trashOutline} color="danger" />
                  <IonLabel color="danger">Delete My Account</IonLabel>
                  <IonNote slot="end" style={{ fontSize: '0.75rem' }}>Permanent</IonNote>
                </IonItem>
              </IonList>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--wp-text-muted)' }}>
                Sign in to view your settings.
              </p>
              <IonButton onClick={() => history.push('/login')}>
                Sign In with GitHub
              </IonButton>
            </div>
          )}

          {/* App info */}
          <div style={{ textAlign: 'center', padding: '2rem 0 1rem', color: 'var(--wp-text-muted)' }}>
            <p className="sans" style={{ fontSize: '0.75rem', margin: 0 }}>
              World Pieces v2.0.0 · Built with Ionic React + FastAPI
            </p>
            <p className="sans" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
              <a
                href="https://github.com/other-realm/otherus"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--wp-teal)' }}
              >
                View Source on GitHub
              </a>
            </p>
          </div>
        </div>

        {/* Alerts */}
        <IonAlert
          isOpen={showLogoutAlert}
          header="Sign Out"
          message="Are you sure you want to sign out?"
          buttons={[
            { text: 'Cancel', role: 'cancel', handler: () => setShowLogoutAlert(false) },
            { text: 'Sign Out', handler: handleLogout },
          ]}
          onDidDismiss={() => setShowLogoutAlert(false)}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          header="Delete Account"
          message="This will permanently delete your account, profile, and all your data. This action cannot be undone. Are you absolutely sure?"
          buttons={[
            { text: 'Cancel', role: 'cancel', handler: () => setShowDeleteAlert(false) },
            {
              text: 'Delete My Account',
              role: 'destructive',
              cssClass: 'danger',
              handler: handleDeleteAccount,
            },
          ]}
          onDidDismiss={() => setShowDeleteAlert(false)}
        />

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={3000}
          onDidDismiss={() => setToast('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
