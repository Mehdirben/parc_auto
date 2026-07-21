package ma.gov.mesrsi.parcautomobile.referentiel.service;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.MarqueDtos.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.Marque;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.Modele;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.TexteNormalise;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.MarqueCodeRepository;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.MarqueRepository;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.ModeleRepository;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import ma.gov.mesrsi.parcautomobile.shared.NotFoundException;
import ma.gov.mesrsi.parcautomobile.shared.PageResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MarqueService {
    private final MarqueRepository marqueRepository;
    private final ModeleRepository modeleRepository;
    private final MarqueCodeRepository codeRepository;

    public MarqueService(MarqueRepository marqueRepository, ModeleRepository modeleRepository,
                         MarqueCodeRepository codeRepository) {
        this.marqueRepository = marqueRepository;
        this.modeleRepository = modeleRepository;
        this.codeRepository = codeRepository;
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
    public MarqueDetailResponse consulter(String code) {
        return versDetail(trouverMarque(code));
    }

    public MarqueDetailResponse créer(CreerMarqueRequest request) {
        vérifierMarqueUnique(request.designation(), null);
        Marque marque = new Marque(codeRepository.prochainCode(request.designation()), request.designation());
        for (String nom : dédupliquer(request.modeles())) {
            marque.ajouterModele(new Modele(nom));
        }
        return versDetail(marqueRepository.saveAndFlush(marque));
    }

    public MarqueDetailResponse modifier(String code, ModifierMarqueRequest request) {
        Marque marque = trouverMarque(code);
        vérifierMarqueUnique(request.designation(), code);
        marque.modifierDesignation(request.designation());
        return versDetail(marqueRepository.saveAndFlush(marque));
    }

    public void supprimer(String code) {
        Marque marque = trouverMarque(code);
        try {
            marqueRepository.delete(marque);
            marqueRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Cette marque ou l’un de ses modèles est utilisé par un véhicule.");
        }
    }

    public MarqueDetailResponse ajouterModèles(String code, AjouterModelesRequest request) {
        Marque marque = trouverMarque(code);
        List<String> noms = dédupliquer(request.noms());
        for (String nom : noms) {
            if (modeleRepository.existsByMarqueCodeAndNomNormalise(code, TexteNormalise.cle(nom))) {
                throw new ConflictException("Le modèle « %s » existe déjà pour cette marque.".formatted(nom));
            }
        }
        noms.forEach(nom -> marque.ajouterModele(new Modele(nom)));
        return versDetail(marqueRepository.saveAndFlush(marque));
    }

    public ModeleResponse modifierModèle(UUID id, ModifierModeleRequest request) {
        Modele modele = trouverModèle(id);
        if (modeleRepository.existsByMarqueCodeAndNomNormaliseAndIdNot(
                modele.getMarque().getCode(), TexteNormalise.cle(request.nom()), id)) {
            throw new ConflictException("Ce modèle existe déjà pour cette marque.");
        }
        modele.modifierNom(request.nom());
        return versModele(modeleRepository.saveAndFlush(modele));
    }

    public void supprimerModèle(UUID id) {
        Modele modele = trouverModèle(id);
        try {
            modeleRepository.delete(modele);
            modeleRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Ce modèle est utilisé par un véhicule et ne peut pas être supprimé.");
        }
    }

    private Marque trouverMarque(String code) {
        return marqueRepository.findDetailByCode(code)
                .orElseThrow(() -> new NotFoundException("La marque « %s » est introuvable.".formatted(code)));
    }

    private Modele trouverModèle(UUID id) {
        return modeleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Le modèle demandé est introuvable."));
    }

    private void vérifierMarqueUnique(String designation, String codeExclu) {
        String normalisée = TexteNormalise.cle(designation);
        boolean existe = codeExclu == null
                ? marqueRepository.existsByDesignationNormalisee(normalisée)
                : marqueRepository.existsByDesignationNormaliseeAndCodeNot(normalisée, codeExclu);
        if (existe) {
            throw new ConflictException("Une marque avec cette désignation existe déjà.");
        }
    }

    private List<String> dédupliquer(List<String> valeurs) {
        if (valeurs == null) return List.of();
        Map<String, String> uniques = new LinkedHashMap<>();
        valeurs.stream()
                .filter(valeur -> valeur != null && !valeur.isBlank())
                .flatMap(valeur -> List.of(valeur.split(";")).stream())
                .map(TexteNormalise::affichage)
                .forEach(valeur -> uniques.putIfAbsent(TexteNormalise.cle(valeur), valeur));
        return new ArrayList<>(uniques.values());
    }

    private MarqueListeResponse versListe(Marque marque) {
        return new MarqueListeResponse(marque.getCode(), marque.getDesignation(), marque.getModeles().size(),
                marque.getDateCreation(), marque.getCreePar());
    }

    private MarqueDetailResponse versDetail(Marque marque) {
        return new MarqueDetailResponse(marque.getCode(), marque.getDesignation(),
                marque.getModeles().stream().map(this::versModele).toList(),
                marque.getDateCreation(), marque.getCreePar(),
                marque.getDateModification(), marque.getModifiePar());
    }

    private ModeleResponse versModele(Modele modele) {
        return new ModeleResponse(modele.getId(), modele.getNom());
    }
}
