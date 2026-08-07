package com.parcautomobile.audit.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "journalaudit")
public class JournalAudit {
    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Nationalized
    @Column(length = 100, updatable = false)
    private String utilisateur;

    @Column(name = "date_action", nullable = false, updatable = false)
    private LocalDateTime dateAction;

    @Column(nullable = false, length = 30, updatable = false)
    private String action;

    @Column(nullable = false, length = 50, updatable = false)
    private String entite;

    @Column(name = "entite_id", nullable = false, length = 100, updatable = false)
    private String entiteId;

    @Nationalized
    @Column(name = "anciennes_valeurs", columnDefinition = "nvarchar(max)", updatable = false)
    private String anciennesValeurs;

    @Nationalized
    @Column(name = "nouvelles_valeurs", columnDefinition = "nvarchar(max)", updatable = false)
    private String nouvellesValeurs;

    @Column(name = "adresse_ip", nullable = false, length = 45, updatable = false)
    private String adresseIp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, updatable = false)
    private ResultatAudit resultat;

    protected JournalAudit() {}

    public JournalAudit(String utilisateur, LocalDateTime dateAction, String action, String entite,
                        String entiteId, String anciennesValeurs, String nouvellesValeurs,
                        String adresseIp, ResultatAudit resultat) {
        this.utilisateur = utilisateur;
        this.dateAction = dateAction;
        this.action = action;
        this.entite = entite;
        this.entiteId = entiteId;
        this.anciennesValeurs = anciennesValeurs;
        this.nouvellesValeurs = nouvellesValeurs;
        this.adresseIp = adresseIp;
        this.resultat = resultat;
    }

    public UUID getId() { return id; }
    public String getUtilisateur() { return utilisateur; }
    public LocalDateTime getDateAction() { return dateAction; }
    public String getAction() { return action; }
    public String getEntite() { return entite; }
    public String getEntiteId() { return entiteId; }
    public String getAnciennesValeurs() { return anciennesValeurs; }
    public String getNouvellesValeurs() { return nouvellesValeurs; }
    public String getAdresseIp() { return adresseIp; }
    public ResultatAudit getResultat() { return resultat; }
}
