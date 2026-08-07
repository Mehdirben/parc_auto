package com.parcautomobile.profil.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProfilDtos {
    private ProfilDtos() {}

    public record ModifierProfilRequest(
            @NotBlank @Size(max = 100) String prenom,
            @NotBlank @Size(max = 100) String nom,
            @NotBlank @Email @Size(max = 180) String email) {}
}
