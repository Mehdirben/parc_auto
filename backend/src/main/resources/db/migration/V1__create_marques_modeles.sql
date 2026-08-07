CREATE SEQUENCE marque_code_sequence
    AS BIGINT
    START WITH 1
    INCREMENT BY 1;

CREATE TABLE marques (
    id UNIQUEIDENTIFIER NOT NULL,
    code VARCHAR(10) NOT NULL,
    designation NVARCHAR(80) NOT NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_marques PRIMARY KEY (id),
    CONSTRAINT uk_marques_code UNIQUE (code),
    CONSTRAINT uk_marques_designation UNIQUE (designation)
);

CREATE TABLE modeles (
    id UNIQUEIDENTIFIER NOT NULL,
    marque_id UNIQUEIDENTIFIER NOT NULL,
    nom NVARCHAR(80) NOT NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_modeles PRIMARY KEY (id),
    CONSTRAINT fk_modeles_marques FOREIGN KEY (marque_id) REFERENCES marques(id),
    CONSTRAINT uk_modeles_marque_nom UNIQUE (marque_id, nom)
);

CREATE INDEX ix_modeles_marque_id ON modeles(marque_id);
