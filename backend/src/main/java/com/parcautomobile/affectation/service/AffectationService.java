package com.parcautomobile.affectation.service;

import static com.parcautomobile.affectation.api.AffectationDtos.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.time.Clock;
import java.time.LocalDate;

import com.parcautomobile.affectation.domain.Affectation;
import com.parcautomobile.affectation.domain.FiltreOrdreMission;
import com.parcautomobile.affectation.domain.StatutAffectation;
import com.parcautomobile.affectation.repository.AffectationRepository;
import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.conducteur.domain.Conducteur;
import com.parcautomobile.conducteur.repository.ConducteurRepository;
import com.parcautomobile.serviceparc.domain.ServiceParc;
import com.parcautomobile.serviceparc.repository.ServiceParcRepository;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.TexteNormalise;
import com.parcautomobile.vehicule.domain.StatutVehicule;
import com.parcautomobile.vehicule.domain.Vehicule;
import com.parcautomobile.vehicule.repository.VehiculeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AffectationService {
    private static final String ENTITE = "AFFECTATION";
    private static final Set<StatutVehicule> STATUTS_AFFECTABLES =
            Set.of(StatutVehicule.DISPONIBLE, StatutVehicule.AFFECTE);

    private final AffectationRepository affectations;
    private final VehiculeRepository vehicules;
    private final ServiceParcRepository servicesParcs;
    private final ConducteurRepository conducteurs;
    private final JournalAuditService journalAudit;
    private final Clock clock;

    @Autowired
    public AffectationService(AffectationRepository affectations, VehiculeRepository vehicules,
                              ServiceParcRepository servicesParcs,
                              ConducteurRepository conducteurs,
                              JournalAuditService journalAudit) {
        this(affectations, vehicules, servicesParcs, conducteurs, journalAudit,
                Clock.systemDefaultZone());
    }

    AffectationService(AffectationRepository affectations, VehiculeRepository vehicules,
                       ServiceParcRepository servicesParcs,
                       ConducteurRepository conducteurs,
                       JournalAuditService journalAudit, Clock clock) {
        this.affectations = affectations;
        this.vehicules = vehicules;
        this.servicesParcs = servicesParcs;
        this.conducteurs = conducteurs;
        this.journalAudit = journalAudit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<AffectationResponse> rechercher(
            String search, StatutAffectation statut, FiltreOrdreMission filtreOrdre,
            int page, int taille) {
        return PageResponse.of(affectations.rechercher(
                TexteNormalise.affichage(search == null ? "" : search),
                statut, filtreOrdre == null ? "" : filtreOrdre.name(),
                PageRequest.of(page, taille)).map(this::versResponse));
    }

    @Transactional(readOnly = true)
    public OptionsResponse options() {
        List<VehiculeOption> optionsVehicules = vehicules
                .findByStatutInOrderByImmatriculationAsc(STATUTS_AFFECTABLES).stream()
                .map(v -> new VehiculeOption(v.getId(), v.getCode(), v.getImmatriculation(),
                        v.getModele().getMarque().getDesignation() + " " + v.getModele().getNom()))
                .toList();
        List<ServiceParcOption> optionsServices = servicesParcs
                .findByActifTrueOrderByLibelleAsc().stream()
                .map(s -> new ServiceParcOption(
                        s.getId(), s.getCode(), s.getLibelle(), s.estParcMission()))
                .toList();
        List<ConducteurOption> optionsConducteurs = conducteurs
                .findByActifTrueAndDateValiditePermisGreaterThanEqualOrderByNomCompletAsc(
                        LocalDate.now(clock)).stream()
                .map(c -> new ConducteurOption(c.getId(), c.getMatricule(), c.getNomComplet()))
                .toList();
        return new OptionsResponse(optionsVehicules, optionsServices, optionsConducteurs);
    }

    @Transactional(readOnly = true)
    public AffectationDetailResponse consulter(UUID id) {
        return versDetail(trouver(id));
    }

    public AffectationDetailResponse creer(CreerAffectationRequest request) {
        Vehicule vehicule = vehiculeAffectable(request.vehiculeId());
        ServiceParc serviceParc = serviceActif(request.serviceParcId());
        Conducteur conducteur = conducteurActif(request.conducteurId());

        affectations.findByVehiculeIdAndStatut(vehicule.getId(), StatutAffectation.ACTIVE)
                .ifPresent(ancienne -> cloturerPourChangement(ancienne, request.dateDebut()));

        Affectation nouvelle = enregistrer(vehicule, serviceParc, conducteur,
                request.dateDebut(), request.motif(),
                request.dateFinPrevue(), request.typeMission());
        vehicule.changerSituation(StatutVehicule.AFFECTE, vehicule.getEtatGeneral());
        vehicules.save(vehicule);
        journalAudit.journaliser("CREATION", ENTITE, nouvelle.getId(), null, valeurs(nouvelle));
        return versDetail(nouvelle);
    }

    public AffectationDetailResponse changer(UUID id, ChangerAffectationRequest request) {
        Affectation ancienne = trouver(id);
        exigerActive(ancienne);
        ServiceParc serviceParc = serviceActif(request.serviceParcId());
        Conducteur conducteur = conducteurActif(request.conducteurId());
        cloturerPourChangement(ancienne, request.dateDebut());
        Affectation nouvelle = enregistrer(ancienne.getVehicule(), serviceParc, conducteur,
                request.dateDebut(), request.motif(),
                request.dateFinPrevue(), request.typeMission());
        journalAudit.journaliser("CHANGEMENT", ENTITE, nouvelle.getId(), null, valeurs(nouvelle));
        return versDetail(nouvelle);
    }

    public AffectationDetailResponse restituer(UUID id, RestituerAffectationRequest request) {
        Affectation affectation = trouver(id);
        exigerActive(affectation);
        Map<String, ?> anciennesValeurs = valeurs(affectation);
        affectation.cloturer(request.dateRestitution());
        affectations.saveAndFlush(affectation);
        Vehicule vehicule = affectation.getVehicule();
        vehicule.changerSituation(StatutVehicule.DISPONIBLE, vehicule.getEtatGeneral());
        vehicules.save(vehicule);
        journalAudit.journaliser("RESTITUTION", ENTITE, affectation.getId(),
                anciennesValeurs, Map.of(
                        "dateRestitution", request.dateRestitution(),
                        "motifRestitution", TexteNormalise.affichage(request.motif())));
        return versDetail(affectation);
    }

    private Affectation enregistrer(Vehicule vehicule, ServiceParc serviceParc,
                                    Conducteur conducteur, java.time.LocalDate dateDebut,
                                    String motif, java.time.LocalDate dateFinPrevue,
                                    String typeMission) {
        Mission mission = validerMission(serviceParc, dateDebut, dateFinPrevue, typeMission);
        try {
            return affectations.saveAndFlush(
                    new Affectation(vehicule, serviceParc, conducteur, dateDebut, motif,
                            mission.dateFinPrevue(), mission.typeMission()));
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Ce véhicule possède déjà une affectation active.");
        }
    }

    private void cloturerPourChangement(Affectation ancienne, java.time.LocalDate dateFin) {
        Map<String, ?> anciennesValeurs = valeurs(ancienne);
        ancienne.cloturer(dateFin);
        affectations.saveAndFlush(ancienne);
        journalAudit.journaliser("CLOTURE_AUTOMATIQUE", ENTITE, ancienne.getId(),
                anciennesValeurs, valeurs(ancienne));
    }

    private Affectation trouver(UUID id) {
        return affectations.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("L’affectation demandée est introuvable."));
    }

    private Vehicule vehiculeAffectable(UUID id) {
        Vehicule vehicule = vehicules.findById(id)
                .orElseThrow(() -> new NotFoundException("Le véhicule sélectionné est introuvable."));
        if (!STATUTS_AFFECTABLES.contains(vehicule.getStatut())) {
            throw new BusinessRuleException(
                    "Seul un véhicule disponible ou déjà affecté peut recevoir une affectation.");
        }
        return vehicule;
    }

    private ServiceParc serviceActif(UUID id) {
        ServiceParc serviceParc = servicesParcs.findById(id)
                .orElseThrow(() -> new NotFoundException("Le service ou parc sélectionné est introuvable."));
        if (!serviceParc.isActif()) {
            throw new BusinessRuleException("Le service ou parc sélectionné est inactif.");
        }
        return serviceParc;
    }

    private Conducteur conducteurActif(UUID id) {
        Conducteur conducteur = conducteurs.findById(id)
                .orElseThrow(() -> new NotFoundException("Le conducteur sélectionné est introuvable."));
        if (!conducteur.isActif()) {
            throw new BusinessRuleException("Le conducteur sélectionné est inactif.");
        }
        if (conducteur.getDateValiditePermis().isBefore(LocalDate.now(clock))) {
            throw new BusinessRuleException(
                    "Le permis du conducteur sélectionné n’est plus valide.");
        }
        return conducteur;
    }

    private void exigerActive(Affectation affectation) {
        if (affectation.getStatut() != StatutAffectation.ACTIVE) {
            throw new BusinessRuleException("Seule une affectation active peut être modifiée ou restituée.");
        }
    }

    private AffectationDetailResponse versDetail(Affectation affectation) {
        List<AffectationResponse> historique = affectations
                .findByVehiculeIdOrderByDateDebutDescDateCreationDesc(
                        affectation.getVehicule().getId()).stream()
                .map(this::versResponse).toList();
        List<EvenementResponse> journal = journalAudit
                .historique(ENTITE, affectation.getId()).stream()
                .map(this::versEvenement).toList();
        return new AffectationDetailResponse(versResponse(affectation), historique, journal);
    }

    private AffectationResponse versResponse(Affectation affectation) {
        Vehicule v = affectation.getVehicule();
        ServiceParc s = affectation.getServiceParc();
        Conducteur c = affectation.getConducteur();
        return new AffectationResponse(
                affectation.getId(),
                v.getId(), v.getCode(), v.getImmatriculation(),
                v.getModele().getMarque().getDesignation() + " " + v.getModele().getNom(),
                s.getId(), s.getCode(), s.getLibelle(),
                c.getId(), c.getMatricule(), c.getNomComplet(),
                affectation.getDateDebut(), affectation.getDateFin(),
                affectation.getDateFinPrevue(), affectation.getMotif(),
                affectation.getTypeMission(), affectation.estEligibleOrdreMission(),
                affectation.getStatut(), affectation.getDateCreation(), affectation.getCreePar());
    }

    private EvenementResponse versEvenement(JournalAudit evenement) {
        return new EvenementResponse(evenement.getAction(), evenement.getDateAction(),
                evenement.getUtilisateur(), evenement.getAnciennesValeurs(),
                evenement.getNouvellesValeurs());
    }

    private Map<String, ?> valeurs(Affectation affectation) {
        return Map.of(
                "vehicule", affectation.getVehicule().getCode(),
                "serviceParc", affectation.getServiceParc().getCode(),
                "conducteur", affectation.getConducteur().getMatricule(),
                "dateDebut", affectation.getDateDebut(),
                "dateFin", affectation.getDateFin() == null ? "" : affectation.getDateFin(),
                "dateFinPrevue", affectation.getDateFinPrevue() == null
                        ? "" : affectation.getDateFinPrevue(),
                "motif", affectation.getMotif(),
                "typeMission", affectation.getTypeMission() == null
                        ? "" : affectation.getTypeMission(),
                "statut", affectation.getStatut());
    }

    private Mission validerMission(ServiceParc serviceParc, java.time.LocalDate dateDebut,
                                    java.time.LocalDate dateFinPrevue, String typeMission) {
        if (!serviceParc.estParcMission()) {
            return new Mission(null, null);
        }
        String type = TexteNormalise.affichage(typeMission);
        if (dateFinPrevue == null) {
            throw new BusinessRuleException(
                    "La date de fin est obligatoire pour une affectation de mission.");
        }
        if (dateFinPrevue.isBefore(dateDebut)) {
            throw new BusinessRuleException(
                    "La date de fin de mission ne peut pas précéder la date de début.");
        }
        if (type == null || type.isBlank()) {
            throw new BusinessRuleException(
                    "Le type de mission est obligatoire pour une affectation de mission.");
        }
        return new Mission(dateFinPrevue, type);
    }

    private record Mission(java.time.LocalDate dateFinPrevue, String typeMission) {}
}
