package com.parcautomobile.serviceparc.service;

import java.util.List;
import java.util.UUID;

import com.parcautomobile.serviceparc.api.ServiceParcDtos.VehiculeRattacheResponse;

/**
 * Vue en lecture fournie par le module Affectations, propriétaire du
 * rattachement courant entre services et véhicules.
 */
public interface ServiceParcAffectationReader {
    List<VehiculeRattacheResponse> vehiculesActuels(UUID serviceParcId);
}
