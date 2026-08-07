package com.parcautomobile.conducteur.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.parcautomobile.conducteur.domain.Conducteur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConducteurRepository extends JpaRepository<Conducteur, UUID> {
    boolean existsByMatricule(String matricule);
    boolean existsByMatriculeAndIdNot(String matricule, UUID id);
    boolean existsByNumeroPermis(String numeroPermis);
    boolean existsByNumeroPermisAndIdNot(String numeroPermis, UUID id);
    Optional<Conducteur> findByMatricule(String matricule);
    List<Conducteur> findByActifTrueAndDateValiditePermisGreaterThanEqualOrderByNomCompletAsc(
            LocalDate date);

    @Query("""
            select c from Conducteur c
            where (:search = '' or lower(c.matricule) like lower(concat('%', :search, '%'))
                   or lower(c.nomComplet) like lower(concat('%', :search, '%'))
                   or lower(c.numeroPermis) like lower(concat('%', :search, '%'))
                   or c.telephone like concat('%', :search, '%'))
              and (:actif is null or c.actif = :actif)
              and (:dateMinimum is null or c.dateValiditePermis >= :dateMinimum)
              and (:dateMaximum is null or c.dateValiditePermis <= :dateMaximum)
            """)
    Page<Conducteur> rechercher(@Param("search") String search,
                                @Param("actif") Boolean actif,
                                @Param("dateMinimum") LocalDate dateMinimum,
                                @Param("dateMaximum") LocalDate dateMaximum,
                                Pageable pageable);

    long countByActifTrue();
    long countByDateValiditePermisBefore(LocalDate date);
    long countByDateValiditePermisBetween(LocalDate debut, LocalDate fin);
}
