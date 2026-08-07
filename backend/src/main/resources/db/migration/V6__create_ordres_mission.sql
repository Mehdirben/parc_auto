ALTER TABLE services_parcs ADD categorie_mission VARCHAR(30) NULL;
GO

ALTER TABLE services_parcs ADD CONSTRAINT ck_services_parcs_categorie_mission
    CHECK (categorie_mission IS NULL OR categorie_mission IN (
        'MISSION', 'MISSION_URBAINE', 'DEPOT_DEMENAGEMENT'
    ));
GO

UPDATE services_parcs
SET categorie_mission = CASE UPPER(libelle)
    WHEN N'PARC MISSION' THEN 'MISSION'
    WHEN N'PARC MISSION URBAINE' THEN 'MISSION_URBAINE'
    WHEN N'PARC DÉPÔT/DÉMÉNAGEMENT' THEN 'DEPOT_DEMENAGEMENT'
END
WHERE UPPER(libelle) IN (
    N'PARC MISSION', N'PARC MISSION URBAINE', N'PARC DÉPÔT/DÉMÉNAGEMENT'
);
GO

INSERT INTO services_parcs (
    id, code, libelle, type, actif,
    categorie_mission, date_creation, cree_par
)
SELECT NEWID(), source.code, source.libelle, 'PARC_COMMUN', 1,
       source.categorie, SYSUTCDATETIME(), N'SYSTEME'
FROM (VALUES
    ('PARC-MISSION', N'PARC MISSION', 'MISSION'),
    ('PARC-URBAIN', N'PARC MISSION URBAINE', 'MISSION_URBAINE'),
    ('PARC-DEPOT', N'PARC DÉPÔT/DÉMÉNAGEMENT', 'DEPOT_DEMENAGEMENT')
) source(code, libelle, categorie)
WHERE NOT EXISTS (
    SELECT 1 FROM services_parcs s WHERE s.categorie_mission = source.categorie
);
GO

CREATE UNIQUE INDEX uk_services_parcs_categorie_mission
    ON services_parcs(categorie_mission)
    WHERE categorie_mission IS NOT NULL;
GO

ALTER TABLE affectations ADD date_fin_prevue DATE NULL;
ALTER TABLE affectations ADD type_mission NVARCHAR(200) NULL;
GO

ALTER TABLE affectations ADD CONSTRAINT ck_affectations_mission
    CHECK (
        (date_fin_prevue IS NULL AND type_mission IS NULL)
        OR (
            date_fin_prevue IS NOT NULL
            AND date_fin_prevue >= date_debut
            AND LEN(LTRIM(RTRIM(type_mission))) > 0
        )
    );
GO

CREATE SEQUENCE ordre_mission_sequence AS BIGINT START WITH 1 INCREMENT BY 1;

CREATE TABLE ordres_mission (
    id UNIQUEIDENTIFIER NOT NULL,
    affectation_id UNIQUEIDENTIFIER NOT NULL,
    numero VARCHAR(14) NOT NULL,
    date_edition DATE NOT NULL,
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    CONSTRAINT pk_ordres_mission PRIMARY KEY (id),
    CONSTRAINT fk_ordres_mission_affectation
        FOREIGN KEY (affectation_id) REFERENCES affectations(id),
    CONSTRAINT uk_ordres_mission_affectation UNIQUE (affectation_id),
    CONSTRAINT uk_ordres_mission_numero UNIQUE (numero),
    CONSTRAINT ck_ordres_mission_numero
        CHECK (numero LIKE 'OM-[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9]')
);

CREATE INDEX ix_ordres_mission_date_edition
    ON ordres_mission(date_edition DESC);
