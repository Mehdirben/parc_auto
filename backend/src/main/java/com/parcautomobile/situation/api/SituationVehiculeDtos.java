package com.parcautomobile.situation.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.parcautomobile.vehicule.domain.Carburant;
import com.parcautomobile.vehicule.domain.EtatGeneral;
import com.parcautomobile.vehicule.domain.GenreVehicule;
import com.parcautomobile.vehicule.domain.StatutVehicule;

public final class SituationVehiculeDtos {
    private SituationVehiculeDtos() {}

    public record SituationVehiculeResponse(
            int numero,
            String code,
            String immatriculation,
            String marque,
            String type,
            GenreVehicule genre,
            String vin,
            Carburant carburant,
            Integer puissanceFiscale,
            BigDecimal poidsTotalCharge,
            LocalDate dateMiseEnCirculation,
            String affectation,
            String conducteur,
            long kilometrage,
            EtatGeneral observation,
            StatutVehicule statut) {}

    public record LigneApercuImportResponse(
            int ligne,
            String immatriculation,
            String marque,
            String type,
            String vin,
            String action,
            String message) {}

    public record ApercuImportResponse(
            String nomFichier,
            int nombreLignes,
            int nombreCreations,
            int nombreMisesAJour,
            int nombreLignesIgnorees,
            List<LigneApercuImportResponse> lignes) {}

    public record ResultatImportResponse(
            String nomFichier,
            int nombreCreations,
            int nombreMisesAJour,
            int nombreLignesIgnorees,
            List<LigneApercuImportResponse> lignes) {}
}
