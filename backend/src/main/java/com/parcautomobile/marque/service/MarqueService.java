package com.parcautomobile.marque.service;

import static com.parcautomobile.marque.api.MarqueDtos.*;
import static com.parcautomobile.marque.service.MarqueModeleMapper.versDetail;
import static com.parcautomobile.shared.audit.AuditResponseMapper.historique;

import java.util.List;
import java.util.Map;

import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.marque.domain.Marque;
import com.parcautomobile.marque.repository.MarqueCodeRepository;
import com.parcautomobile.marque.repository.MarqueRepository;
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.modele.repository.ModeleRepository;
import com.parcautomobile.modele.service.ModeleService;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.TexteNormalise;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MarqueService {
    private static final String ENTITE = "MARQUE";

    private final MarqueRepository marqueRepository;
    private final ModeleRepository modeleRepository;
    private final ModeleService modeleService;
    private final MarqueCodeRepository codeRepository;
    private final JournalAuditService journalAudit;

    public MarqueService(MarqueRepository marqueRepository, ModeleRepository modeleRepository,
                         ModeleService modeleService, MarqueCodeRepository codeRepository,
                         JournalAuditService journalAudit) {
        this.marqueRepository = marqueRepository;
        this.modeleRepository = modeleRepository;
        this.modeleService = modeleService;
        this.codeRepository = codeRepository;
        this.journalAudit = journalAudit;
    }

    @Transactional(readOnly = true)
    public MarqueStatistiquesResponse statistiques() {
        return new MarqueStatistiquesResponse(marqueRepository.count(), modeleRepository.count());
    }

    @Transactional(readOnly = true)
    public PageResponse<MarqueListeResponse> rechercher(String search, int page, int taille) {
        Page<MarqueListeResponse> résultat = marqueRepository
                .rechercher(TexteNormalise.affichage(search == null ? "" : search),
                        PageRequest.of(page, taille, Sort.by("designation").ascending()))
                .map(this::versListe);
        return PageResponse.of(résultat);
    }

    @Transactional(readOnly = true)
    public List<MarqueOptionResponse> listerMarques() {
        return marqueRepository.findAll(Sort.by("designation").ascending()).stream()
                .map(marque -> new MarqueOptionResponse(marque.getCode(), marque.getDesignation()))
                .toList();
    }

    @Transactional(readOnly = true)
    public MarqueDetailResponse consulter(String code) {
        return versDetailAvecHistorique(trouverMarque(code));
    }

    public MarqueDetailResponse créer(CreerMarqueRequest request) {
        vérifierMarqueUnique(request.designation(), null);
        Marque marque = new Marque(codeRepository.prochainCode(request.designation()), request.designation());
        List<Modele> nouveauxModeles = modeleService.rattacher(marque, request.modeles(), false);
        marqueRepository.saveAndFlush(marque);
        journalAudit.journaliser("CREATION", ENTITE, marque.getId(), null, valeurs(marque));
        modeleService.journaliserCréations(nouveauxModeles);
        return versDetailAvecHistorique(marque);
    }

    public MarqueDetailResponse modifier(String code, ModifierMarqueRequest request) {
        Marque marque = trouverMarque(code);
        vérifierMarqueUnique(request.designation(), code);
        Map<String, ?> anciennesValeurs = valeurs(marque);
        marque.modifierDesignation(request.designation());
        marqueRepository.saveAndFlush(marque);
        journalAudit.journaliser("MODIFICATION", ENTITE, marque.getId(),
                anciennesValeurs, valeurs(marque));
        return versDetailAvecHistorique(marque);
    }

    public void supprimer(String code) {
        Marque marque = trouverMarque(code);
        Map<String, ?> anciennesValeurs = valeurs(marque);
        try {
            marqueRepository.delete(marque);
            marqueRepository.flush();
            journalAudit.journaliser("SUPPRESSION", ENTITE, marque.getId(), anciennesValeurs, null);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Cette marque ou l’un de ses modèles est utilisé par un véhicule.");
        }
    }

    private Marque trouverMarque(String code) {
        return marqueRepository.findDetailByCode(code)
                .orElseThrow(() -> new NotFoundException("La marque « %s » est introuvable.".formatted(code)));
    }

    private void vérifierMarqueUnique(String designation, String codeExclu) {
        String valeur = TexteNormalise.affichage(designation);
        boolean existe = codeExclu == null
                ? marqueRepository.existsByDesignation(valeur)
                : marqueRepository.existsByDesignationAndCodeNot(valeur, codeExclu);
        if (existe) {
            throw new ConflictException("Une marque avec cette désignation existe déjà.");
        }
    }

    private MarqueListeResponse versListe(Marque marque) {
        return new MarqueListeResponse(marque.getCode(), marque.getDesignation(), marque.getModeles().size(),
                marque.getDateCreation(), marque.getCreePar());
    }

    private MarqueDetailResponse versDetailAvecHistorique(Marque marque) {
        return versDetail(marque, historique(journalAudit, ENTITE, marque.getId()));
    }

    private Map<String, ?> valeurs(Marque marque) {
        return Map.of(
                "code", marque.getCode(),
                "designation", marque.getDesignation(),
                "modeles", marque.getModeles().stream().map(Modele::getNom).toList());
    }
}
