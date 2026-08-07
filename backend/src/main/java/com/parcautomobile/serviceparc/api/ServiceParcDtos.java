package com.parcautomobile.serviceparc.api;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.parcautomobile.serviceparc.domain.ActionServiceParc;
import com.parcautomobile.serviceparc.domain.TypeServiceParc;

public final class ServiceParcDtos {
    private ServiceParcDtos() {}

    public record CreerServiceParcRequest(
            @NotBlank(message = "Le code est obligatoire")
            @Size(max = 20, message = "Le code ne doit pas dépasser 20 caractères")
            @Pattern(regexp = "[A-Za-z0-9_-]+", message = "Le code ne peut contenir que des lettres, chiffres, tirets ou tirets bas")
            String code,
            @NotBlank(message = "Le libellé est obligatoire")
            @Size(max = 100, message = "Le libellé ne doit pas dépasser 100 caractères")
            String libelle,
            @NotNull(message = "Le type est obligatoire")
            TypeServiceParc type) {}

    public record ModifierServiceParcRequest(
            @NotBlank(message = "Le code est obligatoire")
            @Size(max = 20, message = "Le code ne doit pas dépasser 20 caractères")
            @Pattern(regexp = "[A-Za-z0-9_-]+", message = "Le code ne peut contenir que des lettres, chiffres, tirets ou tirets bas")
            String code,
            @NotBlank(message = "Le libellé est obligatoire")
            @Size(max = 100, message = "Le libellé ne doit pas dépasser 100 caractères")
            String libelle,
            @NotNull(message = "Le type est obligatoire")
            TypeServiceParc type) {}

    public record ChangerStatutRequest(@NotNull(message = "Le statut est obligatoire") Boolean actif) {}

    public record ServiceParcListeResponse(
            String code,
            String libelle,
            TypeServiceParc type,
            boolean actif,
            LocalDateTime dateCreation,
            String creePar) {}

    public record VehiculeRattacheResponse(String immatriculation, String marqueModele) {}

    public record EvenementResponse(
            ActionServiceParc action,
            LocalDateTime dateEvenement,
            String utilisateur) {}

    public record ServiceParcDetailResponse(
            String code,
            String libelle,
            TypeServiceParc type,
            boolean actif,
            List<VehiculeRattacheResponse> vehicules,
            List<EvenementResponse> historique,
            LocalDateTime dateCreation,
            String creePar,
            LocalDateTime dateModification,
            String modifiePar) {}

    public record ServiceParcStatistiquesResponse(
            long total,
            long actifs,
            long directions,
            long parcsCommuns) {}
}
