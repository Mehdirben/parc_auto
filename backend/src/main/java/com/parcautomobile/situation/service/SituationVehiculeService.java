package com.parcautomobile.situation.service;

import static com.parcautomobile.situation.api.SituationVehiculeDtos.*;

import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.parcautomobile.affectation.domain.Affectation;
import com.parcautomobile.affectation.domain.StatutAffectation;
import com.parcautomobile.affectation.repository.AffectationRepository;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.marque.domain.Marque;
import com.parcautomobile.marque.repository.MarqueCodeRepository;
import com.parcautomobile.marque.repository.MarqueRepository;
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.modele.repository.ModeleRepository;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.TexteNormalise;
import com.parcautomobile.situation.service.SituationExcelMapper.LigneImport;
import com.parcautomobile.vehicule.domain.Carburant;
import com.parcautomobile.vehicule.domain.EtatGeneral;
import com.parcautomobile.vehicule.domain.GenreVehicule;
import com.parcautomobile.vehicule.domain.ImmatriculationMarocaine;
import com.parcautomobile.vehicule.domain.StatutVehicule;
import com.parcautomobile.vehicule.domain.Vehicule;
import com.parcautomobile.vehicule.repository.VehiculeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class SituationVehiculeService {
    private static final String ENTITE_IMPORT = "IMPORT_SITUATION_VEHICULES";
    private static final long TAILLE_MAX = 10L * 1024 * 1024;

    private final VehiculeRepository vehicules;
    private final AffectationRepository affectations;
    private final MarqueRepository marques;
    private final MarqueCodeRepository codesMarques;
    private final ModeleRepository modeles;
    private final SituationExcelMapper excel;
    private final JournalAuditService journalAudit;

    public SituationVehiculeService(
            VehiculeRepository vehicules,
            AffectationRepository affectations,
            MarqueRepository marques,
            MarqueCodeRepository codesMarques,
            ModeleRepository modeles,
            SituationExcelMapper excel,
            JournalAuditService journalAudit) {
        this.vehicules = vehicules;
        this.affectations = affectations;
        this.marques = marques;
        this.codesMarques = codesMarques;
        this.modeles = modeles;
        this.excel = excel;
        this.journalAudit = journalAudit;
    }

    @Transactional(readOnly = true)
    public PageResponse<SituationVehiculeResponse> rechercher(
            String search, StatutVehicule statut, GenreVehicule genre,
            Carburant carburant, int page, int taille) {
        Page<Vehicule> résultat = vehicules.rechercher(
                TexteNormalise.affichage(search == null ? "" : search),
                statut, genre, carburant, "",
                PageRequest.of(page, taille, Sort.by("code").descending()));
        Map<UUID, Affectation> actives = affectationsActives(résultat.getContent());
        AtomicInteger index = new AtomicInteger(page * taille);
        return PageResponse.of(résultat.map(vehicule ->
                versSituation(vehicule, actives.get(vehicule.getId()), index.getAndIncrement())));
    }

    @Transactional(readOnly = true)
    public byte[] exporter(
            String search, StatutVehicule statut, GenreVehicule genre, Carburant carburant) {
        Page<Vehicule> résultat = vehicules.rechercher(
                TexteNormalise.affichage(search == null ? "" : search),
                statut, genre, carburant, "",
                Pageable.unpaged(Sort.by("code").descending()));
        Map<UUID, Affectation> actives = affectationsActives(résultat.getContent());
        List<SituationVehiculeResponse> lignes = new ArrayList<>();
        for (int index = 0; index < résultat.getContent().size(); index++) {
            Vehicule vehicule = résultat.getContent().get(index);
            lignes.add(versSituation(vehicule, actives.get(vehicule.getId()), index));
        }
        return excel.exporter(lignes);
    }

    @Transactional(readOnly = true)
    public byte[] modèleImportVide() {
        return excel.exporter(List.of());
    }

    @Transactional(readOnly = true)
    public ApercuImportResponse prévisualiser(MultipartFile fichier) {
        FichierImport importé = lire(fichier);
        List<AnalyseLigne> analyses = analyser(importé.lignes());
        Compteurs compteurs = compter(analyses);
        return new ApercuImportResponse(
                importé.nom(), analyses.size(), compteurs.créations(),
                compteurs.misesAJour(), compteurs.ignorées(),
                analyses.stream().map(AnalyseLigne::response).toList());
    }

    public ResultatImportResponse importer(MultipartFile fichier) {
        FichierImport importé = lire(fichier);
        List<AnalyseLigne> analyses = analyser(importé.lignes());
        int créations = 0;
        int misesAJour = 0;
        for (AnalyseLigne analyse : analyses) {
            if ("IGNOREE".equals(analyse.action())) continue;
            LigneImport ligne = analyse.ligne();
            if ("CREATION".equals(analyse.action())) {
                créer(ligne);
                créations++;
            } else {
                mettreAJour(analyse.vehicule(), ligne);
                misesAJour++;
            }
        }
        vehicules.flush();
        Compteurs compteurs = new Compteurs(créations, misesAJour,
                (int) analyses.stream().filter(a -> "IGNOREE".equals(a.action())).count());
        UUID importId = UUID.randomUUID();
        journalAudit.journaliser("IMPORT", ENTITE_IMPORT, importId, null, Map.of(
                "nomFichier", importé.nom(),
                "nombreLignes", analyses.size(),
                "nombreCreations", compteurs.créations(),
                "nombreMisesAJour", compteurs.misesAJour(),
                "nombreLignesIgnorees", compteurs.ignorées()));
        return new ResultatImportResponse(
                importé.nom(), compteurs.créations(), compteurs.misesAJour(),
                compteurs.ignorées(), analyses.stream().map(AnalyseLigne::response).toList());
    }

    private List<AnalyseLigne> analyser(List<LigneImport> lignes) {
        List<AnalyseLigne> résultats = new ArrayList<>();
        Set<String> immatriculationsDuFichier = new HashSet<>();
        for (LigneImport ligne : lignes) {
            String cléImmatriculation = TexteNormalise.cle(ligne.immatriculation());
            if (vide(ligne.immatriculation()) || vide(ligne.marque()) || vide(ligne.vin())) {
                résultats.add(ignorée(ligne, "Immatriculation, marque ou VIN manquant."));
                continue;
            }
            if (!immatriculationsDuFichier.add(cléImmatriculation)) {
                résultats.add(ignorée(ligne, "Immatriculation déjà présente dans ce fichier."));
                continue;
            }
            Vehicule existant = vehicules.findByImmatriculation(cléImmatriculation)
                    .orElse(null);
            if (vehicules.existsByVinAndIdNot(
                    TexteNormalise.cle(ligne.vin()),
                    existant == null ? new UUID(0, 0) : existant.getId())) {
                résultats.add(ignorée(ligne, "VIN déjà utilisé par un autre véhicule."));
                continue;
            }
            String erreur = valider(ligne, existant == null);
            if (erreur != null) {
                résultats.add(ignorée(ligne, erreur));
                continue;
            }
            résultats.add(new AnalyseLigne(
                    ligne, existant == null ? "CREATION" : "MISE_A_JOUR",
                    existant == null ? "Nouveau véhicule" : "Véhicule existant rapproché",
                    existant));
        }
        return résultats;
    }

    private String valider(LigneImport ligne, boolean création) {
        if (!ImmatriculationMarocaine.estValide(ligne.immatriculation())) {
            return "Format d'immatriculation marocain non reconnu.";
        }
        if (ligne.dateMiseEnCirculation() != null
                && ligne.dateMiseEnCirculation().isAfter(LocalDate.now())) {
            return "La date de mise en circulation est future.";
        }
        if (ligne.puissanceFiscale() != null && ligne.puissanceFiscale() <= 0) {
            return "La puissance fiscale doit être positive.";
        }
        if (ligne.poidsTotalCharge() != null && ligne.poidsTotalCharge().signum() <= 0) {
            return "Le poids total en charge doit être positif.";
        }
        if (ligne.kilometrage() != null && ligne.kilometrage() < 0) {
            return "Le kilométrage doit être positif ou nul.";
        }
        if (!vide(ligne.genre()) && genre(ligne.genre()) == null) {
            return "Genre de véhicule non reconnu.";
        }
        if (!vide(ligne.carburant()) && carburant(ligne.carburant()) == null) {
            return "Carburant non reconnu.";
        }
        if (!vide(ligne.observation()) && état(ligne.observation()) == null) {
            return "Observation/état général non reconnu.";
        }
        if (création && (genre(ligne.genre()) == null || carburant(ligne.carburant()) == null)) {
            return "Genre et carburant obligatoires pour créer un véhicule.";
        }
        return null;
    }

    private void créer(LigneImport ligne) {
        Modele modele = trouverOuCréerModele(ligne.marque(), ligne.type());
        long kilometrage = ligne.kilometrage() == null ? 0 : ligne.kilometrage();
        Vehicule vehicule = new Vehicule(
                "VEH%07d".formatted(vehicules.prochainNumeroCode()),
                ligne.immatriculation(), null, modele, genre(ligne.genre()), ligne.vin(),
                carburant(ligne.carburant()), null, ligne.puissanceFiscale(), null,
                ligne.poidsTotalCharge(), kilometrage, ligne.dateMiseEnCirculation(), null,
                StatutVehicule.DISPONIBLE,
                état(ligne.observation()) == null ? EtatGeneral.BON_ETAT : état(ligne.observation()));
        vehicules.save(vehicule);
    }

    private void mettreAJour(Vehicule vehicule, LigneImport ligne) {
        Modele modele = vide(ligne.type())
                ? null : trouverOuCréerModele(ligne.marque(), ligne.type());
        vehicule.appliquerImport(
                modele, genre(ligne.genre()), ligne.vin(), carburant(ligne.carburant()),
                ligne.puissanceFiscale(), ligne.poidsTotalCharge(),
                ligne.dateMiseEnCirculation(), ligne.kilometrage(), état(ligne.observation()));
        vehicules.save(vehicule);
    }

    private Modele trouverOuCréerModele(String désignationMarque, String nomModele) {
        Marque marque = marques.findByDesignation(TexteNormalise.affichage(désignationMarque)).orElseGet(() ->
                marques.save(new Marque(
                        codesMarques.prochainCode(désignationMarque), désignationMarque)));
        String nom = vide(nomModele) ? "NON RENSEIGNÉ" : nomModele;
        return modeles.findByMarqueIdAndNom(marque.getId(), TexteNormalise.affichage(nom))
                .orElseGet(() -> {
                    Modele modele = new Modele(nom);
                    marque.ajouterModele(modele);
                    return modeles.save(modele);
                });
    }

    private Map<UUID, Affectation> affectationsActives(List<Vehicule> véhicules) {
        if (véhicules.isEmpty()) return Map.of();
        return affectations.findByVehiculeIdInAndStatut(
                        véhicules.stream().map(Vehicule::getId).toList(), StatutAffectation.ACTIVE)
                .stream().collect(Collectors.toMap(
                        affectation -> affectation.getVehicule().getId(),
                        Function.identity(), (première, seconde) -> première));
    }

    private SituationVehiculeResponse versSituation(
            Vehicule vehicule, Affectation affectation, int index) {
        return new SituationVehiculeResponse(
                index + 1, vehicule.getCode(), vehicule.getImmatriculation(),
                vehicule.getModele().getMarque().getDesignation(),
                vehicule.getModele().getNom(), vehicule.getGenre(), vehicule.getVin(),
                vehicule.getCarburant(), vehicule.getPuissanceFiscale(),
                vehicule.getPoidsTotalCharge(), vehicule.getDatePremiereMiseCirculation(),
                affectation == null ? null : affectation.getServiceParc().getLibelle(),
                affectation == null ? null : affectation.getConducteur().getNomComplet(),
                vehicule.getKilometrageActuel(), vehicule.getEtatGeneral(), vehicule.getStatut());
    }

    private FichierImport lire(MultipartFile fichier) {
        vérifierFichier(fichier);
        try {
            return new FichierImport(nomFichierSûr(fichier.getOriginalFilename()),
                    excel.lire(fichier.getInputStream()));
        } catch (IOException exception) {
            throw new BusinessRuleException("Impossible de lire le fichier transmis.");
        }
    }

    private void vérifierFichier(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new BusinessRuleException("Le fichier SIT.xlsx est obligatoire.");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new BusinessRuleException("Le fichier ne doit pas dépasser 10 Mo.");
        }
        String nom = fichier.getOriginalFilename();
        if (nom == null || !nom.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw new BusinessRuleException("Seuls les fichiers Excel .xlsx sont autorisés.");
        }
    }

    private String nomFichierSûr(String nomOriginal) {
        String normalisé = nomOriginal == null ? "SIT.xlsx" : nomOriginal.replace('\\', '/');
        return normalisé.substring(normalisé.lastIndexOf('/') + 1);
    }

    private AnalyseLigne ignorée(LigneImport ligne, String message) {
        return new AnalyseLigne(ligne, "IGNOREE", message, null);
    }

    private Compteurs compter(List<AnalyseLigne> analyses) {
        Map<String, Long> nombres = analyses.stream()
                .collect(Collectors.groupingBy(AnalyseLigne::action, Collectors.counting()));
        return new Compteurs(
                nombres.getOrDefault("CREATION", 0L).intValue(),
                nombres.getOrDefault("MISE_A_JOUR", 0L).intValue(),
                nombres.getOrDefault("IGNOREE", 0L).intValue());
    }

    private GenreVehicule genre(String valeur) {
        return convertir(valeur, Map.ofEntries(
                Map.entry("VOITURE TOURISME", GenreVehicule.VOITURE_TOURISME),
                Map.entry("VOITURE DE TOURISME", GenreVehicule.VOITURE_TOURISME),
                Map.entry("FOURGONNETTE VITREE", GenreVehicule.FOURGONNETTE_VITREE),
                Map.entry("FOURGONNETTE", GenreVehicule.FOURGONNETTE),
                Map.entry("MINIBUS", GenreVehicule.MINIBUS),
                Map.entry("UTILITAIRE", GenreVehicule.UTILITAIRE),
                Map.entry("CYCLOMOTEUR", GenreVehicule.CYCLOMOTEUR)));
    }

    private Carburant carburant(String valeur) {
        return convertir(valeur, Map.of(
                "DIESEL", Carburant.DIESEL, "ESSENCE", Carburant.ESSENCE,
                "HYBRIDE", Carburant.HYBRIDE, "ELECTRIQUE", Carburant.ELECTRIQUE,
                "MELANGE", Carburant.MELANGE));
    }

    private EtatGeneral état(String valeur) {
        return convertir(valeur, Map.of(
                "BON ETAT", EtatGeneral.BON_ETAT,
                "ETAT MOYEN", EtatGeneral.ETAT_MOYEN,
                "MAUVAIS ETAT", EtatGeneral.MAUVAIS_ETAT));
    }

    private <T> T convertir(String valeur, Map<String, T> valeurs) {
        return vide(valeur) ? null : valeurs.get(cléLibellé(valeur));
    }

    private String cléLibellé(String valeur) {
        return Normalizer.normalize(valeur, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", " ")
                .trim();
    }

    private boolean vide(String valeur) {
        return valeur == null || valeur.isBlank();
    }

    private record FichierImport(String nom, List<LigneImport> lignes) {}
    private record Compteurs(int créations, int misesAJour, int ignorées) {}
    private record AnalyseLigne(
            LigneImport ligne, String action, String message, Vehicule vehicule) {
        LigneApercuImportResponse response() {
            return new LigneApercuImportResponse(
                    ligne.numeroLigne(), ligne.immatriculation(), ligne.marque(),
                    ligne.type(), ligne.vin(), action, message);
        }
    }
}
