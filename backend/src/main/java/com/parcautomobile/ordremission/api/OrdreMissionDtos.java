package com.parcautomobile.ordremission.api;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.parcautomobile.affectation.domain.StatutAffectation;

public final class OrdreMissionDtos {
    private OrdreMissionDtos() {}

    public record OrdreMissionResponse(
            UUID id, UUID affectationId, String numero,
            String conducteur, String conducteurMatricule, String fonction,
            String typeMission, String motif,
            LocalDate dateAller, LocalDate dateRetour,
            String vehicule, String vehiculeCode, String marqueModele,
            String serviceParc, LocalDate dateEdition,
            StatutAffectation statutAffectation,
            LocalDateTime dateCreation, String creePar) {}
}
