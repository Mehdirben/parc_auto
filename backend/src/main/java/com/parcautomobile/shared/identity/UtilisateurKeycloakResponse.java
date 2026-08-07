package com.parcautomobile.shared.identity;

import java.util.List;

public record UtilisateurKeycloakResponse(
        String id,
        String nomUtilisateur,
        String prenom,
        String nom,
        String email,
        boolean actif,
        List<String> roles) {}
