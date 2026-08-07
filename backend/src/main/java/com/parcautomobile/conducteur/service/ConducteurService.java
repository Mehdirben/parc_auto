package com.parcautomobile.conducteur.service;

import static com.parcautomobile.conducteur.api.ConducteurDtos.*;
import static com.parcautomobile.shared.HistoriqueAuditMapper.historique;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.conducteur.domain.ActionConducteur;
import com.parcautomobile.conducteur.domain.Conducteur;
import com.parcautomobile.conducteur.domain.FiltrePermis;
import com.parcautomobile.conducteur.repository.ConducteurRepository;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.TexteNormalise;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConducteurService {
    private static final String ENTITE = "CONDUCTEUR";

    private final ConducteurRepository repository;
    private final JournalAuditService journalAudit;
    private final ConducteurAffectationReader affectations;
    private final Clock clock;

    @Autowired
    public ConducteurService(ConducteurRepository repository, JournalAuditService journalAudit,
                             ConducteurAffectationReader affectations) {
        this(repository, journalAudit, affectations, Clock.systemDefaultZone());
    }

    ConducteurService(ConducteurRepository repository, JournalAuditService journalAudit,
                      ConducteurAffectationReader affectations, Clock clock) {
        this.repository = repository;
        this.journalAudit = journalAudit;
        this.affectations = affectations;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<ConducteurListeResponse> rechercher(
            String search, Boolean actif, FiltrePermis permis, int page, int taille) {
        LocalDate aujourdHui = LocalDate.now(clock);
        LocalDate dateMinimum = permis == FiltrePermis.A_RENOUVELER ? aujourdHui : null;
        LocalDate dateMaximum = switch (permis) {
            case EXPIRE -> aujourdHui.minusDays(1);
            case A_RENOUVELER -> aujourdHui.plusDays(30);
            case null -> null;
        };
        return PageResponse.of(repository.rechercher(
                TexteNormalise.affichage(search == null ? "" : search), actif,
                dateMinimum, dateMaximum,
                PageRequest.of(page, taille, Sort.by("nomComplet").ascending())).map(this::versListe));
    }

    @Transactional(readOnly = true)
    public ConducteurDetailResponse consulter(String matricule) {
        return versDetail(trouver(matricule));
    }

    @Transactional(readOnly = true)
    public ConducteurStatistiquesResponse statistiques() {
        LocalDate aujourdHui = LocalDate.now(clock);
        long total = repository.count();
        long actifs = repository.countByActifTrue();
        return new ConducteurStatistiquesResponse(
                total, actifs, total - actifs,
                repository.countByDateValiditePermisBefore(aujourdHui),
                repository.countByDateValiditePermisBetween(aujourdHui, aujourdHui.plusDays(30)));
    }

    public ConducteurDetailResponse créer(EnregistrerConducteurRequest request) {
        vérifierUnicité(request.matricule(), request.numeroPermis(), null);
        Conducteur conducteur = new Conducteur(
                request.matricule(), request.nomComplet(), request.telephone(),
                request.numeroPermis(), request.dateValiditePermis());
        repository.saveAndFlush(conducteur);
        journalAudit.journaliser("CREATION", ENTITE, conducteur.getId(), null, valeurs(conducteur));
        return versDetail(conducteur);
    }

    public ConducteurDetailResponse modifier(String matricule, EnregistrerConducteurRequest request) {
        Conducteur conducteur = trouver(matricule);
        vérifierUnicité(request.matricule(), request.numeroPermis(), conducteur.getId());
        Map<String, ?> anciennesValeurs = valeurs(conducteur);
        conducteur.modifier(
                request.matricule(), request.nomComplet(), request.telephone(),
                request.numeroPermis(), request.dateValiditePermis());
        repository.saveAndFlush(conducteur);
        journalAudit.journaliser("MODIFICATION", ENTITE, conducteur.getId(),
                anciennesValeurs, valeurs(conducteur));
        return versDetail(conducteur);
    }

    public ConducteurDetailResponse changerStatut(String matricule, ChangerStatutRequest request) {
        Conducteur conducteur = trouver(matricule);
        Map<String, ?> anciennesValeurs = valeurs(conducteur);
        if (conducteur.changerStatut(request.actif())) {
            repository.saveAndFlush(conducteur);
            journalAudit.journaliser(
                    request.actif() ? "ACTIVATION" : "DESACTIVATION",
                    ENTITE, conducteur.getId(), anciennesValeurs, valeurs(conducteur));
        }
        return versDetail(conducteur);
    }

    private Conducteur trouver(String matricule) {
        return repository.findByMatricule(TexteNormalise.cle(matricule))
                .orElseThrow(() -> new NotFoundException(
                        "Le conducteur « %s » est introuvable.".formatted(matricule)));
    }

    private void vérifierUnicité(String matricule, String numeroPermis, UUID idExclu) {
        String matriculeCanonique = TexteNormalise.cle(matricule);
        String permisCanonique = TexteNormalise.cle(numeroPermis);
        boolean matriculeExiste = idExclu == null
                ? repository.existsByMatricule(matriculeCanonique)
                : repository.existsByMatriculeAndIdNot(matriculeCanonique, idExclu);
        if (matriculeExiste) throw new ConflictException("Ce matricule de conducteur existe déjà.");
        boolean permisExiste = idExclu == null
                ? repository.existsByNumeroPermis(permisCanonique)
                : repository.existsByNumeroPermisAndIdNot(permisCanonique, idExclu);
        if (permisExiste) throw new ConflictException("Ce numéro de permis existe déjà.");
    }

    private ConducteurListeResponse versListe(Conducteur conducteur) {
        return new ConducteurListeResponse(
                conducteur.getMatricule(), conducteur.getNomComplet(), conducteur.getTelephone(),
                conducteur.getNumeroPermis(), conducteur.getDateValiditePermis(), conducteur.isActif(),
                conducteur.getDateCreation(), conducteur.getCreePar());
    }

    private ConducteurDetailResponse versDetail(Conducteur conducteur) {
        List<AffectationResponse> toutes =
                affectations.affectationsDuConducteur(conducteur.getId());
        List<AffectationResponse> actuelles = toutes.stream()
                .filter(affectation -> affectation.dateFin() == null)
                .toList();
        List<AffectationResponse> terminées = toutes.stream()
                .filter(affectation -> affectation.dateFin() != null)
                .toList();
        return new ConducteurDetailResponse(
                conducteur.getMatricule(), conducteur.getNomComplet(), conducteur.getTelephone(),
                conducteur.getNumeroPermis(), conducteur.getDateValiditePermis(), conducteur.isActif(),
                actuelles, terminées,
                historique(journalAudit, ENTITE, conducteur.getId(), this::versEvenement),
                conducteur.getDateCreation(), conducteur.getCreePar(),
                conducteur.getDateModification(), conducteur.getModifiePar());
    }

    private EvenementResponse versEvenement(JournalAudit evenement) {
        return new EvenementResponse(ActionConducteur.valueOf(evenement.getAction()),
                evenement.getDateAction(), evenement.getUtilisateur());
    }

    private Map<String, ?> valeurs(Conducteur conducteur) {
        return Map.of(
                "matricule", conducteur.getMatricule(),
                "nomComplet", conducteur.getNomComplet(),
                "telephone", conducteur.getTelephone() == null ? "" : conducteur.getTelephone(),
                "numeroPermis", conducteur.getNumeroPermis(),
                "dateValiditePermis", conducteur.getDateValiditePermis(),
                "actif", conducteur.isActif());
    }
}
