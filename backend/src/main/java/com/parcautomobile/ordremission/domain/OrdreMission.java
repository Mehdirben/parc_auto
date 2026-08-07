package com.parcautomobile.ordremission.domain;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.*;
import com.parcautomobile.affectation.domain.Affectation;
import com.parcautomobile.shared.AuditedEntity;

@Entity
@Table(name = "ordres_mission")
public class OrdreMission extends AuditedEntity {
    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "affectation_id", nullable = false, updatable = false, unique = true)
    private Affectation affectation;

    @Column(nullable = false, updatable = false, unique = true, length = 14)
    private String numero;

    @Column(name = "date_edition", nullable = false, updatable = false)
    private LocalDate dateEdition;

    protected OrdreMission() {}

    public OrdreMission(Affectation affectation, String numero, LocalDate dateEdition) {
        this.id = UUID.randomUUID();
        this.affectation = affectation;
        this.numero = numero;
        this.dateEdition = dateEdition;
    }

    public UUID getId() { return id; }
    public Affectation getAffectation() { return affectation; }
    public String getNumero() { return numero; }
    public LocalDate getDateEdition() { return dateEdition; }
}
