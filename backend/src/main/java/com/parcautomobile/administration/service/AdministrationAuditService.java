package com.parcautomobile.administration.service;

import static com.parcautomobile.administration.api.AdministrationDtos.JournalAuditResponse;

import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.repository.JournalAuditRepository;
import com.parcautomobile.shared.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class AdministrationAuditService {
    private final JournalAuditRepository repository;

    public AdministrationAuditService(JournalAuditRepository repository) {
        this.repository = repository;
    }

    public PageResponse<JournalAuditResponse> rechercher(
            String search, String action, String entite, int page, int taille) {
        Specification<JournalAudit> specification = Specification.where(null);
        if (search != null && !search.isBlank()) {
            String motif = "%" + search.trim().toLowerCase() + "%";
            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("utilisateur")), motif),
                    cb.like(cb.lower(root.get("entiteId")), motif)));
        }
        if (action != null && !action.isBlank()) {
            specification = specification.and((root, query, cb) ->
                    cb.equal(root.get("action"), action.trim().toUpperCase()));
        }
        if (entite != null && !entite.isBlank()) {
            specification = specification.and((root, query, cb) ->
                    cb.equal(root.get("entite"), entite.trim().toUpperCase()));
        }
        return PageResponse.of(repository.findAll(specification,
                        PageRequest.of(page, taille, Sort.by(Sort.Direction.DESC, "dateAction")))
                .map(this::versResponse));
    }

    private JournalAuditResponse versResponse(JournalAudit journal) {
        return new JournalAuditResponse(
                journal.getId(), journal.getUtilisateur(), journal.getDateAction(),
                journal.getAction(), journal.getEntite(), journal.getEntiteId(),
                journal.getAnciennesValeurs(), journal.getNouvellesValeurs(),
                journal.getAdresseIp(), journal.getResultat());
    }
}
