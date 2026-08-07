package com.parcautomobile.conducteur.service;

import static com.parcautomobile.conducteur.api.ConducteurDtos.AffectationResponse;

import java.util.List;
import java.util.UUID;

/**
 * Point d'intégration du futur module Affectations. Celui-ci reste propriétaire
 * de ses tables et fournira cette vue sans dupliquer les données véhicule.
 */
public interface ConducteurAffectationReader {
    List<AffectationResponse> affectationsDuConducteur(UUID conducteurId);
}
