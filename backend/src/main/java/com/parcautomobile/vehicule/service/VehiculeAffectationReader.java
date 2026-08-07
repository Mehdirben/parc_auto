package com.parcautomobile.vehicule.service;

import static com.parcautomobile.vehicule.api.VehiculeDtos.AffectationResponse;

import java.util.List;
import java.util.UUID;

/** Port fourni ultérieurement par le module Affectations, propriétaire de ces données. */
public interface VehiculeAffectationReader {
    List<AffectationResponse> affectationsDuVehicule(UUID vehiculeId);
    boolean possedeAffectationActive(UUID vehiculeId);
}
