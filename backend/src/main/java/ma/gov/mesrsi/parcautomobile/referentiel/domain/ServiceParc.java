package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import ma.gov.mesrsi.parcautomobile.shared.AuditedEntity;
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

    @Column(name = "code_normalise", nullable = false, length = 20)
    private String codeNormalise;

    @Nationalized
    @Column(nullable = false, length = 100)
    private String libelle;

    @Nationalized
    @Column(name = "libelle_normalise", nullable = false, length = 100)
    private String libelleNormalise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeServiceParc type;

    @Column(nullable = false)
    private boolean actif = true;

    @OneToMany(mappedBy = "serviceParc", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dateEvenement DESC")
    private List<ServiceParcEvenement> evenements = new ArrayList<>();

    protected ServiceParc() {}

    public ServiceParc(String code, String libelle, TypeServiceParc type) {
        modifier(code, libelle, type);
        this.actif = true;
    }

    public void modifier(String code, String libelle, TypeServiceParc type) {
        this.code = TexteNormalise.affichage(code).toUpperCase();
        this.codeNormalise = TexteNormalise.cle(code);
        this.libelle = TexteNormalise.affichage(libelle);
        this.libelleNormalise = TexteNormalise.cle(libelle);
        this.type = type;
    }

    public boolean changerStatut(boolean actif) {
        if (this.actif == actif) return false;
        this.actif = actif;
        return true;
    }

    public void historiser(ActionServiceParc action) {
        evenements.add(new ServiceParcEvenement(this, action));
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getCodeNormalise() { return codeNormalise; }
    public String getLibelle() { return libelle; }
    public String getLibelleNormalise() { return libelleNormalise; }
    public TypeServiceParc getType() { return type; }
    public boolean isActif() { return actif; }
    public List<ServiceParcEvenement> getEvenements() { return evenements; }
}
