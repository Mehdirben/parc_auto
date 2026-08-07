package com.parcautomobile.conducteur.domain;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.text.TexteNormalise;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "conducteurs")
public class Conducteur extends AuditedEntity {
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String matricule;

    @Nationalized
    @Column(name = "nom_complet", nullable = false, length = 80)
    private String nomComplet;

    @Column(length = 13)
    private String telephone;

    @Column(name = "numero_permis", nullable = false, length = 50)
    private String numeroPermis;

    @Column(name = "date_validite_permis", nullable = false)
    private LocalDate dateValiditePermis;

    @Column(nullable = false)
    private boolean actif = true;

    protected Conducteur() {}

    public Conducteur(String matricule, String nomComplet, String telephone,
                      String numeroPermis, LocalDate dateValiditePermis) {
        modifier(matricule, nomComplet, telephone, numeroPermis, dateValiditePermis);
        this.actif = true;
    }

    public void modifier(String matricule, String nomComplet, String telephone,
                         String numeroPermis, LocalDate dateValiditePermis) {
        this.matricule = TexteNormalise.cle(matricule);
        this.nomComplet = TexteNormalise.affichage(nomComplet);
        this.telephone = telephone == null || telephone.isBlank() ? null : telephone.trim();
        this.numeroPermis = TexteNormalise.cle(numeroPermis);
        this.dateValiditePermis = dateValiditePermis;
    }

    public boolean changerStatut(boolean actif) {
        if (this.actif == actif) return false;
        this.actif = actif;
        return true;
    }

    public UUID getId() { return id; }
    public String getMatricule() { return matricule; }
    public String getNomComplet() { return nomComplet; }
    public String getTelephone() { return telephone; }
    public String getNumeroPermis() { return numeroPermis; }
    public LocalDate getDateValiditePermis() { return dateValiditePermis; }
    public boolean isActif() { return actif; }
}
