package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OrderBy;
import ma.gov.mesrsi.parcautomobile.shared.AuditedEntity;


@Entity
@Table(name = "conducteurs")
public class Conducteur extends AuditedEntity {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

   
   @Column(nullable = false, unique = true, length = 20, updatable = false)  
    private String matricule;

    
    @Column(length = 80, nullable = false)
    private String nomComplet;

   
    @Column(length=20, nullable = true)
    private String telephone;

   
    @Column(length=50, nullable = false, unique = true)
    private String numeroPermis;

    
    @Column(nullable=false)
    private LocalDate dateValiditePermis;

    
    @Column(nullable=false)
    private boolean actif = true;

    
    @OneToMany(mappedBy = "conducteur", cascade = CascadeType.ALL, orphanRemoval = true
    )
    @OrderBy("dateEvenement DESC")
    private List<ConducteurEvenement> evenements = new ArrayList<>();

    protected Conducteur() {}

    
    public Conducteur(String matricule, String nomComplet, String numeroPermis, LocalDate dateValiditePermis) {
       
        this.matricule = matricule;
        this.nomComplet = nomComplet;
        this.numeroPermis = numeroPermis;
        this.dateValiditePermis = dateValiditePermis;
        this.actif = true;
    }

    
    public UUID getId() { return id; }
    public String getMatricule() { return matricule; }
    public String getNomComplet() { return nomComplet; }
    public String getTelephone() { return telephone; }
    public String getNumeroPermis() { return numeroPermis; }
    public LocalDate getDateValiditePermis() { return dateValiditePermis; }
    public boolean isActif() { return actif; }
    public List<ConducteurEvenement> getEvenements() { return evenements; }  // ← AJOUTER CETTE LIGNE

    
     public boolean changerStatut(boolean actif) {
        if (this.actif == actif) return false;
        this.actif = actif;
        return true;
    } 
    
    public void modifier(String nomComplet, String telephone, String numeroPermis, LocalDate dateValiditePermis) {
      this.nomComplet = nomComplet;
      this.telephone = telephone;
      this.numeroPermis = numeroPermis;
      this.dateValiditePermis = dateValiditePermis;
}
    
      public void historiser(ActionConducteur action) {
         evenements.add(new ConducteurEvenement(this, action));
      }
      

}