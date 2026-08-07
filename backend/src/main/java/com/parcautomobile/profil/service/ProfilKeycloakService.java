package com.parcautomobile.profil.service;

import static com.parcautomobile.profil.api.ProfilDtos.ModifierProfilRequest;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.identity.UtilisateurKeycloakResponse;
import com.parcautomobile.shared.security.RoleApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class ProfilKeycloakService {
    private final RestClient client;
    private final String realm;
    private final JournalAuditService journalAudit;

    public ProfilKeycloakService(
            RestClient.Builder builder,
            @Value("${app.keycloak.server-base-url}") String baseUrl,
            @Value("${app.keycloak.realm}") String realm,
            JournalAuditService journalAudit) {
        this.client = builder.baseUrl(baseUrl).build();
        this.realm = realm;
        this.journalAudit = journalAudit;
    }

    public UtilisateurKeycloakResponse consulter(String bearer, Jwt jwt) {
        return versResponse(compte(bearer), jwt);
    }

    public UtilisateurKeycloakResponse modifier(
            String bearer, Jwt jwt, ModifierProfilRequest request) {
        AccountRepresentation avant = compte(bearer);
        Map<String, Object> profil = new LinkedHashMap<>();
        profil.put("username", avant.username());
        profil.put("firstName", request.prenom().trim());
        profil.put("lastName", request.nom().trim());
        profil.put("email", request.email().trim());
        profil.put("attributes", avant.attributes() == null ? Map.of() : avant.attributes());

        try {
            client.post().uri("/realms/{realm}/account/", realm)
                    .header(HttpHeaders.AUTHORIZATION, bearer)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(profil).retrieve().toBodilessEntity();
        } catch (HttpClientErrorException.Conflict exception) {
            throw new ConflictException("Cette adresse e-mail est déjà utilisée.");
        } catch (HttpClientErrorException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new BusinessRuleException(
                        "La session Keycloak n’est plus valable. Reconnectez-vous.");
            }
            throw new BusinessRuleException(
                    "Keycloak a refusé la modification du profil.");
        }

        AccountRepresentation après = compte(bearer);
        journalAudit.journaliser("MODIFICATION", "PROFIL_KEYCLOAK", jwt.getSubject(),
                valeursAudit(avant), valeursAudit(après));
        return versResponse(après, jwt);
    }

    private AccountRepresentation compte(String bearer) {
        try {
            AccountRepresentation compte = client.get()
                    .uri("/realms/{realm}/account/?userProfileMetadata=false", realm)
                    .header(HttpHeaders.AUTHORIZATION, bearer)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve().body(AccountRepresentation.class);
            if (compte == null) {
                throw new BusinessRuleException("Le profil Keycloak est indisponible.");
            }
            return compte;
        } catch (HttpClientErrorException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new BusinessRuleException(
                        "La session Keycloak n’est plus valable. Reconnectez-vous.");
            }
            throw new BusinessRuleException("La consultation du profil Keycloak a échoué.");
        }
    }

    private UtilisateurKeycloakResponse versResponse(AccountRepresentation compte, Jwt jwt) {
        return new UtilisateurKeycloakResponse(
                jwt.getSubject(), compte.username(), compte.firstName(),
                compte.lastName(), compte.email(), true, roles(jwt));
    }

    private List<String> roles(Jwt jwt) {
        Object realmAccessClaim = jwt.getClaim("realm_access");
        if (realmAccessClaim instanceof Map<?, ?> realmAccess
                && realmAccess.get("roles") instanceof Collection<?> roles) {
            List<String> applicatifs = roles.stream().map(String::valueOf)
                    .filter(RoleApplication.TOUS::contains).sorted().toList();
            if (!applicatifs.isEmpty()) return applicatifs;
        }
        return List.of(RoleApplication.CONSULTATION);
    }

    private Map<String, Object> valeursAudit(AccountRepresentation compte) {
        return Map.of(
                "nomUtilisateur", compte.username(),
                "prenom", compte.firstName() == null ? "" : compte.firstName(),
                "nom", compte.lastName() == null ? "" : compte.lastName(),
                "email", compte.email() == null ? "" : compte.email());
    }

    private record AccountRepresentation(
            String username,
            String firstName,
            String lastName,
            String email,
            Map<String, List<String>> attributes) {}
}
