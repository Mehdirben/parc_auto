package com.parcautomobile.vehicule.repository;

import java.util.List;
import java.util.UUID;

import com.parcautomobile.vehicule.domain.ReleveKilometrique;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReleveKilometriqueRepository extends JpaRepository<ReleveKilometrique, UUID> {
    List<ReleveKilometrique> findByVehicule_IdOrderByDateReleveDescDateCreationDesc(UUID vehiculeId);
}
