package ma.gov.mesrsi.parcautomobile.referentiel.service;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.MarqueDtos.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.Marque;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.MarqueCodeRepository;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.MarqueRepository;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.ModeleRepository;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarqueServiceTest {
    @Mock MarqueRepository marqueRepository;
    @Mock ModeleRepository modeleRepository;
    @Mock MarqueCodeRepository codeRepository;
    private MarqueService service;

    @BeforeEach
    void setUp() {
        service = new MarqueService(marqueRepository, modeleRepository, codeRepository);
    }

    @Test
    void créeUneMarqueAvecDesModèlesDédupliquésEtSéparésParPointVirgule() {
        when(codeRepository.prochainCode(" Renault ")).thenReturn("REN01");
        when(marqueRepository.saveAndFlush(any(Marque.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MarqueDetailResponse résultat = service.créer(
                new CreerMarqueRequest(" Renault ", List.of("Clio ; Captur", "clio")));

        assertThat(résultat.code()).isEqualTo("REN01");
        assertThat(résultat.designation()).isEqualTo("Renault");
        assertThat(résultat.modeles()).extracting(ModeleResponse::nom).containsExactly("Clio", "Captur");
    }

    @Test
    void refuseUneMarqueDéjàExistanteSansTenirCompteDeLaCasse() {
        when(marqueRepository.existsByDesignationNormalisee("DACIA")).thenReturn(true);

        assertThatThrownBy(() -> service.créer(new CreerMarqueRequest("dacia", List.of())))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("existe déjà");
    }

    @Test
    void ajoutePlusieursModèlesÀUneMarqueExistante() {
        Marque marque = new Marque("MAR0000001", "Renault");
        when(marqueRepository.findDetailByCode("MAR0000001")).thenReturn(Optional.of(marque));
        when(marqueRepository.saveAndFlush(marque)).thenReturn(marque);

        MarqueDetailResponse résultat = service.ajouterModèles("MAR0000001",
                new AjouterModelesRequest(List.of("Clio;Captur")));

        assertThat(résultat.modeles()).extracting(ModeleResponse::nom).containsExactly("Clio", "Captur");
    }

    @Test
    void supprimeUneMarqueLibre() {
        Marque marque = new Marque("MAR0000001", "Renault");
        when(marqueRepository.findDetailByCode("MAR0000001")).thenReturn(Optional.of(marque));

        service.supprimer("MAR0000001");

        verify(marqueRepository).delete(marque);
        verify(marqueRepository).flush();
    }

    @Test
    void retourneLesStatistiquesDesMarquesEtModèles() {
        when(marqueRepository.count()).thenReturn(5L);
        when(modeleRepository.count()).thenReturn(14L);

        MarqueStatistiquesResponse stats = service.statistiques();

        assertThat(stats.totalMarques()).isEqualTo(5L);
        assertThat(stats.totalModeles()).isEqualTo(14L);
    }
}

