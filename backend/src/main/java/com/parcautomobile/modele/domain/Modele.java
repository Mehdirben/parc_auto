package com.parcautomobile.modele.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.parcautomobile.marque.domain.Marque;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.text.TexteNormalise;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "modeles")
public class Modele extends AuditedEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "marque_id", nullable = false)
    private Marque marque;

    @Nationalized
    @Column(nullable = false, length = 80)
    private String nom;

    protected Modele() {}

    public Modele(String nom) {
        this.id = UUID.randomUUID();
        modifierNom(nom);
    }

    public void modifierNom(String nom) {
        this.nom = TexteNormalise.affichage(nom);
    }

    public void rattacherA(Marque marque) {
        this.marque = marque;
    }

    public UUID getId() { return id; }
    public Marque getMarque() { return marque; }
    public String getNom() { return nom; }
}
