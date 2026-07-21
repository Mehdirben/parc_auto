package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.Nationalized;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "services_parcs_evenements")
@EntityListeners(AuditingEntityListener.class)
public class ServiceParcEvenement {
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_parc_id", nullable = false, updatable = false)
    private ServiceParc serviceParc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false)
    private ActionServiceParc action;

    @CreatedDate
    @Column(name = "date_evenement", nullable = false, updatable = false)
    private LocalDateTime dateEvenement;

    @CreatedBy
    @Nationalized
    @Column(nullable = false, length = 100, updatable = false)
    private String utilisateur;

    protected ServiceParcEvenement() {}

    ServiceParcEvenement(ServiceParc serviceParc, ActionServiceParc action) {
        this.serviceParc = serviceParc;
        this.action = action;
    }

    public UUID getId() { return id; }
    public ActionServiceParc getAction() { return action; }
    public LocalDateTime getDateEvenement() { return dateEvenement; }
    public String getUtilisateur() { return utilisateur; }
}
