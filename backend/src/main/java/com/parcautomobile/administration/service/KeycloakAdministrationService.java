package com.parcautomobile.administration.service;

import static com.parcautomobile.administration.api.AdministrationDtos.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.identity.UtilisateurKeycloakResponse;
import com.parcautomobile.shared.security.RoleApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class KeycloakAdministrationService {
    private final RestClient client;
    private final String realm;
    private final JournalAuditService journalAudit;

    public KeycloakAdministrationService(
            RestClient.Builder builder,
            @Value("${app.keycloak.admin-base-url}") String baseUrl,
            @Value("${app.keycloak.realm}") String realm,
            JournalAuditService journalAudit) {
        this.client = builder.baseUrl(baseUrl).build();
        this.realm = realm;
        this.journalAudit = journalAudit;
    }

    public PageResponse<UtilisateurKeycloakResponse> rechercher(
            String bearer, String search, int page, int taille) {
        int first = page * taille;
        UserRepresentation[] utilisateurs = executer(() -> client.get()
                .uri(uri -> uri.path("/{realm}/users")
                        .queryParam("search", search == null ? "" : search)
                        .queryParam("first", first)
                        .queryParam("max", taille)
                        .queryParam("briefRepresentation", true)
                        .build(realm))
                .header(HttpHeaders.AUTHORIZATION, bearer)
                .retrieve().body(UserRepresentation[].class));
        Integer total = executer(() -> client.get()
                .uri(uri -> uri.path("/{realm}/users/count")
                        .queryParam("search", search == null ? "" : search)
                        .build(realm))
                .header(HttpHeaders.AUTHORIZATION, bearer)
                .retrieve().body(Integer.class));

        List<UtilisateurKeycloakResponse> contenu = Arrays.stream(
                        utilisateurs == null ? new UserRepresentation[0] : utilisateurs)
                .map(user -> versResponse(bearer, user))
                .toList();
        long nombre = total == null ? contenu.size() : total;
        int pages = taille == 0 ? 0 : (int) Math.ceil((double) nombre / taille);
        return new PageResponse<>(contenu, page, taille, nombre, pages, page == 0, page + 1 >= pages);
    }

    public UtilisateurKeycloakResponse modifier(
            String bearer, String utilisateurConnecteId, String utilisateurId,
            EnregistrerUtilisateurRequest request) {
        String role = verifierRole(request.role());
        verifierMotDePasseFacultatif(request.motDePasse());
        if (utilisateurId.equals(utilisateurConnecteId)
                && (!request.actif() || !RoleApplication.ADMIN.equals(role))) {
            throw new BusinessRuleException(
                    "Un administrateur ne peut pas désactiver son propre compte ni retirer son propre rôle admin.");
        }

        UserRepresentation utilisateur = utilisateur(bearer, utilisateurId);
        List<RoleRepresentation> anciensRoles = rolesUtilisateur(bearer, utilisateurId);
        Map<String, Object> avant = Map.of(
                "actif", Boolean.TRUE.equals(utilisateur.enabled()),
                "roles", rolesApplicatifs(anciensRoles));

        executerSansResultat(() -> client.put().uri("/{realm}/users/{id}", realm, utilisateurId)
                .header(HttpHeaders.AUTHORIZATION, bearer)
                .body(profil(request))
                .retrieve().toBodilessEntity());
        remplacerRole(bearer, utilisateurId, anciensRoles, role);
        if (request.motDePasse() != null && !request.motDePasse().isBlank()) {
            definirMotDePasse(bearer, utilisateurId, request.motDePasse());
        }

        journalAudit.journaliser("MODIFICATION_HABILITATION", "UTILISATEUR_KEYCLOAK",
                utilisateurId, avant, valeursAudit(request, role));
        return versResponse(bearer, utilisateur(bearer, utilisateurId));
    }

    public UtilisateurKeycloakResponse creer(
            String bearer, EnregistrerUtilisateurRequest request) {
        String role = verifierRole(request.role());
        if (request.motDePasse() == null || request.motDePasse().length() < 8) {
            throw new BusinessRuleException(
                    "Un mot de passe initial d’au moins 8 caractères est obligatoire.");
        }
        ResponseEntity<Void> réponse;
        try {
            réponse = client.post().uri("/{realm}/users", realm)
                    .header(HttpHeaders.AUTHORIZATION, bearer)
                    .body(profil(request)).retrieve().toBodilessEntity();
        } catch (HttpClientErrorException.Conflict exception) {
            throw new ConflictException("Ce nom d’utilisateur ou cette adresse e-mail existe déjà.");
        }
        if (réponse.getHeaders().getLocation() == null) {
            throw new BusinessRuleException("Keycloak n’a pas retourné l’identifiant du nouvel utilisateur.");
        }
        String chemin = réponse.getHeaders().getLocation().getPath();
        String utilisateurId = chemin.substring(chemin.lastIndexOf('/') + 1);
        try {
            remplacerRole(bearer, utilisateurId, List.of(), role);
            definirMotDePasse(bearer, utilisateurId, request.motDePasse());
            UtilisateurKeycloakResponse créé =
                    versResponse(bearer, utilisateur(bearer, utilisateurId));
            journalAudit.journaliser("CREATION", "UTILISATEUR_KEYCLOAK",
                    utilisateurId, null, valeursAudit(request, role));
            return créé;
        } catch (RuntimeException exception) {
            annulerCreation(bearer, utilisateurId);
            throw exception;
        }
    }

    private Map<String, Object> profil(EnregistrerUtilisateurRequest request) {
        return Map.of(
                "username", request.nomUtilisateur().trim(),
                "firstName", request.prenom().trim(),
                "lastName", request.nom().trim(),
                "email", request.email().trim(),
                "emailVerified", true,
                "enabled", request.actif());
    }

    private Map<String, Object> valeursAudit(
            EnregistrerUtilisateurRequest request, String role) {
        return Map.of(
                "nomUtilisateur", request.nomUtilisateur().trim(),
                "prenom", request.prenom().trim(),
                "nom", request.nom().trim(),
                "email", request.email().trim(),
                "actif", request.actif(),
                "roles", List.of(role),
                "motDePasseModifie", request.motDePasse() != null
                        && !request.motDePasse().isBlank());
    }

    private void remplacerRole(
            String bearer, String utilisateurId,
            List<RoleRepresentation> anciensRoles, String role) {
        List<RoleRepresentation> àRetirer = anciensRoles.stream()
                .filter(r -> RoleApplication.TOUS.contains(r.name())).toList();
        if (!àRetirer.isEmpty()) {
            executerSansResultat(() -> client.method(HttpMethod.DELETE)
                    .uri("/{realm}/users/{id}/role-mappings/realm", realm, utilisateurId)
                    .header(HttpHeaders.AUTHORIZATION, bearer)
                    .body(àRetirer).retrieve().toBodilessEntity());
        }
        RoleRepresentation nouveauRole = roleParNom(bearer, role);
        executerSansResultat(() -> client.post()
                .uri("/{realm}/users/{id}/role-mappings/realm", realm, utilisateurId)
                .header(HttpHeaders.AUTHORIZATION, bearer)
                .body(List.of(nouveauRole)).retrieve().toBodilessEntity());
    }

    private void definirMotDePasse(String bearer, String utilisateurId, String motDePasse) {
        executerSansResultat(() -> client.put()
                .uri("/{realm}/users/{id}/reset-password", realm, utilisateurId)
                .header(HttpHeaders.AUTHORIZATION, bearer)
                .body(Map.of("type", "password", "temporary", false, "value", motDePasse))
                .retrieve().toBodilessEntity());
    }

    private void annulerCreation(String bearer, String utilisateurId) {
        try {
            client.delete().uri("/{realm}/users/{id}", realm, utilisateurId)
                    .header(HttpHeaders.AUTHORIZATION, bearer)
                    .retrieve().toBodilessEntity();
        } catch (RuntimeException ignorée) {
            // The original configuration error remains the relevant failure.
        }
    }

    private String verifierRole(String role) {
        String normalisé = role == null ? "" : role.trim().toLowerCase();
        if (!RoleApplication.TOUS.contains(normalisé)) {
            throw new BusinessRuleException("Le rôle applicatif sélectionné est invalide.");
        }
        return normalisé;
    }

    private void verifierMotDePasseFacultatif(String motDePasse) {
        if (motDePasse != null && !motDePasse.isBlank() && motDePasse.length() < 8) {
            throw new BusinessRuleException(
                    "Le nouveau mot de passe doit contenir au moins 8 caractères.");
        }
    }

    private UtilisateurKeycloakResponse versResponse(String bearer, UserRepresentation user) {
        return new UtilisateurKeycloakResponse(user.id(), user.username(), user.firstName(),
                user.lastName(), user.email(), Boolean.TRUE.equals(user.enabled()),
                rolesApplicatifs(rolesUtilisateur(bearer, user.id())));
    }

    private UserRepresentation utilisateur(String bearer, String id) {
        return executer(() -> client.get().uri("/{realm}/users/{id}", realm, id)
                .header(HttpHeaders.AUTHORIZATION, bearer).retrieve()
                .body(UserRepresentation.class));
    }

    private List<RoleRepresentation> rolesUtilisateur(String bearer, String id) {
        RoleRepresentation[] roles = executer(() -> client.get()
                .uri("/{realm}/users/{id}/role-mappings/realm", realm, id)
                .header(HttpHeaders.AUTHORIZATION, bearer).retrieve()
                .body(RoleRepresentation[].class));
        return Arrays.asList(roles == null ? new RoleRepresentation[0] : roles);
    }

    private RoleRepresentation roleParNom(String bearer, String nom) {
        return executer(() -> client.get().uri("/{realm}/roles/{role}", realm, nom)
                .header(HttpHeaders.AUTHORIZATION, bearer).retrieve()
                .body(RoleRepresentation.class));
    }

    private List<String> rolesApplicatifs(List<RoleRepresentation> roles) {
        return roles.stream().map(RoleRepresentation::name)
                .filter(RoleApplication.TOUS::contains).sorted().toList();
    }

    private <T> T executer(Appel<T> appel) {
        try {
            return appel.exécuter();
        } catch (HttpClientErrorException.Forbidden exception) {
            throw new BusinessRuleException(
                    "Keycloak refuse l’opération. Le rôle admin doit disposer de manage-users, view-users, query-users et view-realm.");
        } catch (HttpClientErrorException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new BusinessRuleException(
                        "Le jeton Keycloak n’est plus valable pour l’administration. Renouvelez la session.");
            }
            throw new BusinessRuleException("La consultation de Keycloak a échoué.");
        }
    }

    private void executerSansResultat(AppelSansRésultat appel) {
        executer(() -> {
            appel.exécuter();
            return null;
        });
    }

    @FunctionalInterface
    private interface Appel<T> { T exécuter(); }
    @FunctionalInterface
    private interface AppelSansRésultat { void exécuter(); }

    private record UserRepresentation(
            String id, String username, String firstName, String lastName,
            String email, Boolean enabled) {}
    private record RoleRepresentation(String id, String name) {}
}
