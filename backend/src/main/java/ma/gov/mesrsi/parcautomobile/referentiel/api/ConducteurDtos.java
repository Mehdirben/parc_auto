package ma.gov.mesrsi.parcautomobile.referentiel.api;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.Future; // Added missing import
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.ActionConducteur;

public final class ConducteurDtos {
    private ConducteurDtos() {}

   public record CreerConducteurRequest(
    @NotBlank(message = "Le matricule est obligatoire")
    @Size(max = 20, message = "Le matricule ne doit pas dépasser 20 caractères")
    @Pattern(regexp = "^[0-9]{5}\\|\\p{InArabic}\\|[0-9]{2}$", 
         message = "Le matricule doit être au format: 12345|م|58 (5 chiffres|lettre arabe|2 chiffres)")
            String matricule,
            
            @NotBlank(message = "Le nom complet est obligatoire")
            @Size(max = 80, message = "Le nom complet ne doit pas dépasser 80 caractères")
            String nomComplet,
            
            @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
            String telephone,
            
            @NotBlank(message = "Le numéro de permis est obligatoire")
            @Size(max = 50, message = "Le numéro de permis ne doit pas dépasser 50 caractères")
            String numeroPermis,
            
            @NotNull(message = "La date de validité du permis est obligatoire")
            @Future(message = "La date de validité du permis doit être dans le futur") 
            LocalDate dateValiditePermis) {}

    public record ModifierConducteurRequest(
            @NotBlank(message = "Le matricule est obligatoire")
            @Size(max = 20, message = "Le matricule ne doit pas dépasser 20 caractères")
            @Pattern(regexp = "^[0-9]{5}\\|\\p{InArabic}\\|[0-9]{2}$", 
         message = "Le matricule doit être au format: 12345|م|58 (5 chiffres|lettre arabe|2 chiffres)")
            String matricule,
            
            @NotBlank(message = "Le nom complet est obligatoire")
            @Size(max = 80, message = "Le nom complet ne doit pas dépasser 80 caractères")
            String nomComplet,
            
            @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
            String telephone,
            
            @NotBlank(message = "Le numéro de permis est obligatoire")
            @Size(max = 50, message = "Le numéro de permis ne doit pas dépasser 50 caractères")
            String numeroPermis,
            
            @NotNull(message = "La date de validité du permis est obligatoire")
            @Future(message = "La date de validité du permis doit être dans le futur")
            LocalDate dateValiditePermis) {} 

    public record ChangerStatutRequest(
            @NotNull(message = "Le statut est obligatoire") 
            Boolean actif) {}

    public record ConducteurListeResponse(
            String matricule,
            String nomComplet,
            String telephone,
            String numeroPermis,
            LocalDate dateValiditePermis,
            boolean actif,
            LocalDateTime dateCreation,
            String creePar) {}

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
            List<EvenementResponse> historique,
            LocalDateTime dateCreation,
            String creePar,
            LocalDateTime dateModification,
            String modifiePar) {}

    public record ConducteurStatistiquesResponse(
            long total,
            long actifs,
            long inactifs) {}
}