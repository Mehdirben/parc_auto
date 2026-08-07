package com.parcautomobile.vehicule.domain;

import java.math.BigDecimal;
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
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.shared.AuditedEntity;
import com.parcautomobile.shared.text.TexteNormalise;

@Entity
@Table(name = "vehicules")
public class Vehicule extends AuditedEntity {
    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, length = 10)
    private String code;

    @Column(nullable = false, updatable = false, length = 50)
    private String immatriculation;

    @Column(name = "ancienne_immatriculation", updatable = false, length = 50)
    private String ancienneImmatriculation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modele_id", nullable = false)
    private Modele modele;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private GenreVehicule genre;

    @Column(nullable = false, length = 50)
    private String vin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Carburant carburant;

    @Column(name = "nombre_cylindres", updatable = false)
    private Integer nombreCylindres;

    @Column(name = "puissance_fiscale")
    private Integer puissanceFiscale;

    @Column(name = "poids_vide", precision = 12, scale = 2, updatable = false)
    private BigDecimal poidsVide;

    @Column(name = "poids_total_charge", precision = 12, scale = 2)
    private BigDecimal poidsTotalCharge;

    @Column(name = "kilometrage_initial", nullable = false, updatable = false)
    private long kilometrageInitial;

    @Column(name = "kilometrage_actuel", nullable = false)
    private long kilometrageActuel;

    @Column(name = "date_premiere_mise_circulation")
    private LocalDate datePremiereMiseCirculation;

    @Column(name = "date_mutation", updatable = false)
    private LocalDate dateMutation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutVehicule statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_general", nullable = false, length = 20)
    private EtatGeneral etatGeneral;

    protected Vehicule() {}

    public Vehicule(String code, String immatriculation, String ancienneImmatriculation,
                    Modele modele, GenreVehicule genre, String vin, Carburant carburant,
                    Integer nombreCylindres, Integer puissanceFiscale, BigDecimal poidsVide,
                    BigDecimal poidsTotalCharge, long kilometrageInitial,
                    LocalDate datePremiereMiseCirculation, LocalDate dateMutation,
                    StatutVehicule statut, EtatGeneral etatGeneral) {
        this.id = UUID.randomUUID();
        this.code = code;
        this.immatriculation = TexteNormalise.cle(immatriculation);
        this.ancienneImmatriculation = videEnNull(ancienneImmatriculation);
        this.modele = modele;
        this.genre = genre;
        this.vin = TexteNormalise.cle(vin);
        this.carburant = carburant;
        this.nombreCylindres = nombreCylindres;
        this.puissanceFiscale = puissanceFiscale;
        this.poidsVide = poidsVide;
        this.poidsTotalCharge = poidsTotalCharge;
        this.kilometrageInitial = kilometrageInitial;
        this.kilometrageActuel = kilometrageInitial;
        this.datePremiereMiseCirculation = datePremiereMiseCirculation;
        this.dateMutation = dateMutation;
        this.statut = statut;
        this.etatGeneral = etatGeneral;
    }

    public boolean changerSituation(StatutVehicule statut, EtatGeneral etatGeneral) {
        if (this.statut == statut && this.etatGeneral == etatGeneral) return false;
        this.statut = statut;
        this.etatGeneral = etatGeneral;
        return true;
    }

    public void prendreEnCompteKilometrage(long kilometrage) {
        if (kilometrage > kilometrageActuel) kilometrageActuel = kilometrage;
    }

    /**
     * Mise à jour réservée à l'import SIT. L'interface de la fiche véhicule
     * conserve le verrouillage des données d'identification.
     */
    public void appliquerImport(Modele modele, GenreVehicule genre, String vin,
                                Carburant carburant, Integer puissanceFiscale,
                                BigDecimal poidsTotalCharge, LocalDate dateMiseEnCirculation,
                                Long kilometrage, EtatGeneral etatGeneral) {
        if (modele != null) this.modele = modele;
        if (genre != null) this.genre = genre;
        if (vin != null && !vin.isBlank()) {
            this.vin = TexteNormalise.cle(vin);
        }
        if (carburant != null) this.carburant = carburant;
        if (puissanceFiscale != null) this.puissanceFiscale = puissanceFiscale;
        if (poidsTotalCharge != null) this.poidsTotalCharge = poidsTotalCharge;
        if (dateMiseEnCirculation != null) this.datePremiereMiseCirculation = dateMiseEnCirculation;
        if (kilometrage != null) this.kilometrageActuel = Math.max(kilometrageInitial, kilometrage);
        if (etatGeneral != null) this.etatGeneral = etatGeneral;
    }

    private String videEnNull(String valeur) {
        String nettoyée = TexteNormalise.affichage(valeur);
        return nettoyée == null || nettoyée.isBlank() ? null : nettoyée.toUpperCase();
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getImmatriculation() { return immatriculation; }
    public String getAncienneImmatriculation() { return ancienneImmatriculation; }
    public Modele getModele() { return modele; }
    public GenreVehicule getGenre() { return genre; }
    public String getVin() { return vin; }
    public Carburant getCarburant() { return carburant; }
    public Integer getNombreCylindres() { return nombreCylindres; }
    public Integer getPuissanceFiscale() { return puissanceFiscale; }
    public BigDecimal getPoidsVide() { return poidsVide; }
    public BigDecimal getPoidsTotalCharge() { return poidsTotalCharge; }
    public long getKilometrageInitial() { return kilometrageInitial; }
    public long getKilometrageActuel() { return kilometrageActuel; }
    public LocalDate getDatePremiereMiseCirculation() { return datePremiereMiseCirculation; }
    public LocalDate getDateMutation() { return dateMutation; }
    public StatutVehicule getStatut() { return statut; }
    public EtatGeneral getEtatGeneral() { return etatGeneral; }
}
