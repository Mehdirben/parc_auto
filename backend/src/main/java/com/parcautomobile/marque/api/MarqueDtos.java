package com.parcautomobile.marque.api;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.parcautomobile.modele.api.ModeleDtos.ModeleResponse;
import com.parcautomobile.shared.audit.AuditDtos.EvenementAuditResponse;

public final class MarqueDtos {
    private MarqueDtos() {}

    public record CreerMarqueRequest(
            @NotBlank(message = "La désignation est obligatoire")
            @Size(max = 80, message = "La désignation ne doit pas dépasser 80 caractères")
            String designation,
            List<@NotBlank(message = "Le nom du modèle ne peut pas être vide")
                 @Size(max = 80, message = "Le nom du modèle ne doit pas dépasser 80 caractères") String> modeles) {}

    public record ModifierMarqueRequest(
            @NotBlank(message = "La désignation est obligatoire")
            @Size(max = 80, message = "La désignation ne doit pas dépasser 80 caractères")
            String designation) {}

    public record MarqueListeResponse(
            String code,
            String designation,
            long nombreModeles,
            LocalDateTime dateCreation,
            String creePar) {}

    public record MarqueOptionResponse(String code, String designation) {}

    public record MarqueDetailResponse(
            String code,
            String designation,
            List<ModeleResponse> modeles,
            List<EvenementAuditResponse> historique,
            LocalDateTime dateCreation,
            String creePar,
            LocalDateTime dateModification,
            String modifiePar) {}

    public record MarqueStatistiquesResponse(long totalMarques, long totalModeles) {}
}
