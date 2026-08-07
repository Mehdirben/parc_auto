package com.parcautomobile.affectation.api;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import com.parcautomobile.affectation.domain.StatutAffectation;

public final class AffectationDtos {
    private AffectationDtos() {}

    public record CreerAffectationRequest(
            @NotNull(message = "Le véhicule est obligatoire") UUID vehiculeId,
            @NotNull(message = "Le service ou parc est obligatoire") UUID serviceParcId,
            @NotNull(message = "Le conducteur est obligatoire") UUID conducteurId,
            @NotNull(message = "La date de début est obligatoire")
            @PastOrPresent(message = "La date de début ne peut pas être future") LocalDate dateDebut,
            @NotBlank(message = "Le motif est obligatoire")
            @Size(max = 500, message = "Le motif ne doit pas dépasser 500 caractères") String motif,
            LocalDate dateFinPrevue,
            @Size(max = 200, message = "Le type de mission ne doit pas dépasser 200 caractères")
            String typeMission) {}

    public record ChangerAffectationRequest(
            @NotNull(message = "Le service ou parc est obligatoire") UUID serviceParcId,
            @NotNull(message = "Le conducteur est obligatoire") UUID conducteurId,
            @NotNull(message = "La date de début est obligatoire")
            @PastOrPresent(message = "La date de début ne peut pas être future") LocalDate dateDebut,
            @NotBlank(message = "Le motif est obligatoire")
            @Size(max = 500, message = "Le motif ne doit pas dépasser 500 caractères") String motif,
            LocalDate dateFinPrevue,
            @Size(max = 200, message = "Le type de mission ne doit pas dépasser 200 caractères")
            String typeMission) {}

    public record RestituerAffectationRequest(
            @NotNull(message = "La date de restitution est obligatoire")
            @PastOrPresent(message = "La date de restitution ne peut pas être future") LocalDate dateRestitution,
            @NotBlank(message = "Le motif de restitution est obligatoire")
            @Size(max = 500, message = "Le motif ne doit pas dépasser 500 caractères") String motif) {}

    public record VehiculeOption(UUID id, String code, String immatriculation, String marqueModele) {}
    public record ServiceParcOption(UUID id, String code, String libelle, boolean parcMission) {}
    public record ConducteurOption(UUID id, String matricule, String nomComplet) {}
    public record OptionsResponse(List<VehiculeOption> vehicules,
                                  List<ServiceParcOption> servicesParcs,
                                  List<ConducteurOption> conducteurs) {}

    public record AffectationResponse(
            UUID id,
            UUID vehiculeId, String vehiculeCode, String immatriculation, String marqueModele,
            UUID serviceParcId, String serviceParcCode, String serviceParcLibelle,
            UUID conducteurId, String conducteurMatricule, String conducteurNom,
            LocalDate dateDebut, LocalDate dateFin, LocalDate dateFinPrevue,
            String motif, String typeMission, boolean ordreMissionDisponible,
            StatutAffectation statut,
            LocalDateTime dateCreation, String creePar) {}

    public record EvenementResponse(
            String action, LocalDateTime dateEvenement, String utilisateur,
            String anciennesValeurs, String nouvellesValeurs) {}

    public record AffectationDetailResponse(
            AffectationResponse affectation,
            List<AffectationResponse> historiqueVehicule,
            List<EvenementResponse> journal) {}
}
