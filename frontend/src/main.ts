import 'zone.js';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { KEYCLOAK, KEYCLOAK_ERROR } from './app/tokens';
import { environment } from './environments/environment';
import Keycloak from 'keycloak-js';

registerLocaleData(localeFr);

// Instantiate Keycloak client using environment-driven configuration
const keycloak = new Keycloak({
  url: environment.keycloakUrl,
  realm: environment.realm,
  clientId: environment.clientId
});

// Check the existing SSO session before bootstrapping. Protected routes
// trigger login through their guards when no session is active.
keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false   // Disable background session-status iframe (avoids CSP frame blocks)
})
  .then(() => {
    bootstrapApplication(AppComponent, {
      providers: [
        ...appConfig.providers,
        { provide: KEYCLOAK, useValue: keycloak }
      ]
    }).catch((err: unknown) => console.error(err));
  })
  .catch((err: unknown) => {
    console.error('Keycloak initialization error:', err);
    // Bootstrap anyway so the user sees the diagnostic error view
    bootstrapApplication(AppComponent, {
      providers: [
        ...appConfig.providers,
        { provide: KEYCLOAK, useValue: null },
        { provide: KEYCLOAK_ERROR, useValue: err }
      ]
    }).catch((e: unknown) => console.error(e));
  });
