package ma.gov.mesrsi.parcautomobile.referentiel.repository;

import java.util.Optional;
import java.util.UUID;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.Conducteur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConducteurRepository extends JpaRepository<Conducteur, UUID> {

    // RG1: Matricule unique
    boolean existsByMatricule(String matricule);
    boolean existsByMatriculeAndIdNot(String matricule, UUID id);

    // RG2: Numéro de permis unique
    boolean existsByNumeroPermis(String numeroPermis);
    boolean existsByNumeroPermisAndIdNot(String numeroPermis, UUID id);

    // Detail fetch with event log
    @EntityGraph(attributePaths = "evenements")
    Optional<Conducteur> findDetailByMatricule(String matricule);

    // Search by nomComplet or matricule, optional actif filter
    @Query("""
            select c from Conducteur c
            where (:search = '' 
                   or lower(c.nomComplet) like lower(concat('%', :search, '%'))
                   or lower(c.matricule) like lower(concat('%', :search, '%')))
              and (:actif is null or c.actif = :actif)
            """)
    Page<Conducteur> rechercher(@Param("search") String search,
                                @Param("actif") Boolean actif,
                                Pageable pageable);

    // Statistics
    long countByActifTrue();
    long countByActifFalse();
}