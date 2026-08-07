package com.parcautomobile.ordremission.service;

import static com.parcautomobile.ordremission.api.OrdreMissionDtos.OrdreMissionResponse;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;

import com.parcautomobile.affectation.domain.Affectation;
import com.parcautomobile.affectation.repository.AffectationRepository;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.ordremission.domain.OrdreMission;
import com.parcautomobile.ordremission.repository.OrdreMissionRepository;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.vehicule.domain.Vehicule;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrdreMissionService {
    private static final String ENTITE = "ORDRE_MISSION";
    private static final ZoneId CASABLANCA = ZoneId.of("Africa/Casablanca");

    private final OrdreMissionRepository ordres;
    private final AffectationRepository affectations;
    private final JournalAuditService journalAudit;

    public OrdreMissionService(OrdreMissionRepository ordres,
                               AffectationRepository affectations,
                               JournalAuditService journalAudit) {
        this.ordres = ordres;
        this.affectations = affectations;
        this.journalAudit = journalAudit;
    }

    public OrdreMissionResponse obtenirPourAffectation(UUID affectationId) {
        return ordres.findByAffectationId(affectationId)
                .map(ordre -> {
                    journalAudit.journaliser(
                            "CONSULTATION", ENTITE, ordre.getId(), null, null);
                    return versResponse(ordre);
                })
                .orElseGet(() -> generer(affectationId));
    }

    public OrdreMissionResponse consulter(UUID id) {
        OrdreMission ordre = trouver(id);
        journalAudit.journaliser("CONSULTATION", ENTITE, ordre.getId(), null, null);
        return versResponse(ordre);
    }

    public OrdreMissionResponse telecharger(UUID id) {
        OrdreMission ordre = trouver(id);
        journalAudit.journaliser("TELECHARGEMENT", ENTITE, ordre.getId(), null, null);
        return versResponse(ordre);
    }

    private OrdreMissionResponse generer(UUID affectationId) {
        Affectation affectation = affectations.findDetailById(affectationId)
                .orElseThrow(() -> new NotFoundException("L’affectation demandée est introuvable."));
        if (!affectation.estEligibleOrdreMission()) {
            throw new BusinessRuleException(
                    "Cette affectation ne remplit pas les conditions d’un ordre de mission.");
        }
        long sequence = ordres.prochainNumero();
        if (sequence > 999_999) {
            throw new BusinessRuleException(
                    "La séquence annuelle des ordres de mission est arrivée à sa limite.");
        }
        String numero = "OM-%d-%06d".formatted(affectation.getDateDebut().getYear(), sequence);
        try {
            OrdreMission ordre = ordres.saveAndFlush(new OrdreMission(
                    affectation, numero, LocalDate.now(CASABLANCA)));
            journalAudit.journaliser("GENERATION", ENTITE, ordre.getId(), null,
                    Map.of("numero", numero, "affectationId", affectationId));
            return versResponse(ordre);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException(
                    "Un ordre de mission vient déjà d’être créé pour cette affectation. Réessayez.");
        }
    }

    private OrdreMission trouver(UUID id) {
        return ordres.findById(id)
                .orElseThrow(() -> new NotFoundException("L’ordre de mission est introuvable."));
    }

    private OrdreMissionResponse versResponse(OrdreMission ordre) {
        Affectation a = ordre.getAffectation();
        Vehicule v = a.getVehicule();
        return new OrdreMissionResponse(
                ordre.getId(), a.getId(), ordre.getNumero(),
                a.getConducteur().getNomComplet(), a.getConducteur().getMatricule(),
                "Conducteur", a.getTypeMission(), a.getMotif(),
                a.getDateDebut(), a.getDateFinPrevue(),
                v.getImmatriculation(), v.getCode(),
                v.getModele().getMarque().getDesignation() + " " + v.getModele().getNom(),
                a.getServiceParc().getLibelle(), ordre.getDateEdition(), a.getStatut(),
                ordre.getDateCreation(), ordre.getCreePar());
    }
}
