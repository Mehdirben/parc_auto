package com.parcautomobile.profil.api;

import static com.parcautomobile.profil.api.ProfilDtos.ModifierProfilRequest;

import jakarta.validation.Valid;
import com.parcautomobile.profil.service.ProfilKeycloakService;
import com.parcautomobile.shared.identity.UtilisateurKeycloakResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profil")
public class ProfilController {
    private final ProfilKeycloakService profils;

    public ProfilController(ProfilKeycloakService profils) {
        this.profils = profils;
    }

    @GetMapping
    UtilisateurKeycloakResponse consulter(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String bearer,
            @AuthenticationPrincipal Jwt jwt) {
        return profils.consulter(bearer, jwt);
    }

    @PutMapping
    UtilisateurKeycloakResponse modifier(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String bearer,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ModifierProfilRequest request) {
        return profils.modifier(bearer, jwt, request);
    }
}
