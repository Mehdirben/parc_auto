package com.parcautomobile.audit.repository;

import java.util.List;
import java.util.UUID;

import com.parcautomobile.audit.domain.JournalAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JournalAuditRepository extends JpaRepository<JournalAudit, UUID>,
        JpaSpecificationExecutor<JournalAudit> {
    List<JournalAudit> findByEntiteAndEntiteIdOrderByDateActionDesc(String entite, String entiteId);
}
