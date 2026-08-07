package com.parcautomobile.audit.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import com.parcautomobile.audit.domain.JournalAudit;
import com.parcautomobile.audit.domain.ResultatAudit;
import com.parcautomobile.audit.repository.JournalAuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class JournalAuditService {
    private final JournalAuditRepository repository;
    private final ObjectMapper objectMapper;
    private final AuditorAware<String> auditorAware;
    private final Clock clock;

    @Autowired
    public JournalAuditService(JournalAuditRepository repository, ObjectMapper objectMapper,
                               AuditorAware<String> auditorAware) {
        this(repository, objectMapper, auditorAware, Clock.systemUTC());
    }

    JournalAuditService(JournalAuditRepository repository, ObjectMapper objectMapper,
                        AuditorAware<String> auditorAware, Clock clock) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.auditorAware = auditorAware;
        this.clock = clock;
    }

    public void journaliser(String action, String entite, Object entiteId,
                            Map<String, ?> anciennesValeurs, Map<String, ?> nouvellesValeurs) {
        repository.save(new JournalAudit(
                auditorAware.getCurrentAuditor().orElse(null),
                LocalDateTime.now(clock),
                action,
                entite,
                String.valueOf(entiteId),
                versJson(anciennesValeurs),
                versJson(nouvellesValeurs),
                adresseIp(),
                ResultatAudit.SUCCES));
    }

    public List<JournalAudit> historique(String entite, Object entiteId) {
        return repository.findByEntiteAndEntiteIdOrderByDateActionDesc(entite, String.valueOf(entiteId));
    }

    private String versJson(Map<String, ?> valeurs) {
        if (valeurs == null) return null;
        try {
            return objectMapper.writeValueAsString(valeurs);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Impossible de sérialiser les valeurs du journal d’audit.", exception);
        }
    }

    private String adresseIp() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributs) {
            HttpServletRequest request = attributs.getRequest();
            return request.getRemoteAddr() == null ? "inconnue" : request.getRemoteAddr();
        }
        return "inconnue";
    }
}
