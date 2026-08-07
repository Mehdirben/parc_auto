package com.parcautomobile.vehicule.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.parcautomobile.vehicule.domain.Carburant;
import com.parcautomobile.vehicule.domain.GenreVehicule;
import com.parcautomobile.vehicule.domain.StatutVehicule;
import com.parcautomobile.vehicule.domain.Vehicule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehiculeRepository extends JpaRepository<Vehicule, UUID> {
    boolean existsByImmatriculation(String immatriculation);
    boolean existsByVin(String vin);
    boolean existsByVinAndIdNot(String vin, UUID id);

    @EntityGraph(attributePaths = {"modele", "modele.marque"})
    Optional<Vehicule> findByImmatriculation(String immatriculation);

    @EntityGraph(attributePaths = {"modele", "modele.marque"})
    Optional<Vehicule> findByCode(String code);

    @EntityGraph(attributePaths = {"modele", "modele.marque"})
    List<Vehicule> findByStatutInOrderByImmatriculationAsc(Collection<StatutVehicule> statuts);

    @EntityGraph(attributePaths = {"modele", "modele.marque"})
    @Query("""
            select v from Vehicule v
            where (:search = '' or lower(v.code) like lower(concat('%', :search, '%'))
                   or lower(v.immatriculation) like lower(concat('%', :search, '%'))
                   or lower(v.vin) like lower(concat('%', :search, '%'))
                   or lower(v.modele.nom) like lower(concat('%', :search, '%'))
                   or lower(v.modele.marque.designation) like lower(concat('%', :search, '%')))
              and (:statut is null or v.statut = :statut)
              and (:genre is null or v.genre = :genre)
              and (:carburant is null or v.carburant = :carburant)
              and (:marque = '' or v.modele.marque.code = :marque)
            """)
    Page<Vehicule> rechercher(
            @Param("search") String search,
            @Param("statut") StatutVehicule statut,
            @Param("genre") GenreVehicule genre,
            @Param("carburant") Carburant carburant,
            @Param("marque") String marque,
            Pageable pageable);

    @Query(value = "SELECT NEXT VALUE FOR vehicule_code_sequence", nativeQuery = true)
    long prochainNumeroCode();

    long countByStatut(StatutVehicule statut);
}
