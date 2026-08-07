CREATE TABLE affectations (
    id UNIQUEIDENTIFIER NOT NULL,
    vehicule_id UNIQUEIDENTIFIER NOT NULL,
    service_parc_id UNIQUEIDENTIFIER NOT NULL,
    conducteur_id UNIQUEIDENTIFIER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NULL,
    motif NVARCHAR(500) NOT NULL,
    statut VARCHAR(20) NOT NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_affectations PRIMARY KEY (id),
    CONSTRAINT fk_affectations_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id),
    CONSTRAINT fk_affectations_service_parc FOREIGN KEY (service_parc_id) REFERENCES services_parcs(id),
    CONSTRAINT fk_affectations_conducteur FOREIGN KEY (conducteur_id) REFERENCES conducteurs(id),
    CONSTRAINT ck_affectations_statut CHECK (statut IN ('ACTIVE', 'TERMINEE')),
    CONSTRAINT ck_affectations_coherence CHECK (
        (statut = 'ACTIVE' AND date_fin IS NULL)
        OR (statut = 'TERMINEE' AND date_fin IS NOT NULL AND date_fin >= date_debut)
    ),
    CONSTRAINT ck_affectations_motif CHECK (LEN(LTRIM(RTRIM(motif))) > 0)
);

CREATE UNIQUE INDEX uk_affectations_vehicule_active
    ON affectations(vehicule_id)
    WHERE statut = 'ACTIVE';

CREATE INDEX ix_affectations_statut_date
    ON affectations(statut, date_debut DESC);

CREATE INDEX ix_affectations_vehicule_date
    ON affectations(vehicule_id, date_debut DESC);

CREATE INDEX ix_affectations_conducteur_date
    ON affectations(conducteur_id, date_debut DESC);

CREATE INDEX ix_affectations_service_date
    ON affectations(service_parc_id, date_debut DESC);
