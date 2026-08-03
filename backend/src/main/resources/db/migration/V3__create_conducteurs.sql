CREATE TABLE conducteurs (
    id UNIQUEIDENTIFIER NOT NULL,
    matricule VARCHAR(20) NOT NULL,
    nom_complet NVARCHAR(80) NOT NULL,
    telephone VARCHAR(20) NULL,
    numero_permis VARCHAR(50) NOT NULL,
    date_validite_permis DATE NOT NULL,
    actif BIT NOT NULL CONSTRAINT df_conducteurs_actif DEFAULT 1,
  
    date_creation DATETIME2 NOT NULL,
    cree_par NVARCHAR(100) NOT NULL,
    date_modification DATETIME2 NULL,
    modifie_par NVARCHAR(100) NULL,
    
   
    CONSTRAINT pk_conducteurs PRIMARY KEY (id),
    CONSTRAINT uk_conducteurs_matricule UNIQUE (matricule),
    CONSTRAINT uk_conducteurs_numero_permis UNIQUE (numero_permis)
);

CREATE TABLE conducteurs_evenements (
    id UNIQUEIDENTIFIER NOT NULL,
    conducteur_id UNIQUEIDENTIFIER NOT NULL,
    action VARCHAR(20) NOT NULL,
    date_evenement DATETIME2 NOT NULL,
    utilisateur NVARCHAR(100) NOT NULL,
    
    CONSTRAINT pk_conducteurs_evenements PRIMARY KEY (id),
    CONSTRAINT conducteurs_evenements_foreign_key FOREIGN KEY (conducteur_id) REFERENCES conducteurs(id),
    CONSTRAINT conducteurs_evenements_action_check CHECK (action IN ('CREATION', 'MODIFICATION', 'ACTIVATION', 'DESACTIVATION'))
);