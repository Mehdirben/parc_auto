package ma.gov.mesrsi.parcautomobile.referentiel.repository;

import java.util.UUID;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.Modele;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModeleRepository extends JpaRepository<Modele, UUID> {
    boolean existsByMarqueCodeAndNomNormalise(String marqueCode, String nomNormalise);
    boolean existsByMarqueCodeAndNomNormaliseAndIdNot(String marqueCode, String nomNormalise, UUID id);
}
