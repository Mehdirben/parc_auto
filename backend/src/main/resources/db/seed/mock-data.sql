-- Idempotent local/demo dataset. Stable UUIDs and MOCK-prefixed business codes
-- keep these rows separate from application-managed sequences.

IF NOT EXISTS (SELECT 1 FROM marques WHERE id = '10000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO marques (id, code, designation, date_creation, cree_par)
 VALUES ('10000000-0000-0000-0000-000000000001','MOCK-REN',N'Renault',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM marques WHERE id = '10000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO marques (id, code, designation, date_creation, cree_par)
 VALUES ('10000000-0000-0000-0000-000000000002','MOCK-DAC',N'Dacia',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM marques WHERE id = '10000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO marques (id, code, designation, date_creation, cree_par)
 VALUES ('10000000-0000-0000-0000-000000000003','MOCK-TOY',N'Toyota',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM modeles WHERE id = '20000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO modeles (id, marque_id, nom, date_creation, cree_par)
 VALUES ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',N'Clio',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM modeles WHERE id = '20000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO modeles (id, marque_id, nom, date_creation, cree_par)
 VALUES ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',N'Kangoo',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM modeles WHERE id = '20000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO modeles (id, marque_id, nom, date_creation, cree_par)
 VALUES ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',N'Duster',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM modeles WHERE id = '20000000-0000-0000-0000-000000000004') BEGIN
 INSERT INTO modeles (id, marque_id, nom, date_creation, cree_par)
 VALUES ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003',N'Corolla',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM services_parcs WHERE id = '30000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO services_parcs (id,code,libelle,type,actif,categorie_mission,date_creation,cree_par)
 VALUES ('30000000-0000-0000-0000-000000000001','MOCK-FIN',N'Direction financière','DIRECTION',1,NULL,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM services_parcs WHERE id = '30000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO services_parcs (id,code,libelle,type,actif,categorie_mission,date_creation,cree_par)
 VALUES ('30000000-0000-0000-0000-000000000002','MOCK-RH',N'Ressources humaines','DIRECTION',1,NULL,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM services_parcs WHERE id = '30000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO services_parcs (id,code,libelle,type,actif,categorie_mission,date_creation,cree_par)
 VALUES ('30000000-0000-0000-0000-000000000003','MOCK-IT',N'Systèmes d''information','DIRECTION',1,NULL,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM conducteurs WHERE id = '40000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO conducteurs (id,matricule,nom_complet,telephone,numero_permis,date_validite_permis,actif,date_creation,cree_par)
 VALUES ('40000000-0000-0000-0000-000000000001','M100001',N'Amine El Mansouri','0612345678','100000000001',DATEADD(YEAR,3,CAST(GETDATE() AS date)),1,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM conducteurs WHERE id = '40000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO conducteurs (id,matricule,nom_complet,telephone,numero_permis,date_validite_permis,actif,date_creation,cree_par)
 VALUES ('40000000-0000-0000-0000-000000000002','M100002',N'Salma Bennani','0676543210','100000000002',DATEADD(MONTH,8,CAST(GETDATE() AS date)),1,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM conducteurs WHERE id = '40000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO conducteurs (id,matricule,nom_complet,telephone,numero_permis,date_validite_permis,actif,date_creation,cree_par)
 VALUES ('40000000-0000-0000-0000-000000000003','M100003',N'Youssef Alaoui','0711223344','100000000003',DATEADD(DAY,45,CAST(GETDATE() AS date)),1,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM conducteurs WHERE id = '40000000-0000-0000-0000-000000000004') BEGIN
 INSERT INTO conducteurs (id,matricule,nom_complet,telephone,numero_permis,date_validite_permis,actif,date_creation,cree_par)
 VALUES ('40000000-0000-0000-0000-000000000004','M100004',N'Nadia Chafai',NULL,'100000000004',DATEADD(DAY,-20,CAST(GETDATE() AS date)),0,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM vehicules WHERE id = '50000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO vehicules (id,code,immatriculation,ancienne_immatriculation,modele_id,genre,vin,carburant,nombre_cylindres,puissance_fiscale,poids_vide,poids_total_charge,kilometrage_initial,kilometrage_actuel,date_premiere_mise_circulation,date_mutation,statut,etat_general,date_creation,cree_par)
 VALUES ('50000000-0000-0000-0000-000000000001','MOCK00001','12345-A-6',NULL,'20000000-0000-0000-0000-000000000001','VOITURE_TOURISME','VF1MOCK0000000001','DIESEL',4,6,1090,1650,42000,48650,DATEADD(YEAR,-4,CAST(GETDATE() AS date)),NULL,'AFFECTE','BON_ETAT',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM vehicules WHERE id = '50000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO vehicules (id,code,immatriculation,ancienne_immatriculation,modele_id,genre,vin,carburant,nombre_cylindres,puissance_fiscale,poids_vide,poids_total_charge,kilometrage_initial,kilometrage_actuel,date_premiere_mise_circulation,date_mutation,statut,etat_general,date_creation,cree_par)
 VALUES ('50000000-0000-0000-0000-000000000002','MOCK00002','24680-B-1',NULL,'20000000-0000-0000-0000-000000000002','FOURGONNETTE','VF1MOCK0000000002','DIESEL',4,7,1350,2100,76000,82120,DATEADD(YEAR,-6,CAST(GETDATE() AS date)),NULL,'AFFECTE','ETAT_MOYEN',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM vehicules WHERE id = '50000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO vehicules (id,code,immatriculation,ancienne_immatriculation,modele_id,genre,vin,carburant,nombre_cylindres,puissance_fiscale,poids_vide,poids_total_charge,kilometrage_initial,kilometrage_actuel,date_premiere_mise_circulation,date_mutation,statut,etat_general,date_creation,cree_par)
 VALUES ('50000000-0000-0000-0000-000000000003','MOCK00003','13579-C-8',NULL,'20000000-0000-0000-0000-000000000003','UTILITAIRE','UU1MOCK0000000003','DIESEL',4,8,1450,2050,18000,21780,DATEADD(YEAR,-2,CAST(GETDATE() AS date)),NULL,'DISPONIBLE','BON_ETAT',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM vehicules WHERE id = '50000000-0000-0000-0000-000000000004') BEGIN
 INSERT INTO vehicules (id,code,immatriculation,ancienne_immatriculation,modele_id,genre,vin,carburant,nombre_cylindres,puissance_fiscale,poids_vide,poids_total_charge,kilometrage_initial,kilometrage_actuel,date_premiere_mise_circulation,date_mutation,statut,etat_general,date_creation,cree_par)
 VALUES ('50000000-0000-0000-0000-000000000004','MOCK00004','9876-D-10',NULL,'20000000-0000-0000-0000-000000000004','VOITURE_TOURISME','JTDMOCK0000000004','HYBRIDE',4,7,1320,1820,9000,12540,DATEADD(YEAR,-1,CAST(GETDATE() AS date)),NULL,'EN_MAINTENANCE','BON_ETAT',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM vehicules WHERE id = '50000000-0000-0000-0000-000000000005') BEGIN
 INSERT INTO vehicules (id,code,immatriculation,ancienne_immatriculation,modele_id,genre,vin,carburant,nombre_cylindres,puissance_fiscale,poids_vide,poids_total_charge,kilometrage_initial,kilometrage_actuel,date_premiere_mise_circulation,date_mutation,statut,etat_general,date_creation,cree_par)
 VALUES ('50000000-0000-0000-0000-000000000005','MOCK00005','11223-E-7',NULL,'20000000-0000-0000-0000-000000000001','VOITURE_TOURISME','VF1MOCK0000000005','ESSENCE',4,6,1070,1600,105000,118300,DATEADD(YEAR,-9,CAST(GETDATE() AS date)),NULL,'IMMOBILISE','MAUVAIS_ETAT',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id = '60000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par)
 VALUES ('60000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001',DATEADD(DAY,-30,CAST(GETDATE() AS date)),48020,'CONTROLE_PARC',N'Contrôle mensuel',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id = '60000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par)
 VALUES ('60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001',DATEADD(DAY,-2,CAST(GETDATE() AS date)),48650,'SAISIE_MANUELLE',NULL,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id = '60000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par)
 VALUES ('60000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003',DATEADD(DAY,-5,CAST(GETDATE() AS date)),21780,'CONTROLE_PARC',N'RAS',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id = '60000000-0000-0000-0000-000000000004') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par)
 VALUES ('60000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000002',DATEADD(DAY,-7,CAST(GETDATE() AS date)),82120,'CONTROLE_PARC',N'Contrôle périodique',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id = '60000000-0000-0000-0000-000000000005') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par)
 VALUES ('60000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004',DATEADD(DAY,-12,CAST(GETDATE() AS date)),12540,'SAISIE_MANUELLE',N'Relevé avant maintenance',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id = '60000000-0000-0000-0000-000000000006') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par)
 VALUES ('60000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005',DATEADD(DAY,-9,CAST(GETDATE() AS date)),118300,'CONTROLE_PARC',N'Relevé lors du diagnostic d''immobilisation',SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM affectations WHERE id = '70000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO affectations (id,vehicule_id,service_parc_id,conducteur_id,date_debut,date_fin,motif,statut,date_fin_prevue,type_mission,date_creation,cree_par)
 VALUES ('70000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',DATEADD(MONTH,-3,CAST(GETDATE() AS date)),NULL,N'Déplacements de la direction financière','ACTIVE',NULL,NULL,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@
IF NOT EXISTS (SELECT 1 FROM affectations WHERE id = '70000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO affectations (id,vehicule_id,service_parc_id,conducteur_id,date_debut,date_fin,motif,statut,date_fin_prevue,type_mission,date_creation,cree_par)
 SELECT '70000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002',id,'40000000-0000-0000-0000-000000000002',CAST(GETDATE() AS date),NULL,N'Mission régionale de contrôle','ACTIVE',DATEADD(DAY,4,CAST(GETDATE() AS date)),N'Contrôle des antennes régionales',SYSUTCDATETIME(),N'MOCK_SEEDER'
 FROM services_parcs WHERE categorie_mission = 'MISSION';
END
@@
IF NOT EXISTS (SELECT 1 FROM affectations WHERE id = '70000000-0000-0000-0000-000000000003') BEGIN
 INSERT INTO affectations (id,vehicule_id,service_parc_id,conducteur_id,date_debut,date_fin,motif,statut,date_fin_prevue,type_mission,date_creation,cree_par)
 VALUES ('70000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000003',DATEADD(MONTH,-4,CAST(GETDATE() AS date)),DATEADD(MONTH,-2,CAST(GETDATE() AS date)),N'Intervention technique temporaire','TERMINEE',NULL,NULL,SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

IF NOT EXISTS (SELECT 1 FROM ordres_mission WHERE id = '80000000-0000-0000-0000-000000000001')
AND EXISTS (SELECT 1 FROM affectations WHERE id = '70000000-0000-0000-0000-000000000002') BEGIN
 INSERT INTO ordres_mission (id,affectation_id,numero,date_edition,date_creation,cree_par)
 VALUES ('80000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000002',CONCAT('OM-',YEAR(GETDATE()),'-900001'),CAST(GETDATE() AS date),SYSUTCDATETIME(),N'MOCK_SEEDER');
END
@@

-- Bring seed-owned rows in line with values produced by the application UI.
-- The MOCK_SEEDER predicate makes metadata updates one-time and preserves later
-- changes made by demo users.
UPDATE marques SET code = 'REN01', date_creation = DATEADD(DAY,-900,SYSUTCDATETIME()), cree_par = N'admin.parc'
WHERE id = '10000000-0000-0000-0000-000000000001' AND cree_par = N'MOCK_SEEDER';
UPDATE marques SET code = 'DAC02', date_creation = DATEADD(DAY,-895,SYSUTCDATETIME()), cree_par = N'admin.parc'
WHERE id = '10000000-0000-0000-0000-000000000002' AND cree_par = N'MOCK_SEEDER';
UPDATE marques SET code = 'TOY03', date_creation = DATEADD(DAY,-890,SYSUTCDATETIME()), cree_par = N'admin.parc'
WHERE id = '10000000-0000-0000-0000-000000000003' AND cree_par = N'MOCK_SEEDER';
@@

UPDATE modeles SET date_creation = DATEADD(DAY,-880,SYSUTCDATETIME()), cree_par = N'gestionnaire.parc'
WHERE id IN ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002') AND cree_par = N'MOCK_SEEDER';
UPDATE modeles SET date_creation = DATEADD(DAY,-875,SYSUTCDATETIME()), cree_par = N'gestionnaire.parc'
WHERE id IN ('20000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004') AND cree_par = N'MOCK_SEEDER';
@@

UPDATE services_parcs SET code='DAF-01', libelle=N'Direction administrative et financière',
 date_creation=DATEADD(DAY,-700,SYSUTCDATETIME()), cree_par=N'admin.parc'
WHERE id='30000000-0000-0000-0000-000000000001' AND cree_par=N'MOCK_SEEDER';
UPDATE services_parcs SET code='DRH-01', date_creation=DATEADD(DAY,-695,SYSUTCDATETIME()), cree_par=N'admin.parc'
WHERE id='30000000-0000-0000-0000-000000000002' AND cree_par=N'MOCK_SEEDER';
UPDATE services_parcs SET code='DSI-01', date_creation=DATEADD(DAY,-690,SYSUTCDATETIME()), cree_par=N'admin.parc'
WHERE id='30000000-0000-0000-0000-000000000003' AND cree_par=N'MOCK_SEEDER';
@@

UPDATE conducteurs SET matricule='2031847', nom_complet=N'Amine El Mansouri',
 telephone='0612345678', numero_permis='012458731204',
 date_validite_permis=DATEADD(YEAR,3,CAST(GETDATE() AS date)), date_creation=DATEADD(DAY,-650,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc'
WHERE id='40000000-0000-0000-0000-000000000001' AND cree_par=N'MOCK_SEEDER';
UPDATE conducteurs SET matricule='1987624', nom_complet=N'Salma Bennani',
 telephone='0676543210', numero_permis='024681357902',
 date_validite_permis=DATEADD(MONTH,8,CAST(GETDATE() AS date)), date_creation=DATEADD(DAY,-620,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc'
WHERE id='40000000-0000-0000-0000-000000000002' AND cree_par=N'MOCK_SEEDER';
UPDATE conducteurs SET matricule='2154098', nom_complet=N'Youssef Alaoui',
 telephone='0711223344', numero_permis='036925814703',
 date_validite_permis=DATEADD(DAY,45,CAST(GETDATE() AS date)), date_creation=DATEADD(DAY,-580,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc'
WHERE id='40000000-0000-0000-0000-000000000003' AND cree_par=N'MOCK_SEEDER';
UPDATE conducteurs SET matricule='1875432', nom_complet=N'Nadia Chafai',
 telephone='0522334455', numero_permis='048159263704',
 date_validite_permis=DATEADD(DAY,-20,CAST(GETDATE() AS date)), date_creation=DATEADD(DAY,-720,SYSUTCDATETIME()),
 date_modification=DATEADD(DAY,-20,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc', modifie_par=N'admin.parc'
WHERE id='40000000-0000-0000-0000-000000000004' AND cree_par=N'MOCK_SEEDER';
@@

UPDATE vehicules SET code='VEH0000001', vin='VF1RJA00671234567', ancienne_immatriculation='78432-A-6', date_mutation=DATEADD(YEAR,-3,CAST(GETDATE() AS date)),
 date_creation=DATEADD(DAY,-500,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc'
WHERE id='50000000-0000-0000-0000-000000000001' AND cree_par=N'MOCK_SEEDER';
UPDATE vehicules SET code='VEH0000002', vin='VF1FW15B671234568', ancienne_immatriculation='45821-B-1', date_mutation=DATEADD(YEAR,-5,CAST(GETDATE() AS date)),
 date_creation=DATEADD(DAY,-470,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc'
WHERE id='50000000-0000-0000-0000-000000000002' AND cree_par=N'MOCK_SEEDER';
UPDATE vehicules SET code='VEH0000003', vin='UU1HSDADG71234569', date_creation=DATEADD(DAY,-390,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc'
WHERE id='50000000-0000-0000-0000-000000000003' AND cree_par=N'MOCK_SEEDER';
UPDATE vehicules SET code='VEH0000004', vin='JTDBR32E720123570', date_creation=DATEADD(DAY,-300,SYSUTCDATETIME()),
 date_modification=DATEADD(DAY,-12,SYSUTCDATETIME()), cree_par=N'gestionnaire.parc', modifie_par=N'gestionnaire.parc'
WHERE id='50000000-0000-0000-0000-000000000004' AND cree_par=N'MOCK_SEEDER';
UPDATE vehicules SET code='VEH0000005', vin='VF1BB05CF71234571', ancienne_immatriculation='66541-E-7', date_mutation=DATEADD(YEAR,-7,CAST(GETDATE() AS date)),
 date_creation=DATEADD(DAY,-600,SYSUTCDATETIME()), date_modification=DATEADD(DAY,-9,SYSUTCDATETIME()),
 cree_par=N'gestionnaire.parc', modifie_par=N'gestionnaire.parc'
WHERE id='50000000-0000-0000-0000-000000000005' AND cree_par=N'MOCK_SEEDER';
@@

-- Keep application sequences ahead of the UI-style codes used above without
-- ever moving a sequence backwards after users have created additional data.
IF COALESCE((SELECT CAST(current_value AS BIGINT) FROM sys.sequences WHERE name='marque_code_sequence'),0) < 3
 ALTER SEQUENCE marque_code_sequence RESTART WITH 4;
IF COALESCE((SELECT CAST(current_value AS BIGINT) FROM sys.sequences WHERE name='vehicule_code_sequence'),0) < 5
 ALTER SEQUENCE vehicule_code_sequence RESTART WITH 6;
IF COALESCE((SELECT CAST(current_value AS BIGINT) FROM sys.sequences WHERE name='ordre_mission_sequence'),0) < 1
 ALTER SEQUENCE ordre_mission_sequence RESTART WITH 2;
@@

-- Complete mileage timelines for every vehicle.
IF NOT EXISTS (SELECT 1 FROM releves_kilometriques WHERE id='60000000-0000-0000-0000-000000000007') BEGIN
 INSERT INTO releves_kilometriques (id,vehicule_id,date_releve,kilometrage,source,commentaire,date_creation,cree_par) VALUES
 ('60000000-0000-0000-0000-000000000007','50000000-0000-0000-0000-000000000001',DATEADD(DAY,-180,CAST(GETDATE() AS date)),45000,'CONTROLE_PARC',N'Contrôle semestriel',DATEADD(DAY,-180,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000008','50000000-0000-0000-0000-000000000001',DATEADD(DAY,-90,CAST(GETDATE() AS date)),47000,'SAISIE_MANUELLE',N'Relevé conducteur',DATEADD(DAY,-90,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000009','50000000-0000-0000-0000-000000000002',DATEADD(DAY,-120,CAST(GETDATE() AS date)),78000,'CONTROLE_PARC',N'Contrôle trimestriel',DATEADD(DAY,-120,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000010','50000000-0000-0000-0000-000000000002',DATEADD(DAY,-60,CAST(GETDATE() AS date)),80000,'SAISIE_MANUELLE',N'Retour de mission',DATEADD(DAY,-60,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000011','50000000-0000-0000-0000-000000000003',DATEADD(DAY,-90,CAST(GETDATE() AS date)),19500,'CONTROLE_PARC',N'Contrôle trimestriel',DATEADD(DAY,-90,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000012','50000000-0000-0000-0000-000000000003',DATEADD(DAY,-30,CAST(GETDATE() AS date)),21000,'SAISIE_MANUELLE',N'Relevé mensuel',DATEADD(DAY,-30,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000013','50000000-0000-0000-0000-000000000004',DATEADD(DAY,-80,CAST(GETDATE() AS date)),10200,'CONTROLE_PARC',N'Contrôle périodique',DATEADD(DAY,-80,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000014','50000000-0000-0000-0000-000000000004',DATEADD(DAY,-40,CAST(GETDATE() AS date)),11700,'SAISIE_MANUELLE',N'Relevé avant entretien',DATEADD(DAY,-40,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000015','50000000-0000-0000-0000-000000000005',DATEADD(DAY,-90,CAST(GETDATE() AS date)),110000,'CONTROLE_PARC',N'Contrôle trimestriel',DATEADD(DAY,-90,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('60000000-0000-0000-0000-000000000016','50000000-0000-0000-0000-000000000005',DATEADD(DAY,-45,CAST(GETDATE() AS date)),115000,'SAISIE_MANUELLE',N'Relevé conducteur',DATEADD(DAY,-45,SYSUTCDATETIME()),N'gestionnaire.parc');
END
@@

UPDATE releves_kilometriques SET date_creation=DATEADD(MINUTE,15,CAST(date_releve AS DATETIME2)), cree_par=N'gestionnaire.parc'
WHERE cree_par=N'MOCK_SEEDER';
@@

-- Lightweight but valid PNG documents make the Documents tab representative.
IF NOT EXISTS (SELECT 1 FROM pieces_jointes_vehicule WHERE id='61000000-0000-0000-0000-000000000001') BEGIN
 INSERT INTO pieces_jointes_vehicule (id,vehicule_id,type_piece,nom_fichier,type_contenu,taille,contenu,date_creation,cree_par) VALUES
 ('61000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','CARTE_GRISE',N'carte-grise-12345-A-6.png','image/png',68,0x89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da6364f80f00010501012718e3660000000049454e44ae426082,DATEADD(DAY,-490,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('61000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','ASSURANCE',N'attestation-assurance-2026.png','image/png',68,0x89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da6364f80f00010501012718e3660000000049454e44ae426082,DATEADD(DAY,-60,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('61000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','CARTE_GRISE',N'carte-grise-24680-B-1.png','image/png',68,0x89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da6364f80f00010501012718e3660000000049454e44ae426082,DATEADD(DAY,-460,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('61000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000003','VISITE_TECHNIQUE',N'visite-technique-13579-C-8.png','image/png',68,0x89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da6364f80f00010501012718e3660000000049454e44ae426082,DATEADD(DAY,-75,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('61000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','ASSURANCE',N'assurance-corolla-2026.png','image/png',68,0x89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da6364f80f00010501012718e3660000000049454e44ae426082,DATEADD(DAY,-55,SYSUTCDATETIME()),N'gestionnaire.parc');
END
@@

-- Completed movements complement active assignments and populate history tabs.
IF NOT EXISTS (SELECT 1 FROM affectations WHERE id='70000000-0000-0000-0000-000000000004') BEGIN
 INSERT INTO affectations (id,vehicule_id,service_parc_id,conducteur_id,date_debut,date_fin,motif,statut,date_fin_prevue,type_mission,date_creation,cree_par) VALUES
 ('70000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000003',DATEADD(MONTH,-9,CAST(GETDATE() AS date)),DATEADD(MONTH,-4,CAST(GETDATE() AS date)),N'Appui temporaire au service des ressources humaines','TERMINEE',NULL,NULL,DATEADD(MONTH,-9,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('70000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',DATEADD(MONTH,-6,CAST(GETDATE() AS date)),DATEADD(DAY,-15,CAST(GETDATE() AS date)),N'Déplacements administratifs interservices','TERMINEE',NULL,NULL,DATEADD(MONTH,-6,SYSUTCDATETIME()),N'gestionnaire.parc'),
 ('70000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000003',DATEADD(MONTH,-8,CAST(GETDATE() AS date)),DATEADD(DAY,-12,CAST(GETDATE() AS date)),N'Navettes administratives du personnel','TERMINEE',NULL,NULL,DATEADD(MONTH,-8,SYSUTCDATETIME()),N'gestionnaire.parc');
END
@@

UPDATE affectations SET date_creation=DATEADD(MINUTE,10,CAST(date_debut AS DATETIME2)), cree_par=N'gestionnaire.parc'
WHERE cree_par=N'MOCK_SEEDER';
UPDATE ordres_mission SET date_creation=DATEADD(MINUTE,20,CAST(date_edition AS DATETIME2)), cree_par=N'gestionnaire.parc'
WHERE id='80000000-0000-0000-0000-000000000001' AND cree_par=N'MOCK_SEEDER';
@@

-- Audit events mirror the actions produced by the UI services. Stable IDs make
-- the timeline safe to seed repeatedly.
INSERT INTO journalaudit (id,utilisateur,date_action,action,entite,entite_id,anciennes_valeurs,nouvelles_valeurs,adresse_ip,resultat)
SELECT source.id,source.utilisateur,source.date_action,source.action,source.entite,source.entite_id,
 source.anciennes_valeurs,source.nouvelles_valeurs,'127.0.0.1','SUCCES'
FROM (VALUES
 ('90000000-0000-0000-0000-000000000001',N'admin.parc',DATEADD(DAY,-900,SYSUTCDATETIME()),'CREATION','MARQUE','10000000-0000-0000-0000-000000000001',CAST(NULL AS NVARCHAR(MAX)),N'{"code":"REN01","designation":"Renault","modeles":[]}'),
 ('90000000-0000-0000-0000-000000000002',N'admin.parc',DATEADD(DAY,-895,SYSUTCDATETIME()),'CREATION','MARQUE','10000000-0000-0000-0000-000000000002',NULL,N'{"code":"DAC02","designation":"Dacia","modeles":[]}'),
 ('90000000-0000-0000-0000-000000000003',N'admin.parc',DATEADD(DAY,-890,SYSUTCDATETIME()),'CREATION','MARQUE','10000000-0000-0000-0000-000000000003',NULL,N'{"code":"TOY03","designation":"Toyota","modeles":[]}'),
 ('90000000-0000-0000-0000-000000000004',N'gestionnaire.parc',DATEADD(DAY,-880,SYSUTCDATETIME()),'CREATION','MODELE','20000000-0000-0000-0000-000000000001',NULL,N'{"nom":"Clio","marqueCode":"REN01"}'),
 ('90000000-0000-0000-0000-000000000005',N'gestionnaire.parc',DATEADD(DAY,-880,SYSUTCDATETIME()),'CREATION','MODELE','20000000-0000-0000-0000-000000000002',NULL,N'{"nom":"Kangoo","marqueCode":"REN01"}'),
 ('90000000-0000-0000-0000-000000000006',N'gestionnaire.parc',DATEADD(DAY,-875,SYSUTCDATETIME()),'CREATION','MODELE','20000000-0000-0000-0000-000000000003',NULL,N'{"nom":"Duster","marqueCode":"DAC02"}'),
 ('90000000-0000-0000-0000-000000000007',N'gestionnaire.parc',DATEADD(DAY,-875,SYSUTCDATETIME()),'CREATION','MODELE','20000000-0000-0000-0000-000000000004',NULL,N'{"nom":"Corolla","marqueCode":"TOY03"}'),
 ('90000000-0000-0000-0000-000000000008',N'admin.parc',DATEADD(DAY,-700,SYSUTCDATETIME()),'CREATION','SERVICE_PARC','30000000-0000-0000-0000-000000000001',NULL,N'{"code":"DAF-01","libelle":"Direction administrative et financière","type":"DIRECTION","actif":true}'),
 ('90000000-0000-0000-0000-000000000009',N'admin.parc',DATEADD(DAY,-695,SYSUTCDATETIME()),'CREATION','SERVICE_PARC','30000000-0000-0000-0000-000000000002',NULL,N'{"code":"DRH-01","libelle":"Ressources humaines","type":"DIRECTION","actif":true}'),
 ('90000000-0000-0000-0000-000000000010',N'admin.parc',DATEADD(DAY,-690,SYSUTCDATETIME()),'CREATION','SERVICE_PARC','30000000-0000-0000-0000-000000000003',NULL,N'{"code":"DSI-01","libelle":"Systèmes d''information","type":"DIRECTION","actif":true}'),
 ('90000000-0000-0000-0000-000000000011',N'gestionnaire.parc',DATEADD(DAY,-650,SYSUTCDATETIME()),'CREATION','CONDUCTEUR','40000000-0000-0000-0000-000000000001',NULL,N'{"matricule":"2031847","nomComplet":"Amine El Mansouri","telephone":"0612345678","numeroPermis":"012458731204","actif":true}'),
 ('90000000-0000-0000-0000-000000000012',N'gestionnaire.parc',DATEADD(DAY,-620,SYSUTCDATETIME()),'CREATION','CONDUCTEUR','40000000-0000-0000-0000-000000000002',NULL,N'{"matricule":"1987624","nomComplet":"Salma Bennani","telephone":"0676543210","numeroPermis":"024681357902","actif":true}'),
 ('90000000-0000-0000-0000-000000000013',N'gestionnaire.parc',DATEADD(DAY,-580,SYSUTCDATETIME()),'CREATION','CONDUCTEUR','40000000-0000-0000-0000-000000000003',NULL,N'{"matricule":"2154098","nomComplet":"Youssef Alaoui","telephone":"0711223344","numeroPermis":"036925814703","actif":true}'),
 ('90000000-0000-0000-0000-000000000014',N'gestionnaire.parc',DATEADD(DAY,-720,SYSUTCDATETIME()),'CREATION','CONDUCTEUR','40000000-0000-0000-0000-000000000004',NULL,N'{"matricule":"1875432","nomComplet":"Nadia Chafai","telephone":"0522334455","numeroPermis":"048159263704","actif":true}'),
 ('90000000-0000-0000-0000-000000000015',N'admin.parc',DATEADD(DAY,-20,SYSUTCDATETIME()),'DESACTIVATION','CONDUCTEUR','40000000-0000-0000-0000-000000000004',N'{"actif":true}',N'{"actif":false}'),
 ('90000000-0000-0000-0000-000000000020',N'gestionnaire.parc',DATEADD(DAY,-500,SYSUTCDATETIME()),'CREATION','VEHICULE','50000000-0000-0000-0000-000000000001',NULL,N'{"code":"VEH0000001","immatriculation":"12345-A-6","vin":"VF1RJA00671234567","marque":"REN01","modele":"Clio","genre":"VOITURE_TOURISME","carburant":"DIESEL","kilometrageInitial":42000,"statut":"DISPONIBLE","etatGeneral":"BON_ETAT"}'),
 ('90000000-0000-0000-0000-000000000021',N'gestionnaire.parc',DATEADD(DAY,-470,SYSUTCDATETIME()),'CREATION','VEHICULE','50000000-0000-0000-0000-000000000002',NULL,N'{"code":"VEH0000002","immatriculation":"24680-B-1","vin":"VF1FW15B671234568","marque":"REN01","modele":"Kangoo","genre":"FOURGONNETTE","carburant":"DIESEL","kilometrageInitial":76000,"statut":"DISPONIBLE","etatGeneral":"ETAT_MOYEN"}'),
 ('90000000-0000-0000-0000-000000000022',N'gestionnaire.parc',DATEADD(DAY,-390,SYSUTCDATETIME()),'CREATION','VEHICULE','50000000-0000-0000-0000-000000000003',NULL,N'{"code":"VEH0000003","immatriculation":"13579-C-8","vin":"UU1HSDADG71234569","marque":"DAC02","modele":"Duster","genre":"UTILITAIRE","carburant":"DIESEL","kilometrageInitial":18000,"statut":"DISPONIBLE","etatGeneral":"BON_ETAT"}'),
 ('90000000-0000-0000-0000-000000000023',N'gestionnaire.parc',DATEADD(DAY,-300,SYSUTCDATETIME()),'CREATION','VEHICULE','50000000-0000-0000-0000-000000000004',NULL,N'{"code":"VEH0000004","immatriculation":"9876-D-10","vin":"JTDBR32E720123570","marque":"TOY03","modele":"Corolla","genre":"VOITURE_TOURISME","carburant":"HYBRIDE","kilometrageInitial":9000,"statut":"DISPONIBLE","etatGeneral":"BON_ETAT"}'),
 ('90000000-0000-0000-0000-000000000024',N'gestionnaire.parc',DATEADD(DAY,-600,SYSUTCDATETIME()),'CREATION','VEHICULE','50000000-0000-0000-0000-000000000005',NULL,N'{"code":"VEH0000005","immatriculation":"11223-E-7","vin":"VF1BB05CF71234571","marque":"REN01","modele":"Clio","genre":"VOITURE_TOURISME","carburant":"ESSENCE","kilometrageInitial":105000,"statut":"DISPONIBLE","etatGeneral":"ETAT_MOYEN"}'),
 ('90000000-0000-0000-0000-000000000025',N'gestionnaire.parc',DATEADD(DAY,-12,SYSUTCDATETIME()),'MODIFICATION_SITUATION','VEHICULE','50000000-0000-0000-0000-000000000004',N'{"statut":"DISPONIBLE","etatGeneral":"BON_ETAT"}',N'{"statut":"EN_MAINTENANCE","etatGeneral":"BON_ETAT"}'),
 ('90000000-0000-0000-0000-000000000026',N'gestionnaire.parc',DATEADD(DAY,-9,SYSUTCDATETIME()),'MODIFICATION_SITUATION','VEHICULE','50000000-0000-0000-0000-000000000005',N'{"statut":"DISPONIBLE","etatGeneral":"ETAT_MOYEN"}',N'{"statut":"IMMOBILISE","etatGeneral":"MAUVAIS_ETAT"}'),
 ('90000000-0000-0000-0000-000000000030',N'gestionnaire.parc',DATEADD(DAY,-180,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000001',NULL,N'{"date":"historique","kilometrage":45000,"source":"CONTROLE_PARC","commentaire":"Contrôle semestriel"}'),
 ('90000000-0000-0000-0000-000000000031',N'gestionnaire.parc',DATEADD(DAY,-90,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000001',NULL,N'{"date":"historique","kilometrage":47000,"source":"SAISIE_MANUELLE","commentaire":"Relevé conducteur"}'),
 ('90000000-0000-0000-0000-000000000032',N'gestionnaire.parc',DATEADD(DAY,-120,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000002',NULL,N'{"date":"historique","kilometrage":78000,"source":"CONTROLE_PARC","commentaire":"Contrôle trimestriel"}'),
 ('90000000-0000-0000-0000-000000000033',N'gestionnaire.parc',DATEADD(DAY,-60,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000002',NULL,N'{"date":"historique","kilometrage":80000,"source":"SAISIE_MANUELLE","commentaire":"Retour de mission"}'),
 ('90000000-0000-0000-0000-000000000034',N'gestionnaire.parc',DATEADD(DAY,-90,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000003',NULL,N'{"date":"historique","kilometrage":19500,"source":"CONTROLE_PARC","commentaire":"Contrôle trimestriel"}'),
 ('90000000-0000-0000-0000-000000000035',N'gestionnaire.parc',DATEADD(DAY,-30,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000003',NULL,N'{"date":"historique","kilometrage":21000,"source":"SAISIE_MANUELLE","commentaire":"Relevé mensuel"}'),
 ('90000000-0000-0000-0000-000000000036',N'gestionnaire.parc',DATEADD(DAY,-80,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000004',NULL,N'{"date":"historique","kilometrage":10200,"source":"CONTROLE_PARC","commentaire":"Contrôle périodique"}'),
 ('90000000-0000-0000-0000-000000000037',N'gestionnaire.parc',DATEADD(DAY,-40,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000004',NULL,N'{"date":"historique","kilometrage":11700,"source":"SAISIE_MANUELLE","commentaire":"Relevé avant entretien"}'),
 ('90000000-0000-0000-0000-000000000038',N'gestionnaire.parc',DATEADD(DAY,-90,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000005',NULL,N'{"date":"historique","kilometrage":110000,"source":"CONTROLE_PARC","commentaire":"Contrôle trimestriel"}'),
 ('90000000-0000-0000-0000-000000000039',N'gestionnaire.parc',DATEADD(DAY,-45,SYSUTCDATETIME()),'AJOUT_RELEVE','VEHICULE','50000000-0000-0000-0000-000000000005',NULL,N'{"date":"historique","kilometrage":115000,"source":"SAISIE_MANUELLE","commentaire":"Relevé conducteur"}'),
 ('90000000-0000-0000-0000-000000000040',N'gestionnaire.parc',DATEADD(DAY,-490,SYSUTCDATETIME()),'AJOUT_PIECE_JOINTE','VEHICULE','50000000-0000-0000-0000-000000000001',NULL,N'{"pieceId":"61000000-0000-0000-0000-000000000001","typePiece":"CARTE_GRISE","nomFichier":"carte-grise-12345-A-6.png"}'),
 ('90000000-0000-0000-0000-000000000041',N'gestionnaire.parc',DATEADD(DAY,-60,SYSUTCDATETIME()),'AJOUT_PIECE_JOINTE','VEHICULE','50000000-0000-0000-0000-000000000001',NULL,N'{"pieceId":"61000000-0000-0000-0000-000000000002","typePiece":"ASSURANCE","nomFichier":"attestation-assurance-2026.png"}'),
 ('90000000-0000-0000-0000-000000000042',N'gestionnaire.parc',DATEADD(DAY,-460,SYSUTCDATETIME()),'AJOUT_PIECE_JOINTE','VEHICULE','50000000-0000-0000-0000-000000000002',NULL,N'{"pieceId":"61000000-0000-0000-0000-000000000003","typePiece":"CARTE_GRISE","nomFichier":"carte-grise-24680-B-1.png"}'),
 ('90000000-0000-0000-0000-000000000043',N'gestionnaire.parc',DATEADD(DAY,-75,SYSUTCDATETIME()),'AJOUT_PIECE_JOINTE','VEHICULE','50000000-0000-0000-0000-000000000003',NULL,N'{"pieceId":"61000000-0000-0000-0000-000000000004","typePiece":"VISITE_TECHNIQUE","nomFichier":"visite-technique-13579-C-8.png"}'),
 ('90000000-0000-0000-0000-000000000044',N'gestionnaire.parc',DATEADD(DAY,-55,SYSUTCDATETIME()),'AJOUT_PIECE_JOINTE','VEHICULE','50000000-0000-0000-0000-000000000004',NULL,N'{"pieceId":"61000000-0000-0000-0000-000000000005","typePiece":"ASSURANCE","nomFichier":"assurance-corolla-2026.png"}'),
 ('90000000-0000-0000-0000-000000000050',N'gestionnaire.parc',DATEADD(MONTH,-3,SYSUTCDATETIME()),'CREATION','AFFECTATION','70000000-0000-0000-0000-000000000001',NULL,N'{"vehicule":"VEH0000001","serviceParc":"DAF-01","conducteur":"2031847","statut":"ACTIVE"}'),
 ('90000000-0000-0000-0000-000000000051',N'gestionnaire.parc',DATEADD(MINUTE,-30,SYSUTCDATETIME()),'CREATION','AFFECTATION','70000000-0000-0000-0000-000000000002',NULL,N'{"vehicule":"VEH0000002","serviceParc":"PARC-MISSION","conducteur":"1987624","statut":"ACTIVE","typeMission":"Contrôle des antennes régionales"}'),
 ('90000000-0000-0000-0000-000000000052',N'gestionnaire.parc',DATEADD(MONTH,-4,SYSUTCDATETIME()),'CREATION','AFFECTATION','70000000-0000-0000-0000-000000000003',NULL,N'{"vehicule":"VEH0000003","serviceParc":"DSI-01","conducteur":"2154098","statut":"ACTIVE"}'),
 ('90000000-0000-0000-0000-000000000053',N'gestionnaire.parc',DATEADD(MONTH,-2,SYSUTCDATETIME()),'RESTITUTION','AFFECTATION','70000000-0000-0000-0000-000000000003',N'{"statut":"ACTIVE"}',N'{"statut":"TERMINEE","motifRestitution":"Fin de l’intervention"}'),
 ('90000000-0000-0000-0000-000000000054',N'gestionnaire.parc',DATEADD(MONTH,-9,SYSUTCDATETIME()),'CREATION','AFFECTATION','70000000-0000-0000-0000-000000000004',NULL,N'{"vehicule":"VEH0000001","serviceParc":"DRH-01","conducteur":"2154098","statut":"ACTIVE"}'),
 ('90000000-0000-0000-0000-000000000055',N'gestionnaire.parc',DATEADD(MONTH,-4,SYSUTCDATETIME()),'CLOTURE_AUTOMATIQUE','AFFECTATION','70000000-0000-0000-0000-000000000004',N'{"statut":"ACTIVE"}',N'{"statut":"TERMINEE"}'),
 ('90000000-0000-0000-0000-000000000056',N'gestionnaire.parc',DATEADD(MONTH,-6,SYSUTCDATETIME()),'CREATION','AFFECTATION','70000000-0000-0000-0000-000000000005',NULL,N'{"vehicule":"VEH0000004","serviceParc":"DAF-01","conducteur":"2031847","statut":"ACTIVE"}'),
 ('90000000-0000-0000-0000-000000000057',N'gestionnaire.parc',DATEADD(DAY,-15,SYSUTCDATETIME()),'RESTITUTION','AFFECTATION','70000000-0000-0000-0000-000000000005',N'{"statut":"ACTIVE"}',N'{"statut":"TERMINEE","motifRestitution":"Mise en maintenance"}'),
 ('90000000-0000-0000-0000-000000000058',N'gestionnaire.parc',DATEADD(MONTH,-8,SYSUTCDATETIME()),'CREATION','AFFECTATION','70000000-0000-0000-0000-000000000006',NULL,N'{"vehicule":"VEH0000005","serviceParc":"DRH-01","conducteur":"2154098","statut":"ACTIVE"}'),
 ('90000000-0000-0000-0000-000000000059',N'gestionnaire.parc',DATEADD(DAY,-12,SYSUTCDATETIME()),'RESTITUTION','AFFECTATION','70000000-0000-0000-0000-000000000006',N'{"statut":"ACTIVE"}',N'{"statut":"TERMINEE","motifRestitution":"Diagnostic mécanique"}'),
 ('90000000-0000-0000-0000-000000000060',N'gestionnaire.parc',DATEADD(MINUTE,-20,SYSUTCDATETIME()),'GENERATION','ORDRE_MISSION','80000000-0000-0000-0000-000000000001',NULL,N'{"numero":"OM-2026-900001","affectationId":"70000000-0000-0000-0000-000000000002"}')
) source(id,utilisateur,date_action,action,entite,entite_id,anciennes_valeurs,nouvelles_valeurs)
WHERE NOT EXISTS (SELECT 1 FROM journalaudit audit WHERE audit.id=source.id);
@@
