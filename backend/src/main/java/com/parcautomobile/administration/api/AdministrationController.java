package com.parcautomobile.administration.api;

import static com.parcautomobile.administration.api.AdministrationDtos.*;

import java.net.URI;

import jakarta.validation.Valid;
import com.parcautomobile.administration.service.AdministrationAuditService;
import com.parcautomobile.administration.service.KeycloakAdministrationService;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.identity.UtilisateurKeycloakResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/administration")
public class AdministrationController {
    private final KeycloakAdministrationService keycloak;
    private final AdministrationAuditService audit;

    public AdministrationController(
            KeycloakAdministrationService keycloak, AdministrationAuditService audit) {
        this.keycloak = keycloak;
        this.audit = audit;
    }

    @GetMapping("/utilisateurs")
    PageResponse<UtilisateurKeycloakResponse> utilisateurs(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String bearer,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return keycloak.rechercher(bearer, search, Math.max(0, page),
                Math.min(50, Math.max(1, taille)));
    }

    @PutMapping("/utilisateurs/{id}")
    UtilisateurKeycloakResponse modifierUtilisateur(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String bearer,
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String id,
            @Valid @RequestBody EnregistrerUtilisateurRequest request) {
        return keycloak.modifier(bearer, jwt.getSubject(), id, request);
    }

    @PostMapping("/utilisateurs")
    ResponseEntity<UtilisateurKeycloakResponse> creerUtilisateur(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String bearer,
            @Valid @RequestBody EnregistrerUtilisateurRequest request) {
        UtilisateurKeycloakResponse utilisateur = keycloak.creer(bearer, request);
        return ResponseEntity.created(
                URI.create("/api/v1/administration/utilisateurs/" + utilisateur.id()))
                .body(utilisateur);
    }

    @GetMapping("/journal")
    PageResponse<JournalAuditResponse> journal(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String action,
            @RequestParam(defaultValue = "") String entite,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int taille) {
        return audit.rechercher(search, action, entite, Math.max(0, page),
                Math.min(100, Math.max(1, taille)));
    }
}
