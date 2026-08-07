package com.parcautomobile.administration.api;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.parcautomobile.audit.domain.ResultatAudit;

public final class AdministrationDtos {
    private AdministrationDtos() {}

    public record EnregistrerUtilisateurRequest(
            @NotBlank @Size(max = 100) String nomUtilisateur,
            @NotBlank @Size(max = 100) String prenom,
            @NotBlank @Size(max = 100) String nom,
            @NotBlank @Email @Size(max = 180) String email,
            boolean actif,
            @NotBlank String role,
            @Size(max = 100) String motDePasse) {}

    public record JournalAuditResponse(
            UUID id,
            String utilisateur,
            LocalDateTime dateAction,
            String action,
            String entite,
            String entiteId,
            String anciennesValeurs,
            String nouvellesValeurs,
            String adresseIp,
            ResultatAudit resultat) {}
}
