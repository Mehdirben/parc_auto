import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { KEYCLOAK, KEYCLOAK_ERROR } from './app/tokens';
import { environment } from './environments/environment';
import Keycloak from 'keycloak-js';

// Instantiate Keycloak client using environment-driven configuration
const keycloak = new Keycloak({
  url: environment.keycloakUrl,
  realm: environment.realm,
  clientId: environment.clientId
});

// Initialize Keycloak before bootstrapping the Angular application.
//
// `check-sso` only checks whether a session already exists; it does NOT
// force a redirect to Keycloak when unauthenticated. This lets you preview
// the SPA without being bounced to Keycloak. For production, flip this back
// to 'login-required' so every visitor must authenticate.
keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false   // Disable background session-status iframe (avoids CSP frame blocks)
})
  .then((authenticated: boolean) => {
    if (authenticated) {
      console.log('Keycloak authentication successful');
    } else {
      console.info('No active Keycloak session; bootstrapping public shell.');
    }

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
