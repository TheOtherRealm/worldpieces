/**
 * World Pieces — Disciplines overview page.
 */
import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonList, IonItem, IonLabel, IonIcon, IonNote,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { chevronForwardOutline } from 'ionicons/icons';
import { DISCIPLINES } from '../utils/disciplines';

const DisciplinesPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Learn</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="wp-hero" style={{ padding: '2rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem' }}>Engineering Disciplines</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Select a discipline to explore real-world code examples with
            detailed solutions.
          </p>
        </div>

        <div style={{ padding: '1rem' }}>
          <IonList style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {DISCIPLINES.map((d) => (
              <IonItem
                key={d.key}
                button
                detail={false}
                onClick={() => history.push(`/app/disciplines/${d.key}`)}
                style={{ '--border-color': 'var(--wp-border)' }}
              >
                <div
                  slot="start"
                  style={{
                    width: '4px',
                    height: '48px',
                    background: d.color,
                    borderRadius: '2px',
                    marginRight: '12px',
                  }}
                />
                <IonLabel>
                  <h2 style={{ fontFamily: 'Merriweather, Georgia, serif', fontWeight: 700 }}>
                    {d.label}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--wp-text-muted)', marginTop: '0.2rem' }}>
                    {d.description.substring(0, 90)}…
                  </p>
                </IonLabel>
                <IonNote slot="end">
                  <IonIcon icon={chevronForwardOutline} color="medium" />
                </IonNote>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DisciplinesPage;
