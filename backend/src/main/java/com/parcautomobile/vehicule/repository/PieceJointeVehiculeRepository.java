package com.parcautomobile.vehicule.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.parcautomobile.vehicule.domain.PieceJointeVehicule;
import com.parcautomobile.vehicule.domain.TypePieceJointe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PieceJointeVehiculeRepository extends JpaRepository<PieceJointeVehicule, UUID> {
    interface Metadata {
        UUID getId();
        TypePieceJointe getTypePiece();
        String getNomFichier();
        String getTypeContenu();
        long getTaille();
        LocalDateTime getDateCreation();
        String getCreePar();
    }

    List<Metadata> findByVehicule_IdOrderByDateCreationDesc(UUID vehiculeId);
    Optional<PieceJointeVehicule> findByIdAndVehicule_Id(UUID id, UUID vehiculeId);
}
