/**
 * World Pieces — Root application component.
 */
import React, { useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, IonSpinner, setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  homeOutline, bookOutline, personOutline,
  searchOutline, cashOutline, settingsOutline,
} from "ionicons/icons";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

import HomePage from "./pages/HomePage";
import DisciplinesPage from "./pages/DisciplinesPage";
import DisciplineDetailPage from "./pages/disciplines/DisciplineDetailPage";
import ExampleDetailPage from "./pages/examples/ExampleDetailPage";
import ExampleEditorPage from "./pages/examples/ExampleEditorPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileDetailPage from "./pages/ProfileDetailPage";
import ProfileSearchPage from "./pages/ProfileSearchPage";
import BountiesPage from "./pages/BountiesPage";
import BountyDetailPage from "./pages/BountyDetailPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { useAuthStore } from "./store/authStore";

setupIonicReact({ mode: "md" });

const App: React.FC = () => {
  const { isLoading, isAuthenticated, restoreSession } = useAuthStore();
  useEffect(() => { restoreSession(); }, [restoreSession]);

  if (isLoading) {
    return (
      <IonApp>
        <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"var(--wp-deep-navy)", flexDirection:"column", gap:"1rem" }}>
          <IonSpinner name="crescent" color="light" style={{ transform:"scale(1.5)" }} />
          <p style={{ color:"var(--wp-cream)", fontFamily:"Merriweather, serif", margin:0 }}>World Pieces</p>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main-outlet">
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/auth-callback" component={AuthCallbackPage} />
          <Route path="/app">
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/app/home" component={HomePage} />
                <Route exact path="/app/disciplines" component={DisciplinesPage} />
                <Route exact path="/app/disciplines/:discipline" component={DisciplineDetailPage} />
                <Route exact path="/app/examples/new" component={ExampleEditorPage} />
                <Route exact path="/app/examples/:id/edit" component={ExampleEditorPage} />
                <Route exact path="/app/examples/:id" component={ExampleDetailPage} />
                <Route exact path="/app/profile" component={ProfilePage} />
                <Route exact path="/app/profile/search" component={ProfileSearchPage} />
                <Route exact path="/app/profiles/:userId" component={ProfileDetailPage} />
                <Route exact path="/app/bounties" component={BountiesPage} />
                <Route exact path="/app/bounties/:id" component={BountyDetailPage} />
                <Route exact path="/app/settings" component={SettingsPage} />
                <Redirect exact from="/app" to="/app/home" />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/app/home"><IonIcon icon={homeOutline} /><IonLabel>Home</IonLabel></IonTabButton>
                <IonTabButton tab="disciplines" href="/app/disciplines"><IonIcon icon={bookOutline} /><IonLabel>Learn</IonLabel></IonTabButton>
                <IonTabButton tab="search" href="/app/profile/search"><IonIcon icon={searchOutline} /><IonLabel>Search</IonLabel></IonTabButton>
                <IonTabButton tab="bounties" href="/app/bounties"><IonIcon icon={cashOutline} /><IonLabel>Bounties</IonLabel></IonTabButton>
                {isAuthenticated
                  ? <IonTabButton tab="profile" href="/app/profile"><IonIcon icon={personOutline} /><IonLabel>Profile</IonLabel></IonTabButton>
                  : <IonTabButton tab="login" href="/login"><IonIcon icon={personOutline} /><IonLabel>Sign In</IonLabel></IonTabButton>}
                <IonTabButton tab="settings" href="/app/settings"><IonIcon icon={settingsOutline} /><IonLabel>Settings</IonLabel></IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>
          <Redirect exact from="/" to="/app/home" />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
