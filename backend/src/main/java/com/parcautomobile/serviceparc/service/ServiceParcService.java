package com.parcautomobile.serviceparc.service;

import static com.parcautomobile.serviceparc.api.ServiceParcDtos.*;
import static com.parcautomobile.shared.HistoriqueAuditMapper.historique;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.TexteNormalise;
import com.parcautomobile.serviceparc.domain.ActionServiceParc;
import com.parcautomobile.serviceparc.domain.ServiceParc;
import com.parcautomobile.serviceparc.domain.TypeServiceParc;
import com.parcautomobile.serviceparc.repository.ServiceParcRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ServiceParcService {
    private static final String ENTITE = "SERVICE_PARC";

    private final ServiceParcRepository repository;
    private final JournalAuditService journalAudit;
    private final ServiceParcAffectationReader affectations;

    public ServiceParcService(ServiceParcRepository repository, JournalAuditService journalAudit,
                              ServiceParcAffectationReader affectations) {
        this.repository = repository;
        this.journalAudit = journalAudit;
        this.affectations = affectations;
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
        repository.saveAndFlush(serviceParc);
        journalAudit.journaliser("CREATION", ENTITE, serviceParc.getId(), null, valeurs(serviceParc));
        return versDetail(serviceParc);
    }

    public ServiceParcDetailResponse modifier(String code, ModifierServiceParcRequest request) {
        ServiceParc serviceParc = trouver(code);
        vérifierUnicité(request.code(), request.libelle(), serviceParc.getId());
        Map<String, ?> anciennesValeurs = valeurs(serviceParc);
        serviceParc.modifier(request.code(), request.libelle(), request.type());
        repository.saveAndFlush(serviceParc);
        journalAudit.journaliser("MODIFICATION", ENTITE, serviceParc.getId(),
                anciennesValeurs, valeurs(serviceParc));
        return versDetail(serviceParc);
    }

    public ServiceParcDetailResponse changerStatut(String code, ChangerStatutRequest request) {
        ServiceParc serviceParc = trouver(code);
        Map<String, ?> anciennesValeurs = valeurs(serviceParc);
        if (serviceParc.changerStatut(request.actif())) {
            repository.saveAndFlush(serviceParc);
            journalAudit.journaliser(
                    request.actif() ? "ACTIVATION" : "DESACTIVATION",
                    ENTITE, serviceParc.getId(), anciennesValeurs, valeurs(serviceParc));
        }
        return versDetail(serviceParc);
    }

    private ServiceParc trouver(String code) {
        return repository.findDetailByCode(TexteNormalise.cle(code))
                .orElseThrow(() -> new NotFoundException(
                        "Le service ou parc « %s » est introuvable.".formatted(code)));
    }

    private void vérifierUnicité(String code, String libelle, UUID idExclu) {
        String codeCanonique = TexteNormalise.cle(code);
        String libellé = TexteNormalise.affichage(libelle);
        boolean codeExiste = idExclu == null
                ? repository.existsByCode(codeCanonique)
                : repository.existsByCodeAndIdNot(codeCanonique, idExclu);
        if (codeExiste) throw new ConflictException("Ce code de service existe déjà.");
        boolean libelléExiste = idExclu == null
                ? repository.existsByLibelle(libellé)
                : repository.existsByLibelleAndIdNot(libellé, idExclu);
        if (libelléExiste) throw new ConflictException("Ce libellé de service existe déjà.");
    }

    private ServiceParcListeResponse versListe(ServiceParc serviceParc) {
        return new ServiceParcListeResponse(serviceParc.getCode(), serviceParc.getLibelle(),
                serviceParc.getType(), serviceParc.isActif(),
                serviceParc.getDateCreation(), serviceParc.getCreePar());
    }

    private ServiceParcDetailResponse versDetail(ServiceParc serviceParc) {
        List<VehiculeRattacheResponse> vehicules =
                affectations.vehiculesActuels(serviceParc.getId());
        return new ServiceParcDetailResponse(
                serviceParc.getCode(), serviceParc.getLibelle(), serviceParc.getType(), serviceParc.isActif(),
                vehicules, historique(journalAudit, ENTITE, serviceParc.getId(), this::versEvenement),
                serviceParc.getDateCreation(), serviceParc.getCreePar(),
                serviceParc.getDateModification(), serviceParc.getModifiePar());
    }

    private EvenementResponse versEvenement(JournalAudit evenement) {
        return new EvenementResponse(ActionServiceParc.valueOf(evenement.getAction()),
                evenement.getDateAction(), evenement.getUtilisateur());
    }

    private Map<String, ?> valeurs(ServiceParc serviceParc) {
        return Map.of(
                "code", serviceParc.getCode(),
                "libelle", serviceParc.getLibelle(),
                "type", serviceParc.getType(),
                "actif", serviceParc.isActif());
    }
}
