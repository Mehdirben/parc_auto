package com.parcautomobile.shared.audit;

import java.util.List;

import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.service.JournalAuditService;
import com.parcautomobile.shared.audit.AuditDtos.EvenementAuditResponse;
import com.parcautomobile.shared.HistoriqueAuditMapper;

public final class AuditResponseMapper {
    private AuditResponseMapper() {}

    public static List<EvenementAuditResponse> historique(
            JournalAuditService journalAudit, String entite, Object entiteId) {
        return HistoriqueAuditMapper.historique(
                journalAudit, entite, entiteId, AuditResponseMapper::versEvenement);
    }

    private static EvenementAuditResponse versEvenement(JournalAudit evenement) {
        return new EvenementAuditResponse(
                evenement.getAction(),
                evenement.getDateAction(),
                evenement.getUtilisateur());
    }
}
