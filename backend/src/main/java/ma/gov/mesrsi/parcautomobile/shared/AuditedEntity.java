package ma.gov.mesrsi.parcautomobile.shared;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.hibernate.annotations.Nationalized;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditedEntity {

    @CreatedDate
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @CreatedBy
    @Nationalized
    @Column(name = "cree_par", nullable = false, updatable = false, length = 100)
    private String creePar;

    @LastModifiedDate
    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @LastModifiedBy
    @Nationalized
    @Column(name = "modifie_par", length = 100)
    private String modifiePar;

    public LocalDateTime getDateCreation() { return dateCreation; }
    public String getCreePar() { return creePar; }
    public LocalDateTime getDateModification() { return dateModification; }
    public String getModifiePar() { return modifiePar; }
}
