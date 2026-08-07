package com.parcautomobile.vehicule.service;

import static com.parcautomobile.shared.HistoriqueAuditMapper.historique;
import static com.parcautomobile.vehicule.api.VehiculeDtos.*;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.modele.repository.ModeleRepository;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.ConflictException;
import com.parcautomobile.shared.NotFoundException;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.shared.text.TexteNormalise;
import com.parcautomobile.vehicule.domain.*;
import com.parcautomobile.vehicule.repository.PieceJointeVehiculeRepository;
import com.parcautomobile.vehicule.repository.ReleveKilometriqueRepository;
import com.parcautomobile.vehicule.repository.VehiculeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class VehiculeService {
    private static final String ENTITE = "VEHICULE";
    private static final long TAILLE_MAX = 5L * 1024 * 1024;
    private static final Set<String> TYPES_AUTORISES =
            Set.of("application/pdf", "image/jpeg", "image/png");

    private final VehiculeRepository vehicules;
    private final ModeleRepository modeles;
    private final ReleveKilometriqueRepository releves;
    private final PieceJointeVehiculeRepository pieces;
    private final JournalAuditService journalAudit;
    private final VehiculeAffectationReader affectations;

    public VehiculeService(VehiculeRepository vehicules, ModeleRepository modeles,
                           ReleveKilometriqueRepository releves,
                           PieceJointeVehiculeRepository pieces,
                           JournalAuditService journalAudit,
                           VehiculeAffectationReader affectations) {
        this.vehicules = vehicules;
        this.modeles = modeles;
        this.releves = releves;
        this.pieces = pieces;
        this.journalAudit = journalAudit;
        this.affectations = affectations;
    }

    @Transactional(readOnly = true)
    public PageResponse<VehiculeListeResponse> rechercher(
            String search, StatutVehicule statut, GenreVehicule genre,
            Carburant carburant, String marque, int page, int taille) {
        return PageResponse.of(vehicules.rechercher(
                TexteNormalise.affichage(search == null ? "" : search),
                statut, genre, carburant,
                TexteNormalise.cle(marque == null ? "" : marque),
                PageRequest.of(page, taille, Sort.by("code").descending())).map(this::versListe));
    }

    @Transactional(readOnly = true)
    public VehiculeDetailResponse consulter(String code) {
        return versDetail(trouver(code));
    }

    @Transactional(readOnly = true)
    public VehiculeStatistiquesResponse statistiques() {
        return new VehiculeStatistiquesResponse(
                vehicules.count(),
                vehicules.countByStatut(StatutVehicule.DISPONIBLE),
                vehicules.countByStatut(StatutVehicule.AFFECTE),
                vehicules.countByStatut(StatutVehicule.IMMOBILISE),
                vehicules.countByStatut(StatutVehicule.EN_MAINTENANCE),
                vehicules.countByStatut(StatutVehicule.REFORME),
                vehicules.countByStatut(StatutVehicule.INACTIF));
    }

    public VehiculeDetailResponse créer(CreerVehiculeRequest request) {
        vérifierUnicité(request.immatriculation(), request.vin());
        Modele modele = modeles.findById(request.modeleId())
                .orElseThrow(() -> new NotFoundException("Le modèle sélectionné est introuvable."));
        String code = "VEH%07d".formatted(vehicules.prochainNumeroCode());
        Vehicule vehicule = new Vehicule(
                code, request.immatriculation(), request.ancienneImmatriculation(),
                modele, request.genre(), request.vin(), request.carburant(),
                request.nombreCylindres(), request.puissanceFiscale(),
                request.poidsVide(), request.poidsTotalCharge(),
                request.kilometrageInitial(), request.datePremiereMiseCirculation(),
                request.dateMutation(), request.statut(), request.etatGeneral());
        vehicules.saveAndFlush(vehicule);
        journalAudit.journaliser("CREATION", ENTITE, vehicule.getId(), null, valeurs(vehicule));
        return versDetail(vehicule);
    }

    public VehiculeDetailResponse modifierSituation(String code, ModifierSituationRequest request) {
        Vehicule vehicule = trouver(code);
        boolean affectationActive = affectations.possedeAffectationActive(vehicule.getId());
        if (affectationActive && request.statut() != StatutVehicule.AFFECTE) {
            throw new BusinessRuleException(
                    "Un véhicule avec une affectation active doit conserver le statut Affecté.");
        }
        if (!affectationActive && request.statut() == StatutVehicule.AFFECTE) {
            throw new BusinessRuleException(
                    "Le statut Affecté est réservé aux véhicules ayant une affectation active.");
        }
        Map<String, ?> anciennesValeurs = situation(vehicule);
        if (vehicule.changerSituation(request.statut(), request.etatGeneral())) {
            vehicules.saveAndFlush(vehicule);
            journalAudit.journaliser("MODIFICATION_SITUATION", ENTITE, vehicule.getId(),
                    anciennesValeurs, situation(vehicule));
        }
        return versDetail(vehicule);
    }

    public VehiculeDetailResponse ajouterReleve(String code, AjouterReleveRequest request) {
        Vehicule vehicule = trouver(code);
        if (request.kilometrage() < vehicule.getKilometrageActuel()
                && (request.commentaire() == null || request.commentaire().isBlank())) {
            throw new BusinessRuleException(
                    "Un commentaire est obligatoire lorsque le relevé est inférieur au kilométrage actuel.");
        }
        ReleveKilometrique releve = new ReleveKilometrique(
                vehicule, request.date(), request.kilometrage(),
                request.source(), request.commentaire());
        releves.saveAndFlush(releve);
        vehicule.prendreEnCompteKilometrage(request.kilometrage());
        vehicules.saveAndFlush(vehicule);
        journalAudit.journaliser("AJOUT_RELEVE", ENTITE, vehicule.getId(), null, Map.of(
                "date", request.date(),
                "kilometrage", request.kilometrage(),
                "source", request.source(),
                "commentaire", request.commentaire() == null ? "" : request.commentaire()));
        return versDetail(vehicule);
    }

    public VehiculeDetailResponse ajouterPiece(
            String code, TypePieceJointe typePiece, MultipartFile fichier) {
        Vehicule vehicule = trouver(code);
        vérifierFichier(fichier);
        try {
            String nom = nomFichierSûr(fichier.getOriginalFilename());
            PieceJointeVehicule piece = new PieceJointeVehicule(
                    vehicule, typePiece, nom, fichier.getContentType(), fichier.getBytes());
            pieces.saveAndFlush(piece);
            journalAudit.journaliser("AJOUT_PIECE_JOINTE", ENTITE, vehicule.getId(), null, Map.of(
                    "pieceId", piece.getId(),
                    "typePiece", typePiece,
                    "nomFichier", nom));
            return versDetail(vehicule);
        } catch (IOException exception) {
            throw new BusinessRuleException("Impossible de lire le fichier transmis.");
        }
    }

    public void supprimerPiece(String code, UUID pieceId) {
        Vehicule vehicule = trouver(code);
        PieceJointeVehicule piece = pieces.findByIdAndVehicule_Id(pieceId, vehicule.getId())
                .orElseThrow(() -> new NotFoundException("La pièce jointe est introuvable."));
        Map<String, ?> anciennesValeurs = Map.of(
                "pieceId", piece.getId(),
                "typePiece", piece.getTypePiece(),
                "nomFichier", piece.getNomFichier());
        pieces.delete(piece);
        pieces.flush();
        journalAudit.journaliser("SUPPRESSION_PIECE_JOINTE", ENTITE, vehicule.getId(),
                anciennesValeurs, null);
    }

    @Transactional(readOnly = true)
    public PieceJointeVehicule téléchargerPiece(String code, UUID pieceId) {
        Vehicule vehicule = trouver(code);
        return pieces.findByIdAndVehicule_Id(pieceId, vehicule.getId())
                .orElseThrow(() -> new NotFoundException("La pièce jointe est introuvable."));
    }

    private Vehicule trouver(String code) {
        return vehicules.findByCode(code.toUpperCase())
                .orElseThrow(() -> new NotFoundException(
                        "Le véhicule « %s » est introuvable.".formatted(code)));
    }

    private void vérifierUnicité(String immatriculation, String vin) {
        if (vehicules.existsByImmatriculation(TexteNormalise.cle(immatriculation))) {
            throw new ConflictException("Cette immatriculation existe déjà.");
        }
        if (vehicules.existsByVin(TexteNormalise.cle(vin))) {
            throw new ConflictException("Ce VIN existe déjà.");
        }
    }

    private void vérifierFichier(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new BusinessRuleException("Le fichier est obligatoire.");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new BusinessRuleException("Le fichier ne doit pas dépasser 5 Mo.");
        }
        if (!TYPES_AUTORISES.contains(fichier.getContentType())) {
            throw new BusinessRuleException("Seuls les fichiers PDF, JPEG et PNG sont autorisés.");
        }
    }

    private String nomFichierSûr(String nomOriginal) {
        if (nomOriginal == null || nomOriginal.isBlank()) return "piece-jointe";
        String normalisé = nomOriginal.replace('\\', '/');
        return normalisé.substring(normalisé.lastIndexOf('/') + 1);
    }

    private VehiculeListeResponse versListe(Vehicule vehicule) {
        return new VehiculeListeResponse(
                vehicule.getCode(), vehicule.getImmatriculation(),
                vehicule.getModele().getMarque().getDesignation(),
                vehicule.getModele().getNom(), vehicule.getGenre(),
                vehicule.getCarburant(), vehicule.getKilometrageActuel(),
                vehicule.getStatut(), vehicule.getEtatGeneral());
    }

    private VehiculeDetailResponse versDetail(Vehicule vehicule) {
        List<PieceJointeResponse> pièces = pieces
                .findByVehicule_IdOrderByDateCreationDesc(vehicule.getId()).stream()
                .map(piece -> new PieceJointeResponse(
                        piece.getId(), piece.getTypePiece(), piece.getNomFichier(),
                        piece.getTypeContenu(), piece.getTaille(),
                        piece.getDateCreation(), piece.getCreePar()))
                .toList();
        List<ReleveResponse> relevés = releves
                .findByVehicule_IdOrderByDateReleveDescDateCreationDesc(vehicule.getId()).stream()
                .map(releve -> new ReleveResponse(
                        releve.getId(), releve.getDateReleve(), releve.getKilometrage(),
                        releve.getSource(), releve.getCommentaire(),
                        releve.getDateCreation(), releve.getCreePar()))
                .toList();
        List<AffectationResponse> toutesAffectations =
                affectations.affectationsDuVehicule(vehicule.getId());
        AffectationResponse actuelle = toutesAffectations.stream()
                .filter(affectation -> affectation.dateFin() == null)
                .findFirst().orElse(null);
        List<AffectationResponse> anciennes = toutesAffectations.stream()
                .filter(affectation -> affectation.dateFin() != null).toList();

        return new VehiculeDetailResponse(
                vehicule.getCode(), vehicule.getImmatriculation(),
                vehicule.getAncienneImmatriculation(), vehicule.getModele().getId(),
                vehicule.getModele().getNom(), vehicule.getModele().getMarque().getCode(),
                vehicule.getModele().getMarque().getDesignation(),
                vehicule.getGenre(), vehicule.getVin(), vehicule.getCarburant(),
                vehicule.getNombreCylindres(), vehicule.getPuissanceFiscale(),
                vehicule.getPoidsVide(), vehicule.getPoidsTotalCharge(),
                vehicule.getKilometrageInitial(), vehicule.getKilometrageActuel(),
                vehicule.getDatePremiereMiseCirculation(), vehicule.getDateMutation(),
                vehicule.getStatut(), vehicule.getEtatGeneral(), pièces, relevés,
                actuelle, anciennes,
                historique(journalAudit, ENTITE, vehicule.getId(), this::versEvenement),
                vehicule.getDateCreation(), vehicule.getCreePar(),
                vehicule.getDateModification(), vehicule.getModifiePar());
    }

    private EvenementResponse versEvenement(JournalAudit evenement) {
        return new EvenementResponse(ActionVehicule.valueOf(evenement.getAction()),
                evenement.getDateAction(), evenement.getUtilisateur());
    }

    private Map<String, ?> situation(Vehicule vehicule) {
        return Map.of("statut", vehicule.getStatut(), "etatGeneral", vehicule.getEtatGeneral());
    }

    private Map<String, ?> valeurs(Vehicule vehicule) {
        Map<String, Object> valeurs = new LinkedHashMap<>();
        valeurs.put("code", vehicule.getCode());
        valeurs.put("immatriculation", vehicule.getImmatriculation());
        valeurs.put("vin", vehicule.getVin());
        valeurs.put("marque", vehicule.getModele().getMarque().getCode());
        valeurs.put("modele", vehicule.getModele().getNom());
        valeurs.put("genre", vehicule.getGenre());
        valeurs.put("carburant", vehicule.getCarburant());
        valeurs.put("kilometrageInitial", vehicule.getKilometrageInitial());
        valeurs.put("statut", vehicule.getStatut());
        valeurs.put("etatGeneral", vehicule.getEtatGeneral());
        return valeurs;
    }
}
