package ma.gov.mesrsi.parcautomobile.referentiel.service;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.ServiceParcDtos.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

import java.util.Optional;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.ActionServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.ServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.TypeServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.ServiceParcRepository;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ServiceParcServiceTest {
    @Mock
    private ServiceParcRepository repository;

    private ServiceParcService service;

    @BeforeEach
    void setUp() {
        service = new ServiceParcService(repository);
        lenient().when(repository.saveAndFlush(any(ServiceParc.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void créeUnServiceActifEtHistoriseLaCreation() {
        ServiceParcDetailResponse résultat = service.créer(
                new CreerServiceParcRequest("dsi", "Direction des systèmes d'information", TypeServiceParc.DIRECTION));

        assertThat(résultat.code()).isEqualTo("DSI");
        assertThat(résultat.actif()).isTrue();
        assertThat(résultat.historique()).extracting(EvenementResponse::action)
                .containsExactly(ActionServiceParc.CREATION);
        verify(repository).saveAndFlush(any(ServiceParc.class));
    }

    @Test
    void refuseUnCodeDejaUtilise() {
        when(repository.existsByCodeNormalise("DSI")).thenReturn(true);

        assertThatThrownBy(() -> service.créer(
                new CreerServiceParcRequest("DSI", "Direction SI", TypeServiceParc.DIRECTION)))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Ce code de service existe déjà.");
    }

    @Test
    void desactiveSansSupprimerEtHistoriseLAction() {
        ServiceParc serviceParc = new ServiceParc("PMU", "Parc mutualisé", TypeServiceParc.PARC_COMMUN);
        when(repository.findDetailByCodeNormalise("PMU")).thenReturn(Optional.of(serviceParc));

        ServiceParcDetailResponse résultat = service.changerStatut("PMU", new ChangerStatutRequest(false));

        assertThat(résultat.actif()).isFalse();
        assertThat(résultat.historique()).extracting(EvenementResponse::action)
                .containsExactly(ActionServiceParc.DESACTIVATION);
        verify(repository).saveAndFlush(serviceParc);
    }
}
