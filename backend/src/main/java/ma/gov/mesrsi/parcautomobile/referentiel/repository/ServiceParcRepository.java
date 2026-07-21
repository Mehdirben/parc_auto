package ma.gov.mesrsi.parcautomobile.referentiel.repository;

import java.util.Optional;
import java.util.UUID;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.ServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.TypeServiceParc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceParcRepository extends JpaRepository<ServiceParc, UUID> {
    boolean existsByCodeNormalise(String codeNormalise);
    boolean existsByCodeNormaliseAndIdNot(String codeNormalise, UUID id);
    boolean existsByLibelleNormalise(String libelleNormalise);
    boolean existsByLibelleNormaliseAndIdNot(String libelleNormalise, UUID id);

    @EntityGraph(attributePaths = "evenements")
    Optional<ServiceParc> findDetailByCodeNormalise(String codeNormalise);

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
