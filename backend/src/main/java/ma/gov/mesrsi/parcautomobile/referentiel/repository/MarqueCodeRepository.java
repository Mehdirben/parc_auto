package ma.gov.mesrsi.parcautomobile.referentiel.repository;

import java.text.Normalizer;
import java.util.Locale;

import jakarta.persistence.EntityManager;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import org.springframework.stereotype.Repository;

@Repository
public class MarqueCodeRepository {
    private final EntityManager entityManager;

    public MarqueCodeRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public String prochainCode(String designation) {
        Number sequence = (Number) entityManager
                .createNativeQuery("SELECT NEXT VALUE FOR marque_code_sequence")
                .getSingleResult();
        long numéro = sequence.longValue();
        if (numéro > 99) {
            throw new ConflictException("La limite de 99 codes marque a été atteinte.");
        }
        return "%s%02d".formatted(préfixe(designation), numéro);
    }

    static String préfixe(String designation) {
        String sansAccents = Normalizer.normalize(designation.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z]", "");
        return (sansAccents + "XXX").substring(0, 3);
    }
}
