package com.parcautomobile.modele.service;

import static com.parcautomobile.marque.api.MarqueDtos.MarqueDetailResponse;
import static com.parcautomobile.marque.service.MarqueModeleMapper.valeursModele;
import static com.parcautomobile.marque.service.MarqueModeleMapper.versDetail;
import static com.parcautomobile.marque.service.MarqueModeleMapper.versModele;
import static com.parcautomobile.modele.api.ModeleDtos.*;
import static com.parcautomobile.shared.audit.AuditResponseMapper.historique;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.marque.domain.Marque;
import com.parcautomobile.marque.repository.MarqueRepository;
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.modele.repository.ModeleRepository;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.ListeTextes;
import com.parcautomobile.shared.text.TexteNormalise;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ModeleService {
    private static final String ENTITE_MARQUE = "MARQUE";
    private static final String ENTITE_MODELE = "MODELE";

    private final MarqueRepository marqueRepository;
    private final ModeleRepository modeleRepository;
    private final JournalAuditService journalAudit;

    public ModeleService(MarqueRepository marqueRepository, ModeleRepository modeleRepository,
                         JournalAuditService journalAudit) {
        this.marqueRepository = marqueRepository;
        this.modeleRepository = modeleRepository;
        this.journalAudit = journalAudit;
    }

    @Transactional(readOnly = true)
    public PageResponse<ModeleListeResponse> rechercher(String search, int page, int taille) {
        Page<ModeleListeResponse> résultat = modeleRepository
                .rechercher(TexteNormalise.affichage(search == null ? "" : search),
                        PageRequest.of(page, taille, Sort.by("nom").ascending()))
                .map(this::versListe);
        return PageResponse.of(résultat);
    }

    @Transactional(readOnly = true)
    public ModeleDetailResponse consulter(UUID id) {
        return versDetailModèle(trouverModèle(id));
    }

    public MarqueDetailResponse ajouter(String code, AjouterModelesRequest request) {
        Marque marque = trouverMarque(code);
        List<Modele> nouveauxModeles = rattacher(marque, request.noms(), true);
        marqueRepository.saveAndFlush(marque);
        journaliserCréations(nouveauxModeles);
        return versDetail(
                marque,
                historique(journalAudit, ENTITE_MARQUE, marque.getId()));
    }

    public List<Modele> rattacher(Marque marque, List<String> valeurs, boolean vérifierExistence) {
        List<String> noms = ListeTextes.dédupliquer(valeurs);
        if (vérifierExistence) {
            for (String nom : noms) {
                if (modeleRepository.existsByMarqueCodeAndNom(
                        marque.getCode(), TexteNormalise.affichage(nom))) {
                    throw new ConflictException(
                            "Le modèle « %s » existe déjà pour cette marque.".formatted(nom));
                }
            }
        }
        List<Modele> nouveauxModeles = noms.stream().map(Modele::new).toList();
        nouveauxModeles.forEach(marque::ajouterModele);
        return nouveauxModeles;
    }

    public void journaliserCréations(List<Modele> modeles) {
        modeles.forEach(modele -> journalAudit.journaliser(
                "CREATION", ENTITE_MODELE, modele.getId(), null, valeursModele(modele)));
    }

    public ModeleResponse modifier(UUID id, ModifierModeleRequest request) {
        Modele modele = trouverModèle(id);
        if (modeleRepository.existsByMarqueCodeAndNomAndIdNot(
                modele.getMarque().getCode(), TexteNormalise.affichage(request.nom()), id)) {
            throw new ConflictException("Ce modèle existe déjà pour cette marque.");
        }
        Map<String, ?> anciennesValeurs = valeursModele(modele);
        modele.modifierNom(request.nom());
        modeleRepository.saveAndFlush(modele);
        journalAudit.journaliser(
                "MODIFICATION", ENTITE_MODELE, modele.getId(), anciennesValeurs, valeursModele(modele));
        return versModele(modele);
    }

    public void supprimer(UUID id) {
        Modele modele = trouverModèle(id);
        Map<String, ?> anciennesValeurs = valeursModele(modele);
        try {
            modeleRepository.delete(modele);
            modeleRepository.flush();
            journalAudit.journaliser("SUPPRESSION", ENTITE_MODELE, modele.getId(), anciennesValeurs, null);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Ce modèle est utilisé par un véhicule et ne peut pas être supprimé.");
        }
    }

    private Marque trouverMarque(String code) {
        return marqueRepository.findDetailByCode(code)
                .orElseThrow(() -> new NotFoundException(
                        "La marque « %s » est introuvable.".formatted(code)));
    }

    private Modele trouverModèle(UUID id) {
        return modeleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Le modèle demandé est introuvable."));
    }

    private ModeleListeResponse versListe(Modele modele) {
        return new ModeleListeResponse(
                modele.getId(),
                modele.getNom(),
                modele.getMarque().getCode(),
                modele.getMarque().getDesignation(),
                modele.getDateCreation(),
                modele.getCreePar());
    }

    private ModeleDetailResponse versDetailModèle(Modele modele) {
        return new ModeleDetailResponse(
                modele.getId(),
                modele.getNom(),
                modele.getMarque().getCode(),
                modele.getMarque().getDesignation(),
                historique(journalAudit, ENTITE_MODELE, modele.getId()),
                modele.getDateCreation(),
                modele.getCreePar(),
                modele.getDateModification(),
                modele.getModifiePar());
    }

}
