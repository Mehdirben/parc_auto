package com.parcautomobile.marque.repository;

import java.util.Optional;
import java.util.UUID;

import com.parcautomobile.marque.domain.Marque;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarqueRepository extends JpaRepository<Marque, UUID> {
    Optional<Marque> findByDesignation(String designation);
    boolean existsByDesignation(String designation);
    boolean existsByDesignationAndCodeNot(String designation, String code);

    @EntityGraph(attributePaths = "modeles")
    @Query("select m from Marque m where m.code = :code")
    Optional<Marque> findDetailByCode(@Param("code") String code);

    @Query("select m from Marque m where :search = '' or lower(m.designation) like lower(concat('%', :search, '%'))")
    Page<Marque> rechercher(@Param("search") String search, Pageable pageable);
}
