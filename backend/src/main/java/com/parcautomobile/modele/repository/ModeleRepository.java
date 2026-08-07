package com.parcautomobile.modele.repository;

import java.util.UUID;
import java.util.Optional;

import com.parcautomobile.modele.domain.Modele;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ModeleRepository extends JpaRepository<Modele, UUID> {
    @EntityGraph(attributePaths = "marque")
    Optional<Modele> findByMarqueIdAndNom(UUID marqueId, String nom);
    boolean existsByMarqueCodeAndNom(String marqueCode, String nom);
    boolean existsByMarqueCodeAndNomAndIdNot(String marqueCode, String nom, UUID id);

    @EntityGraph(attributePaths = "marque")
    @Query("""
            select modele from Modele modele
            where :search = ''
               or lower(modele.nom) like lower(concat('%', :search, '%'))
               or lower(modele.marque.designation) like lower(concat('%', :search, '%'))
               or lower(modele.marque.code) like lower(concat('%', :search, '%'))
            """)
    Page<Modele> rechercher(@Param("search") String search, Pageable pageable);
}
