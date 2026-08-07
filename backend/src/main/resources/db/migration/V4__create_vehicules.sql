CREATE SEQUENCE vehicule_code_sequence
    AS BIGINT
    START WITH 1
    INCREMENT BY 1;

CREATE TABLE vehicules (
    id UNIQUEIDENTIFIER NOT NULL,
    code VARCHAR(10) NOT NULL,
    immatriculation VARCHAR(50) NOT NULL,
    ancienne_immatriculation VARCHAR(50) NULL,
    modele_id UNIQUEIDENTIFIER NOT NULL,
    genre VARCHAR(40) NOT NULL,
    vin VARCHAR(50) NOT NULL,
    carburant VARCHAR(20) NOT NULL,
    nombre_cylindres INT NULL,
    puissance_fiscale INT NULL,
    poids_vide DECIMAL(12, 2) NULL,
    poids_total_charge DECIMAL(12, 2) NULL,
    kilometrage_initial BIGINT NOT NULL,
    kilometrage_actuel BIGINT NOT NULL,
    date_premiere_mise_circulation DATE NULL,
    date_mutation DATE NULL,
    statut VARCHAR(20) NOT NULL,
    etat_general VARCHAR(20) NOT NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_vehicules PRIMARY KEY (id),
    CONSTRAINT fk_vehicules_modeles FOREIGN KEY (modele_id) REFERENCES modeles(id),
    CONSTRAINT uk_vehicules_code UNIQUE (code),
    CONSTRAINT uk_vehicules_immatriculation UNIQUE (immatriculation),
    CONSTRAINT uk_vehicules_vin UNIQUE (vin),
    CONSTRAINT ck_vehicules_immatriculation_marocaine CHECK (
        (
            LEN(immatriculation) BETWEEN 1 AND 8
            AND immatriculation NOT LIKE '%[^0-9]%'
        )
        OR (
            LEN(immatriculation) - LEN(REPLACE(immatriculation, '-', '')) = 2
            AND LEN(PARSENAME(REPLACE(immatriculation, '-', '.'), 3)) BETWEEN 1 AND 5
            AND TRY_CONVERT(INT, PARSENAME(REPLACE(immatriculation, '-', '.'), 3)) IS NOT NULL
            AND PARSENAME(REPLACE(immatriculation, '-', '.'), 2) LIKE '[A-Z]'
            AND LEN(PARSENAME(REPLACE(immatriculation, '-', '.'), 2)) = 1
            AND LEN(PARSENAME(REPLACE(immatriculation, '-', '.'), 1)) BETWEEN 1 AND 2
            AND TRY_CONVERT(INT, PARSENAME(REPLACE(immatriculation, '-', '.'), 1)) IS NOT NULL
        )
    ),
    CONSTRAINT ck_vehicules_genre CHECK (genre IN (
        'VOITURE_TOURISME', 'FOURGONNETTE_VITREE', 'FOURGONNETTE',
        'MINIBUS', 'UTILITAIRE', 'CYCLOMOTEUR'
    )),
    CONSTRAINT ck_vehicules_carburant CHECK (carburant IN (
        'DIESEL', 'ESSENCE', 'HYBRIDE', 'ELECTRIQUE', 'MELANGE'
    )),
    CONSTRAINT ck_vehicules_statut CHECK (statut IN (
        'DISPONIBLE', 'AFFECTE', 'IMMOBILISE', 'EN_MAINTENANCE', 'REFORME', 'INACTIF'
    )),
    CONSTRAINT ck_vehicules_etat CHECK (etat_general IN (
        'BON_ETAT', 'ETAT_MOYEN', 'MAUVAIS_ETAT'
    )),
    CONSTRAINT ck_vehicules_valeurs_positives CHECK (
        (nombre_cylindres IS NULL OR nombre_cylindres > 0)
        AND (puissance_fiscale IS NULL OR puissance_fiscale > 0)
        AND (poids_vide IS NULL OR poids_vide > 0)
        AND (poids_total_charge IS NULL OR poids_total_charge > 0)
        AND kilometrage_initial >= 0
        AND kilometrage_actuel >= kilometrage_initial
    )
);

CREATE TABLE releves_kilometriques (
    id UNIQUEIDENTIFIER NOT NULL,
    vehicule_id UNIQUEIDENTIFIER NOT NULL,
    date_releve DATE NOT NULL,
    kilometrage BIGINT NOT NULL,
    source VARCHAR(20) NOT NULL,
    commentaire NVARCHAR(80) NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_releves_kilometriques PRIMARY KEY (id),
    CONSTRAINT fk_releves_vehicules FOREIGN KEY (vehicule_id) REFERENCES vehicules(id),
    CONSTRAINT ck_releves_kilometrage CHECK (kilometrage >= 0),
    CONSTRAINT ck_releves_source CHECK (source IN ('SAISIE_MANUELLE', 'CONTROLE_PARC', 'AUTRE'))
);

CREATE TABLE pieces_jointes_vehicule (
    id UNIQUEIDENTIFIER NOT NULL,
    vehicule_id UNIQUEIDENTIFIER NOT NULL,
    type_piece VARCHAR(20) NOT NULL,
    nom_fichier NVARCHAR(255) NOT NULL,
    type_contenu VARCHAR(100) NOT NULL,
    taille BIGINT NOT NULL,
    contenu VARBINARY(MAX) NOT NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_pieces_jointes_vehicule PRIMARY KEY (id),
    CONSTRAINT fk_pieces_jointes_vehicules FOREIGN KEY (vehicule_id) REFERENCES vehicules(id),
    CONSTRAINT ck_pieces_jointes_type CHECK (type_piece IN (
        'CARTE_GRISE', 'ASSURANCE', 'VISITE_TECHNIQUE', 'VIGNETTE', 'AUTRE'
    )),
    CONSTRAINT ck_pieces_jointes_taille CHECK (taille > 0 AND taille <= 5242880)
);

CREATE INDEX ix_vehicules_statut_genre ON vehicules(statut, genre);
CREATE INDEX ix_vehicules_modele ON vehicules(modele_id);
CREATE INDEX ix_releves_vehicule_date ON releves_kilometriques(vehicule_id, date_releve DESC);
CREATE INDEX ix_pieces_vehicule ON pieces_jointes_vehicule(vehicule_id);
