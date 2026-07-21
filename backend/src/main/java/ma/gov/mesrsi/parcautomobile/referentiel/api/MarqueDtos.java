package ma.gov.mesrsi.parcautomobile.referentiel.api;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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

    public record MarqueListeResponse(
            String code,
            String designation,
            long nombreModeles,
            LocalDateTime dateCreation,
            String creePar) {}

    public record MarqueDetailResponse(
            String code,
            String designation,
            List<ModeleResponse> modeles,
            LocalDateTime dateCreation,
            String creePar,
            LocalDateTime dateModification,
            String modifiePar) {}

    public record MarqueStatistiquesResponse(long totalMarques, long totalModeles) {}
}

