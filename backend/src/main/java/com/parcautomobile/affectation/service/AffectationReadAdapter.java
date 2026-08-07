package com.parcautomobile.affectation.service;

import java.util.List;
import java.util.UUID;

import com.parcautomobile.affectation.domain.Affectation;
import com.parcautomobile.affectation.domain.StatutAffectation;
import com.parcautomobile.affectation.repository.AffectationRepository;
import com.parcautomobile.conducteur.service.ConducteurAffectationReader;
import com.parcautomobile.serviceparc.service.ServiceParcAffectationReader;
import com.parcautomobile.vehicule.service.VehiculeAffectationReader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional(readOnly = true)
public class AffectationReadAdapter
        implements VehiculeAffectationReader, ConducteurAffectationReader,
        ServiceParcAffectationReader {
    private final AffectationRepository affectations;

    public AffectationReadAdapter(AffectationRepository affectations) {
        this.affectations = affectations;
    }

    @Override
    public List<com.parcautomobile.vehicule.api.VehiculeDtos.AffectationResponse>
            affectationsDuVehicule(UUID vehiculeId) {
        return affectations.findByVehiculeIdOrderByDateDebutDescDateCreationDesc(vehiculeId).stream()
                .map(a -> new com.parcautomobile.vehicule.api.VehiculeDtos.AffectationResponse(
                        a.getId(), a.getServiceParc().getLibelle(),
                        a.getConducteur().getNomComplet(),
                        a.getDateDebut(), a.getDateFin(), a.getDateFinPrevue(),
                        a.getMotif(), a.getTypeMission(), a.estEligibleOrdreMission()))
                .toList();
    }

    @Override
    public List<com.parcautomobile.conducteur.api.ConducteurDtos.AffectationResponse>
            affectationsDuConducteur(UUID conducteurId) {
        return affectations.findByConducteurIdOrderByDateDebutDescDateCreationDesc(conducteurId).stream()
                .map(this::versAffectationConducteur)
                .toList();
    }

    @Override
    public boolean possedeAffectationActive(UUID vehiculeId) {
        return affectations.existsByVehiculeIdAndStatut(vehiculeId, StatutAffectation.ACTIVE);
    }

    @Override
    public List<com.parcautomobile.serviceparc.api.ServiceParcDtos.VehiculeRattacheResponse>
            vehiculesActuels(UUID serviceParcId) {
        return affectations.findByServiceParcIdAndStatutOrderByDateDebutDesc(
                        serviceParcId, StatutAffectation.ACTIVE).stream()
                .map(a -> new com.parcautomobile.serviceparc.api.ServiceParcDtos
                        .VehiculeRattacheResponse(
                        a.getVehicule().getImmatriculation(),
                        a.getVehicule().getModele().getMarque().getDesignation()
                                + " " + a.getVehicule().getModele().getNom()))
                .toList();
    }

    private com.parcautomobile.conducteur.api.ConducteurDtos.AffectationResponse
            versAffectationConducteur(Affectation a) {
        return new com.parcautomobile.conducteur.api.ConducteurDtos.AffectationResponse(
                a.getVehicule().getImmatriculation(),
                a.getVehicule().getModele().getMarque().getDesignation()
                        + " " + a.getVehicule().getModele().getNom(),
                a.getServiceParc().getLibelle(), a.getDateDebut(), a.getDateFin());
    }
}
