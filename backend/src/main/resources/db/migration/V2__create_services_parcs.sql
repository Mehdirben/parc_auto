CREATE TABLE services_parcs (
    id UNIQUEIDENTIFIER NOT NULL,
    code VARCHAR(20) NOT NULL,
    libelle NVARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    actif BIT NOT NULL CONSTRAINT df_services_parcs_actif DEFAULT 1,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_services_parcs PRIMARY KEY (id),
    CONSTRAINT uk_services_parcs_code UNIQUE (code),
    CONSTRAINT uk_services_parcs_libelle UNIQUE (libelle),
    CONSTRAINT ck_services_parcs_type CHECK (type IN ('DIRECTION', 'PARC_COMMUN'))
);

CREATE TABLE journalaudit (
    id UNIQUEIDENTIFIER NOT NULL,
    utilisateur NVARCHAR(100) NULL,
    date_action DATETIME2 NOT NULL,
    action VARCHAR(30) NOT NULL,
    entite VARCHAR(50) NOT NULL,
    entite_id VARCHAR(100) NOT NULL,
    anciennes_valeurs NVARCHAR(MAX) NULL,
    nouvelles_valeurs NVARCHAR(MAX) NULL,
    adresse_ip VARCHAR(45) NOT NULL,
    resultat VARCHAR(10) NOT NULL,
    CONSTRAINT pk_journalaudit PRIMARY KEY (id),
    CONSTRAINT ck_journalaudit_anciennes_valeurs_json
        CHECK (anciennes_valeurs IS NULL OR ISJSON(anciennes_valeurs) = 1),
    CONSTRAINT ck_journalaudit_nouvelles_valeurs_json
        CHECK (nouvelles_valeurs IS NULL OR ISJSON(nouvelles_valeurs) = 1),
    CONSTRAINT ck_journalaudit_resultat CHECK (resultat IN ('SUCCES', 'ECHEC'))
);

CREATE INDEX ix_services_parcs_type_actif ON services_parcs(type, actif);
CREATE INDEX ix_journalaudit_entite_cible_date
    ON journalaudit(entite, entite_id, date_action DESC);
CREATE INDEX ix_journalaudit_utilisateur_date
    ON journalaudit(utilisateur, date_action DESC);
