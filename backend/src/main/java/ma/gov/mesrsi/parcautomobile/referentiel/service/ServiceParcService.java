package ma.gov.mesrsi.parcautomobile.referentiel.service;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.ServiceParcDtos.*;

import java.util.List;
import java.util.UUID;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.ActionServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.ServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.ServiceParcEvenement;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.TexteNormalise;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.TypeServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.ServiceParcRepository;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import ma.gov.mesrsi.parcautomobile.shared.NotFoundException;
import ma.gov.mesrsi.parcautomobile.shared.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ServiceParcService {
    private final ServiceParcRepository repository;

    public ServiceParcService(ServiceParcRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ServiceParcListeResponse> rechercher(String search, TypeServiceParc type,
                                                              Boolean actif, int page, int taille) {
        return PageResponse.of(repository.rechercher(
                TexteNormalise.affichage(search == null ? "" : search), type, actif,
                PageRequest.of(page, taille, Sort.by("libelle").ascending())).map(this::versListe));
    }

    @Transactional(readOnly = true)
    public ServiceParcDetailResponse consulter(String code) {
        return versDetail(trouver(code));
    }

    @Transactional(readOnly = true)
    public ServiceParcStatistiquesResponse statistiques() {
        return new ServiceParcStatistiquesResponse(
                repository.count(), repository.countByActifTrue(),
                repository.countByType(TypeServiceParc.DIRECTION),
                repository.countByType(TypeServiceParc.PARC_COMMUN));
    }

    public ServiceParcDetailResponse créer(CreerServiceParcRequest request) {
        vérifierUnicité(request.code(), request.libelle(), null);
        ServiceParc serviceParc = new ServiceParc(request.code(), request.libelle(), request.type());
        serviceParc.historiser(ActionServiceParc.CREATION);
        return versDetail(repository.saveAndFlush(serviceParc));
    }

    public ServiceParcDetailResponse modifier(String code, ModifierServiceParcRequest request) {
        ServiceParc serviceParc = trouver(code);
        vérifierUnicité(request.code(), request.libelle(), serviceParc.getId());
        serviceParc.modifier(request.code(), request.libelle(), request.type());
        serviceParc.historiser(ActionServiceParc.MODIFICATION);
        return versDetail(repository.saveAndFlush(serviceParc));
    }

    public ServiceParcDetailResponse changerStatut(String code, ChangerStatutRequest request) {
        ServiceParc serviceParc = trouver(code);
        if (serviceParc.changerStatut(request.actif())) {
            serviceParc.historiser(request.actif()
                    ? ActionServiceParc.ACTIVATION : ActionServiceParc.DESACTIVATION);
            repository.saveAndFlush(serviceParc);
        }
        return versDetail(serviceParc);
    }

    private ServiceParc trouver(String code) {
        return repository.findDetailByCodeNormalise(TexteNormalise.cle(code))
                .orElseThrow(() -> new NotFoundException(
                        "Le service ou parc « %s » est introuvable.".formatted(code)));
    }

    private void vérifierUnicité(String code, String libelle, UUID idExclu) {
        String codeNormalisé = TexteNormalise.cle(code);
        String libelléNormalisé = TexteNormalise.cle(libelle);
        boolean codeExiste = idExclu == null
                ? repository.existsByCodeNormalise(codeNormalisé)
                : repository.existsByCodeNormaliseAndIdNot(codeNormalisé, idExclu);
        if (codeExiste) throw new ConflictException("Ce code de service existe déjà.");
        boolean libelléExiste = idExclu == null
                ? repository.existsByLibelleNormalise(libelléNormalisé)
                : repository.existsByLibelleNormaliseAndIdNot(libelléNormalisé, idExclu);
        if (libelléExiste) throw new ConflictException("Ce libellé de service existe déjà.");
    }

    private ServiceParcListeResponse versListe(ServiceParc serviceParc) {
        return new ServiceParcListeResponse(serviceParc.getCode(), serviceParc.getLibelle(),
                serviceParc.getType(), serviceParc.isActif(),
                serviceParc.getDateCreation(), serviceParc.getCreePar());
    }

    private ServiceParcDetailResponse versDetail(ServiceParc serviceParc) {
        return new ServiceParcDetailResponse(
                serviceParc.getCode(), serviceParc.getLibelle(), serviceParc.getType(), serviceParc.isActif(),
                List.of(), serviceParc.getEvenements().stream().map(this::versEvenement).toList(),
                serviceParc.getDateCreation(), serviceParc.getCreePar(),
                serviceParc.getDateModification(), serviceParc.getModifiePar());
    }

    private EvenementResponse versEvenement(ServiceParcEvenement evenement) {
        return new EvenementResponse(evenement.getAction(), evenement.getDateEvenement(), evenement.getUtilisateur());
    }
}
