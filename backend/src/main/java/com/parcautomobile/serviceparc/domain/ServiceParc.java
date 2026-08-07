package com.parcautomobile.serviceparc.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.text.TexteNormalise;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "services_parcs")
public class ServiceParc extends AuditedEntity {
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String code;

    @Nationalized
    @Column(nullable = false, length = 100)
    private String libelle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeServiceParc type;

    @Column(nullable = false)
    private boolean actif = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie_mission", length = 30, updatable = false)
    private CategorieMission categorieMission;

    protected ServiceParc() {}

    public ServiceParc(String code, String libelle, TypeServiceParc type) {
        modifier(code, libelle, type);
        this.actif = true;
    }

    public void modifier(String code, String libelle, TypeServiceParc type) {
        this.code = TexteNormalise.cle(code);
        this.libelle = TexteNormalise.affichage(libelle);
        this.type = type;
    }

    public boolean changerStatut(boolean actif) {
        if (this.actif == actif) return false;
        this.actif = actif;
        return true;
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getLibelle() { return libelle; }
    public TypeServiceParc getType() { return type; }
    public boolean isActif() { return actif; }
    public CategorieMission getCategorieMission() { return categorieMission; }
    public boolean estParcMission() { return categorieMission != null; }
}
