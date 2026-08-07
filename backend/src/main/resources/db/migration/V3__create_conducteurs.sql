CREATE TABLE conducteurs (
    id UNIQUEIDENTIFIER NOT NULL,
    matricule VARCHAR(20) NOT NULL,
    nom_complet NVARCHAR(80) NOT NULL,
    telephone VARCHAR(13) NULL,
    numero_permis VARCHAR(50) NOT NULL,
    date_validite_permis DATE NOT NULL,
    actif BIT NOT NULL CONSTRAINT df_conducteurs_actif DEFAULT 1,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_conducteurs PRIMARY KEY (id),
    CONSTRAINT uk_conducteurs_matricule UNIQUE (matricule),
    CONSTRAINT uk_conducteurs_numero_permis UNIQUE (numero_permis),
    CONSTRAINT ck_conducteurs_telephone_marocain
        CHECK (telephone IS NULL OR telephone LIKE '0[5-7][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
               OR telephone LIKE '+212[5-7][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);

CREATE INDEX ix_conducteurs_actif_nom ON conducteurs(actif, nom_complet);
CREATE INDEX ix_conducteurs_validite_permis ON conducteurs(date_validite_permis);
