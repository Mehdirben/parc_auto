package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import ma.gov.mesrsi.parcautomobile.shared.AuditedEntity;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "modeles")
public class Modele extends AuditedEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "marque_id", nullable = false)
    private Marque marque;

    @Nationalized
    @Column(nullable = false, length = 80)
    private String nom;

    @Nationalized
    @Column(name = "nom_normalise", nullable = false, length = 80)
    private String nomNormalise;

    protected Modele() {}

    public Modele(String nom) {
        modifierNom(nom);
    }

    public void modifierNom(String nom) {
        this.nom = TexteNormalise.affichage(nom);
        this.nomNormalise = TexteNormalise.cle(nom);
    }

    void rattacherA(Marque marque) {
        this.marque = marque;
    }

    public UUID getId() { return id; }
    public Marque getMarque() { return marque; }
    public String getNom() { return nom; }
    public String getNomNormalise() { return nomNormalise; }
}
