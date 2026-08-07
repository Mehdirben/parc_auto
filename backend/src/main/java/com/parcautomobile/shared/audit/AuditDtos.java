package com.parcautomobile.shared.audit;

import java.time.LocalDateTime;

public final class AuditDtos {
    private AuditDtos() {}

    public record EvenementAuditResponse(
            String action,
            LocalDateTime dateEvenement,
            String utilisateur) {}
}
