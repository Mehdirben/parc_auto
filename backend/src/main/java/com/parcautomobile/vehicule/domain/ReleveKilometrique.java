package com.parcautomobile.vehicule.domain;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.text.TexteNormalise;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "releves_kilometriques")
public class ReleveKilometrique extends AuditedEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicule_id", nullable = false, updatable = false)
    private Vehicule vehicule;

    @Column(name = "date_releve", nullable = false, updatable = false)
    private LocalDate dateReleve;

    @Column(nullable = false, updatable = false)
    private long kilometrage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 20)
    private SourceReleve source;

    @Nationalized
    @Column(updatable = false, length = 80)
    private String commentaire;

    protected ReleveKilometrique() {}

    public ReleveKilometrique(Vehicule vehicule, LocalDate dateReleve, long kilometrage,
                              SourceReleve source, String commentaire) {
        this.id = UUID.randomUUID();
        this.vehicule = vehicule;
        this.dateReleve = dateReleve;
        this.kilometrage = kilometrage;
        this.source = source;
        String texte = TexteNormalise.affichage(commentaire);
        this.commentaire = texte == null || texte.isBlank() ? null : texte;
    }

    public UUID getId() { return id; }
    public LocalDate getDateReleve() { return dateReleve; }
    public long getKilometrage() { return kilometrage; }
    public SourceReleve getSource() { return source; }
    public String getCommentaire() { return commentaire; }
}
