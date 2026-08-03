package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.CreatedBy;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "conducteurs_evenements")
@EntityListeners(AuditingEntityListener.class)
public class ConducteurEvenement {
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conducteur_id", nullable = false, updatable = false)
    private Conducteur conducteur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false)
    private ActionConducteur action;

    @CreatedDate
    @Column(name = "date_evenement", nullable = false, updatable = false)
    private LocalDateTime dateEvenement;

    @CreatedBy
    @Nationalized
    @Column(nullable = false, length = 100, updatable = false)
    private String utilisateur;

    protected ConducteurEvenement() {}

    ConducteurEvenement(Conducteur conducteur, ActionConducteur action) {
        this.conducteur = conducteur;
        this.action = action;
    }

    public UUID getId() { return id; }
    public ActionConducteur getAction() { return action; }
    public LocalDateTime getDateEvenement() { return dateEvenement; }
    public String getUtilisateur() { return utilisateur; }
}
