package com.parcautomobile.modele.api;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.parcautomobile.shared.audit.AuditDtos.EvenementAuditResponse;

public final class ModeleDtos {
    private ModeleDtos() {}

    public record AjouterModelesRequest(
            @NotNull(message = "La liste des modèles est obligatoire")
            @Size(min = 1, message = "Au moins un modèle est obligatoire")
            List<@NotBlank(message = "Le nom du modèle ne peut pas être vide")
                 @Size(max = 80, message = "Le nom du modèle ne doit pas dépasser 80 caractères") String> noms) {}

    public record ModifierModeleRequest(
            @NotBlank(message = "Le nom du modèle est obligatoire")
            @Size(max = 80, message = "Le nom du modèle ne doit pas dépasser 80 caractères")
            String nom) {}

    public record ModeleResponse(UUID id, String nom) {}

    public record ModeleListeResponse(
            UUID id,
            String nom,
            String marqueCode,
            String marqueDesignation,
            LocalDateTime dateCreation,
            String creePar) {}

    public record ModeleDetailResponse(
            UUID id,
            String nom,
            String marqueCode,
            String marqueDesignation,
            List<EvenementAuditResponse> historique,
            LocalDateTime dateCreation,
            String creePar,
            LocalDateTime dateModification,
            String modifiePar) {}
}
