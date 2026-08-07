package com.parcautomobile.affectation.domain;

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
import com.parcautomobile.conducteur.domain.Conducteur;
import com.parcautomobile.serviceparc.domain.ServiceParc;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.shared.text.TexteNormalise;
import com.parcautomobile.vehicule.domain.Vehicule;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "affectations")
public class Affectation extends AuditedEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicule_id", nullable = false, updatable = false)
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_parc_id", nullable = false, updatable = false)
    private ServiceParc serviceParc;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conducteur_id", nullable = false, updatable = false)
    private Conducteur conducteur;

    @Column(name = "date_debut", nullable = false, updatable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "date_fin_prevue", updatable = false)
    private LocalDate dateFinPrevue;

    @Nationalized
    @Column(nullable = false, updatable = false, length = 500)
    private String motif;

    @Nationalized
    @Column(name = "type_mission", updatable = false, length = 200)
    private String typeMission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutAffectation statut;

    protected Affectation() {}

    public Affectation(Vehicule vehicule, ServiceParc serviceParc, Conducteur conducteur,
                       LocalDate dateDebut, String motif,
                       LocalDate dateFinPrevue, String typeMission) {
        this.id = UUID.randomUUID();
        this.vehicule = vehicule;
        this.serviceParc = serviceParc;
        this.conducteur = conducteur;
        this.dateDebut = dateDebut;
        this.motif = TexteNormalise.affichage(motif);
        this.dateFinPrevue = dateFinPrevue;
        this.typeMission = TexteNormalise.affichage(typeMission);
        this.statut = StatutAffectation.ACTIVE;
    }

    public void cloturer(LocalDate dateFin) {
        if (statut != StatutAffectation.ACTIVE) {
            throw new BusinessRuleException("Cette affectation est déjà terminée.");
        }
        if (dateFin.isBefore(dateDebut)) {
            throw new BusinessRuleException(
                    "La date de fin ne peut pas précéder la date de début de l’affectation.");
        }
        this.dateFin = dateFin;
        this.statut = StatutAffectation.TERMINEE;
    }

    public UUID getId() { return id; }
    public Vehicule getVehicule() { return vehicule; }
    public ServiceParc getServiceParc() { return serviceParc; }
    public Conducteur getConducteur() { return conducteur; }
    public LocalDate getDateDebut() { return dateDebut; }
    public LocalDate getDateFin() { return dateFin; }
    public LocalDate getDateFinPrevue() { return dateFinPrevue; }
    public String getMotif() { return motif; }
    public String getTypeMission() { return typeMission; }
    public StatutAffectation getStatut() { return statut; }
    public boolean estEligibleOrdreMission() {
        return serviceParc.estParcMission()
                && conducteur != null
                && dateFinPrevue != null
                && typeMission != null
                && !typeMission.isBlank();
    }
}
