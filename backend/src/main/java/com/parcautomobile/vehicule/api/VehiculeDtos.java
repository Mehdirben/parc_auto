package com.parcautomobile.vehicule.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.parcautomobile.vehicule.domain.*;

public final class VehiculeDtos {
    private VehiculeDtos() {}

    public record CreerVehiculeRequest(
            @NotBlank(message = "L'immatriculation est obligatoire")
            @Size(max = 50, message = "L'immatriculation ne doit pas dépasser 50 caractères")
            @Pattern(
                    regexp = ImmatriculationMarocaine.FORMAT,
                    message = "Saisissez une immatriculation marocaine normale (12345-A-10) ou fonctionnaire (1234567)")
            String immatriculation,
            @Size(max = 50, message = "L'ancienne immatriculation ne doit pas dépasser 50 caractères")
            String ancienneImmatriculation,
            @NotNull(message = "Le modèle est obligatoire")
            UUID modeleId,
            @NotNull(message = "Le genre est obligatoire")
            GenreVehicule genre,
            @NotBlank(message = "Le VIN est obligatoire")
            @Size(max = 50, message = "Le VIN ne doit pas dépasser 50 caractères")
            String vin,
            @NotNull(message = "Le carburant est obligatoire")
            Carburant carburant,
            @Positive(message = "Le nombre de cylindres doit être positif")
            Integer nombreCylindres,
            @Positive(message = "La puissance fiscale doit être positive")
            int puissanceFiscale,
            @Positive(message = "Le poids à vide doit être positif")
            BigDecimal poidsVide,
            @Positive(message = "Le poids total en charge doit être positif")
            BigDecimal poidsTotalCharge,
            @PositiveOrZero(message = "Le kilométrage initial doit être positif ou nul")
            long kilometrageInitial,
            @PastOrPresent(message = "La date de première mise en circulation ne peut pas être future")
            LocalDate datePremiereMiseCirculation,
            @PastOrPresent(message = "La date de mutation ne peut pas être future")
            LocalDate dateMutation,
            @NotNull(message = "Le statut est obligatoire")
            StatutVehicule statut,
            @NotNull(message = "L'état général est obligatoire")
            EtatGeneral etatGeneral) {}

    public record ModifierSituationRequest(
            @NotNull(message = "Le statut est obligatoire") StatutVehicule statut,
            @NotNull(message = "L'état général est obligatoire") EtatGeneral etatGeneral) {}

    public record AjouterReleveRequest(
            @NotNull(message = "La date du relevé est obligatoire")
            @PastOrPresent(message = "La date du relevé ne peut pas être future")
            LocalDate date,
            @PositiveOrZero(message = "Le kilométrage doit être positif ou nul")
            long kilometrage,
            @NotNull(message = "La source est obligatoire")
            SourceReleve source,
            @Size(max = 80, message = "Le commentaire ne doit pas dépasser 80 caractères")
            String commentaire) {}

    public record VehiculeListeResponse(
            String code, String immatriculation, String marque, String modele,
            GenreVehicule genre, Carburant carburant, long kilometrageActuel,
            StatutVehicule statut, EtatGeneral etatGeneral) {}

    public record PieceJointeResponse(
            UUID id, TypePieceJointe typePiece, String nomFichier,
            String typeContenu, long taille, LocalDateTime dateCreation, String creePar) {}

    public record ReleveResponse(
            UUID id, LocalDate date, long kilometrage, SourceReleve source,
            String commentaire, LocalDateTime dateCreation, String creePar) {}

    public record AffectationResponse(
            UUID id, String service, String conducteur, LocalDate dateDebut,
            LocalDate dateFin, LocalDate dateFinPrevue, String motif,
            String typeMission, boolean ordreMissionDisponible) {}

    public record EvenementResponse(
            ActionVehicule action, LocalDateTime dateEvenement, String utilisateur) {}

    public record VehiculeDetailResponse(
            String code, String immatriculation, String ancienneImmatriculation,
            UUID modeleId, String modele, String marqueCode, String marque,
            GenreVehicule genre, String vin, Carburant carburant,
            Integer nombreCylindres, Integer puissanceFiscale,
            BigDecimal poidsVide, BigDecimal poidsTotalCharge,
            long kilometrageInitial, long kilometrageActuel,
            LocalDate datePremiereMiseCirculation, LocalDate dateMutation,
            StatutVehicule statut, EtatGeneral etatGeneral,
            List<PieceJointeResponse> piecesJointes,
            List<ReleveResponse> releves,
            AffectationResponse affectationActuelle,
            List<AffectationResponse> historiqueAffectations,
            List<EvenementResponse> historique,
            LocalDateTime dateCreation, String creePar,
            LocalDateTime dateModification, String modifiePar) {}

    public record VehiculeStatistiquesResponse(
            long total, long disponibles, long affectes,
            long immobilises, long enMaintenance,
            long reformes, long inactifs) {}
}
