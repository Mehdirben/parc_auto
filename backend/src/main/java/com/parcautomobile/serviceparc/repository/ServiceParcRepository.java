package com.parcautomobile.serviceparc.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.parcautomobile.serviceparc.domain.ServiceParc;
import com.parcautomobile.serviceparc.domain.TypeServiceParc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceParcRepository extends JpaRepository<ServiceParc, UUID> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, UUID id);
    boolean existsByLibelle(String libelle);
    boolean existsByLibelleAndIdNot(String libelle, UUID id);

    Optional<ServiceParc> findDetailByCode(String code);
    List<ServiceParc> findByActifTrueOrderByLibelleAsc();

    @Query("""
            select s from ServiceParc s
            where (:search = '' or lower(s.code) like lower(concat('%', :search, '%'))
                   or lower(s.libelle) like lower(concat('%', :search, '%')))
              and (:type is null or s.type = :type)
              and (:actif is null or s.actif = :actif)
            """)
    Page<ServiceParc> rechercher(@Param("search") String search,
                                 @Param("type") TypeServiceParc type,
                                 @Param("actif") Boolean actif,
                                 Pageable pageable);

    long countByActifTrue();
    long countByType(TypeServiceParc type);
}
