CREATE TABLE services_parcs (
    id UNIQUEIDENTIFIER NOT NULL,
    code VARCHAR(20) NOT NULL,
    code_normalise VARCHAR(20) NOT NULL,
    libelle NVARCHAR(100) NOT NULL,
    libelle_normalise NVARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    actif BIT NOT NULL CONSTRAINT df_services_parcs_actif DEFAULT 1,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_services_parcs PRIMARY KEY (id),
    CONSTRAINT uk_services_parcs_code_normalise UNIQUE (code_normalise),
    CONSTRAINT uk_services_parcs_libelle_normalise UNIQUE (libelle_normalise),
    CONSTRAINT ck_services_parcs_type CHECK (type IN ('DIRECTION', 'PARC_COMMUN'))
);

CREATE TABLE services_parcs_evenements (
    id UNIQUEIDENTIFIER NOT NULL,
    service_parc_id UNIQUEIDENTIFIER NOT NULL,
    action VARCHAR(20) NOT NULL,
    date_evenement DATETIME2 NOT NULL,
    utilisateur NVARCHAR(100) NOT NULL,
    CONSTRAINT pk_services_parcs_evenements PRIMARY KEY (id),
    CONSTRAINT fk_services_parcs_evenements_service FOREIGN KEY (service_parc_id) REFERENCES services_parcs(id),
    CONSTRAINT ck_services_parcs_evenements_action CHECK (action IN ('CREATION', 'MODIFICATION', 'ACTIVATION', 'DESACTIVATION'))
);

CREATE INDEX ix_services_parcs_type_actif ON services_parcs(type, actif);
CREATE INDEX ix_services_parcs_evenements_service_date ON services_parcs_evenements(service_parc_id, date_evenement DESC);
