package com.parcautomobile.marque.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.text.TexteNormalise;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "marques")
public class Marque extends AuditedEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(length = 10, nullable = false, updatable = false, unique = true)
    private String code;

    @Nationalized
    @Column(nullable = false, length = 80)
    private String designation;

    @OneToMany(mappedBy = "marque", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("nom ASC")
    private List<Modele> modeles = new ArrayList<>();

    protected Marque() {}

    public Marque(String code, String designation) {
        this.code = code;
        modifierDesignation(designation);
    }

    public void modifierDesignation(String designation) {
        this.designation = TexteNormalise.affichage(designation);
    }

    public void ajouterModele(Modele modele) {
        modeles.add(modele);
        modele.rattacherA(this);
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getDesignation() { return designation; }
    public List<Modele> getModeles() { return modeles; }
}
