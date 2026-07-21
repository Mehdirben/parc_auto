package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TexteNormaliseTest {

    @Test
    void normaliseLaCasseEtLesEspacesPourLaCléUnique() {
        assertThat(TexteNormalise.cle("  Alfa   Romeo ")).isEqualTo("ALFA ROMEO");
    }
}
