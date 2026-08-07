package com.parcautomobile.affectation.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;

import com.parcautomobile.affectation.domain.Affectation;
import com.parcautomobile.affectation.domain.StatutAffectation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AffectationRepository extends JpaRepository<Affectation, UUID> {
    @EntityGraph(attributePaths = {
            "vehicule", "vehicule.modele", "vehicule.modele.marque", "serviceParc", "conducteur"
    })
    @Query("""
            select a from Affectation a
            where (:statut is null or a.statut = :statut)
              and (:search = '' or lower(a.vehicule.code) like lower(concat('%', :search, '%'))
                   or lower(a.vehicule.immatriculation) like lower(concat('%', :search, '%'))
                   or lower(a.serviceParc.code) like lower(concat('%', :search, '%'))
                   or lower(a.serviceParc.libelle) like lower(concat('%', :search, '%'))
                   or lower(a.conducteur.matricule) like lower(concat('%', :search, '%'))
                   or lower(a.conducteur.nomComplet) like lower(concat('%', :search, '%')))
              and (
                   :filtreOrdre = ''
                   or (
                       :filtreOrdre = 'ELIGIBLE'
                       and a.serviceParc.categorieMission is not null
                       and a.dateFinPrevue is not null
                       and a.typeMission is not null
                   )
                   or (
                       :filtreOrdre = 'GENERE'
                       and exists (
                           select om.id from OrdreMission om where om.affectation = a
                       )
                   )
                   or (
                       :filtreOrdre = 'A_GENERER'
                       and a.serviceParc.categorieMission is not null
                       and a.dateFinPrevue is not null
                       and a.typeMission is not null
                       and not exists (
                           select om.id from OrdreMission om where om.affectation = a
                       )
                   )
              )
            order by a.dateDebut desc, a.dateCreation desc
            """)
    Page<Affectation> rechercher(@Param("search") String search,
                                 @Param("statut") StatutAffectation statut,
                                 @Param("filtreOrdre") String filtreOrdre,
                                 Pageable pageable);

    @EntityGraph(attributePaths = {
            "vehicule", "vehicule.modele", "vehicule.modele.marque", "serviceParc", "conducteur"
    })
    @Query("select a from Affectation a where a.id = :id")
    Optional<Affectation> findDetailById(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"serviceParc", "conducteur"})
    Optional<Affectation> findByVehiculeIdAndStatut(UUID vehiculeId, StatutAffectation statut);

    @EntityGraph(attributePaths = {"vehicule", "serviceParc", "conducteur"})
    List<Affectation> findByVehiculeIdInAndStatut(
            Collection<UUID> vehiculeIds, StatutAffectation statut);

    @EntityGraph(attributePaths = {"serviceParc", "conducteur"})
    List<Affectation> findByVehiculeIdOrderByDateDebutDescDateCreationDesc(UUID vehiculeId);

    @EntityGraph(attributePaths = {"vehicule", "vehicule.modele", "vehicule.modele.marque", "serviceParc"})
    List<Affectation> findByConducteurIdOrderByDateDebutDescDateCreationDesc(UUID conducteurId);

    boolean existsByVehiculeIdAndStatut(UUID vehiculeId, StatutAffectation statut);

    @EntityGraph(attributePaths = {"vehicule", "vehicule.modele", "vehicule.modele.marque"})
    List<Affectation> findByServiceParcIdAndStatutOrderByDateDebutDesc(
            UUID serviceParcId, StatutAffectation statut);
}
