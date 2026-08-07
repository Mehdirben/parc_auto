package com.parcautomobile.vehicule.domain;

import java.util.UUID;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.parcautomobile.shared.AuditedEntity;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "pieces_jointes_vehicule")
public class PieceJointeVehicule extends AuditedEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicule_id", nullable = false, updatable = false)
    private Vehicule vehicule;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_piece", nullable = false, updatable = false, length = 20)
    private TypePieceJointe typePiece;

    @Nationalized
    @Column(name = "nom_fichier", nullable = false, updatable = false, length = 255)
    private String nomFichier;

    @Column(name = "type_contenu", nullable = false, updatable = false, length = 100)
    private String typeContenu;

    @Column(nullable = false, updatable = false)
    private long taille;

    @Basic(fetch = FetchType.LAZY)
    @Column(nullable = false, updatable = false, columnDefinition = "VARBINARY(MAX)")
    private byte[] contenu;

    protected PieceJointeVehicule() {}

    public PieceJointeVehicule(Vehicule vehicule, TypePieceJointe typePiece, String nomFichier,
                               String typeContenu, byte[] contenu) {
        this.id = UUID.randomUUID();
        this.vehicule = vehicule;
        this.typePiece = typePiece;
        this.nomFichier = nomFichier;
        this.typeContenu = typeContenu;
        this.taille = contenu.length;
        this.contenu = contenu.clone();
    }

    public UUID getId() { return id; }
    public UUID getVehiculeId() { return vehicule.getId(); }
    public TypePieceJointe getTypePiece() { return typePiece; }
    public String getNomFichier() { return nomFichier; }
    public String getTypeContenu() { return typeContenu; }
    public long getTaille() { return taille; }
    public byte[] getContenu() { return contenu.clone(); }
}
