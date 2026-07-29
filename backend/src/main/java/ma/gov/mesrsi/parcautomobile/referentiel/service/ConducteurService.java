package ma.gov.mesrsi.parcautomobile.referentiel.service;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.ConducteurDtos.*;

import java.util.UUID;

import ma.gov.mesrsi.parcautomobile.referentiel.domain.ActionConducteur;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.Conducteur;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.ConducteurEvenement;
import ma.gov.mesrsi.parcautomobile.referentiel.repository.ConducteurRepository;
import ma.gov.mesrsi.parcautomobile.shared.ConflictException;
import ma.gov.mesrsi.parcautomobile.shared.NotFoundException;
import ma.gov.mesrsi.parcautomobile.shared.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConducteurService {
    private final ConducteurRepository repository;

    public ConducteurService(ConducteurRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ConducteurListeResponse> rechercher(String search, Boolean actif, int page, int taille) {
        return PageResponse.of(repository.rechercher(
                search == null ? "" : search, 
                actif,
                PageRequest.of(page, taille, Sort.by("nomComplet").ascending()))
                .map(this::versListe));
    }

    @Transactional(readOnly = true)
    public ConducteurStatistiquesResponse statistiques() {
        return new ConducteurStatistiquesResponse(
                repository.count(),
                repository.countByActifTrue(),
                repository.countByActifFalse());
    }

    @Transactional(readOnly = true)
    public ConducteurDetailResponse consulter(String matricule) {
        return versDetail(trouver(matricule));
    }

    public ConducteurDetailResponse créer(CreerConducteurRequest request) {
        vérifierUnicité(request.matricule(), request.numeroPermis(), null);
        
        Conducteur conducteur = new Conducteur(
                request.matricule(),
                request.nomComplet(),
                request.numeroPermis(),
                request.dateValiditePermis());
        
        // Set optional telephone using the modifier method
        conducteur.modifier(
                request.nomComplet(),
                request.telephone(),
                request.numeroPermis(),
                request.dateValiditePermis());
        
        conducteur.historiser(ActionConducteur.CREATION);
        return versDetail(repository.saveAndFlush(conducteur));
    }

    public ConducteurDetailResponse modifier(String matricule, ModifierConducteurRequest request) {
        Conducteur conducteur = trouver(matricule);
        vérifierUnicité(request.matricule(), request.numeroPermis(), conducteur.getId());
        
        conducteur.modifier(
                request.nomComplet(),
                request.telephone(),
                request.numeroPermis(),
                request.dateValiditePermis());
        
        conducteur.historiser(ActionConducteur.MODIFICATION);
        return versDetail(repository.saveAndFlush(conducteur));
    }

    public ConducteurDetailResponse changerStatut(String matricule, ChangerStatutRequest request) {
        Conducteur conducteur = trouver(matricule);
        if (conducteur.changerStatut(request.actif())) {
            conducteur.historiser(request.actif()
                    ? ActionConducteur.ACTIVATION : ActionConducteur.DESACTIVATION);
            repository.saveAndFlush(conducteur);
        }
        return versDetail(conducteur);
    }

    private Conducteur trouver(String matricule) {
        return repository.findDetailByMatricule(matricule)
                .orElseThrow(() -> new NotFoundException(
                        "Le conducteur avec matricule « %s » est introuvable.".formatted(matricule)));
    }

    private void vérifierUnicité(String matricule, String numeroPermis, UUID idExclu) {
        boolean matriculeExiste = idExclu == null
                ? repository.existsByMatricule(matricule)
                : repository.existsByMatriculeAndIdNot(matricule, idExclu);
        if (matriculeExiste) {
            throw new ConflictException("Ce matricule existe déjà.");
        }

        boolean permisExiste = idExclu == null
                ? repository.existsByNumeroPermis(numeroPermis)
                : repository.existsByNumeroPermisAndIdNot(numeroPermis, idExclu);
        if (permisExiste) {
            throw new ConflictException("Ce numéro de permis existe déjà.");
        }
    }

    private ConducteurListeResponse versListe(Conducteur conducteur) {
        return new ConducteurListeResponse(
                conducteur.getMatricule(),
                conducteur.getNomComplet(),
                conducteur.getTelephone(),
                conducteur.getNumeroPermis(),
                conducteur.getDateValiditePermis(),
                conducteur.isActif(),
                conducteur.getDateCreation(),
                conducteur.getCreePar());
    }

    private ConducteurDetailResponse versDetail(Conducteur conducteur) {
        return new ConducteurDetailResponse(
                conducteur.getMatricule(),
                conducteur.getNomComplet(),
                conducteur.getTelephone(),
                conducteur.getNumeroPermis(),
                conducteur.getDateValiditePermis(),
                conducteur.isActif(),
                conducteur.getEvenements().stream().map(this::versEvenement).toList(),
                conducteur.getDateCreation(),
                conducteur.getCreePar(),
                conducteur.getDateModification(),
                conducteur.getModifiePar());
    }

    private EvenementResponse versEvenement(ConducteurEvenement evenement) {
        return new EvenementResponse(
                evenement.getAction(),
                evenement.getDateEvenement(),
                evenement.getUtilisateur());
    }
}