package com.parcautomobile.ordremission.repository;

import java.util.Optional;
import java.util.UUID;

import com.parcautomobile.ordremission.domain.OrdreMission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrdreMissionRepository extends JpaRepository<OrdreMission, UUID> {
    @EntityGraph(attributePaths = {
            "affectation", "affectation.vehicule", "affectation.vehicule.modele",
            "affectation.vehicule.modele.marque", "affectation.serviceParc",
            "affectation.conducteur"
    })
    Optional<OrdreMission> findByAffectationId(UUID affectationId);

    @Query(value = "SELECT NEXT VALUE FOR ordre_mission_sequence", nativeQuery = true)
    long prochainNumero();
}
