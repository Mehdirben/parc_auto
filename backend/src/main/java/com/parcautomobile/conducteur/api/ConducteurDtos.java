package com.parcautomobile.conducteur.api;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.parcautomobile.conducteur.domain.ActionConducteur;

public final class ConducteurDtos {
    private static final String TELEPHONE_MAROCAIN = "^$|^(?:\\+212|0)[5-7][0-9]{8}$";

    private ConducteurDtos() {}

    public record EnregistrerConducteurRequest(
            @NotBlank(message = "Le matricule est obligatoire")
            @Size(max = 20, message = "Le matricule ne doit pas dépasser 20 caractères")
            String matricule,
            @NotBlank(message = "Le nom complet est obligatoire")
            @Size(max = 80, message = "Le nom complet ne doit pas dépasser 80 caractères")
            String nomComplet,
            @Pattern(regexp = TELEPHONE_MAROCAIN,
                    message = "Le téléphone doit être un numéro marocain, par exemple 0612345678 ou +212612345678")
            String telephone,
            @NotBlank(message = "Le numéro de permis est obligatoire")
            @Size(max = 50, message = "Le numéro de permis ne doit pas dépasser 50 caractères")
            String numeroPermis,
            @NotNull(message = "La date de validité du permis est obligatoire")
            @FutureOrPresent(message = "Le permis doit être en cours de validité")
            LocalDate dateValiditePermis) {}

    public record ChangerStatutRequest(
            @NotNull(message = "Le statut est obligatoire") Boolean actif) {}

    public record ConducteurListeResponse(
            String matricule,
            String nomComplet,
            String telephone,
            String numeroPermis,
            LocalDate dateValiditePermis,
            boolean actif,
            LocalDateTime dateCreation,
            String creePar) {}

    public record AffectationResponse(
            String immatriculation,
            String marqueModele,
            String service,
            LocalDate dateDebut,
            LocalDate dateFin) {}

    public record EvenementResponse(
            ActionConducteur action,
            LocalDateTime dateEvenement,
            String utilisateur) {}

    public record ConducteurDetailResponse(
            String matricule,
            String nomComplet,
            String telephone,
            String numeroPermis,
            LocalDate dateValiditePermis,
            boolean actif,
            List<AffectationResponse> vehiculesActuels,
            List<AffectationResponse> historiqueAffectations,
            List<EvenementResponse> historique,
            LocalDateTime dateCreation,
            String creePar,
            LocalDateTime dateModification,
            String modifiePar) {}

    public record ConducteurStatistiquesResponse(
            long total,
            long actifs,
            long inactifs,
            long permisExpires,
            long permisExpirantBientot) {}
}
