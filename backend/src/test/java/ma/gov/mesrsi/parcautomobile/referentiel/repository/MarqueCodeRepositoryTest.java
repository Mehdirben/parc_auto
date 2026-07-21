package ma.gov.mesrsi.parcautomobile.referentiel.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarqueCodeRepositoryTest {
    @Mock EntityManager entityManager;
    @Mock Query query;
    private MarqueCodeRepository repository;

    @BeforeEach
    void setUp() {
        repository = new MarqueCodeRepository(entityManager);
        when(entityManager.createNativeQuery("SELECT NEXT VALUE FOR marque_code_sequence")).thenReturn(query);
    }

    @Test
    void génèreLesTroisPremièresLettresEtUnSuffixeSéquentiel() {
        when(query.getSingleResult()).thenReturn(2L);

        assertThat(repository.prochainCode("Renault")).isEqualTo("REN02");
    }

    @Test
    void normaliseLesAccentsEspacesEtPonctuations() {
        when(query.getSingleResult()).thenReturn(7L);

        assertThat(repository.prochainCode(" Élan-Motors ")).isEqualTo("ELA07");
    }

    @Test
    void complèteLesDésignationsDeMoinsDeTroisLettres() {
        when(query.getSingleResult()).thenReturn(9L);

        assertThat(repository.prochainCode("MG")).isEqualTo("MGX09");
    }

    @Test
    void refuseUnSuffixeQuiDépasseDeuxChiffres() {
        when(query.getSingleResult()).thenReturn(100L);

        assertThatThrownBy(() -> repository.prochainCode("Renault"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("99");
    }
}
