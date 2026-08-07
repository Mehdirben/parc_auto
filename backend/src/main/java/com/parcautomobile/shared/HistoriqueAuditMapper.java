package com.parcautomobile.shared;

import java.util.List;
import java.util.function.Function;

import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.service.JournalAuditService;

public final class HistoriqueAuditMapper {
    private HistoriqueAuditMapper() {}

    public static <T> List<T> historique(
            JournalAuditService journalAudit,
            String entite,
            Object entiteId,
            Function<JournalAudit, T> conversion) {
        return journalAudit.historique(entite, entiteId).stream()
                .map(conversion)
                .toList();
    }
}
