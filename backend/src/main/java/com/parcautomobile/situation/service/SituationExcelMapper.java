package com.parcautomobile.situation.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.parcautomobile.shared.BusinessRuleException;
import com.parcautomobile.situation.api.SituationVehiculeDtos.SituationVehiculeResponse;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

@Component
public class SituationExcelMapper {
    static final String[] ENTETES = {
            "N°", "MATRICULE", "MARQUE", "TYPE", "GENRE", "N° DE VIN", "CARBURANT",
            "PUISSANCE FISCALE", "POIDS TOTAL EN CHARGE", "DATE DE MISE EN CIRCULATION",
            "AFFECTATION", "CONDUCTEUR", "KILOMÉTRAGE", "OBSERVATION"
    };
    private static final int LIMITE_LIGNES = 5_000;
    private static final DateTimeFormatter DATE_FR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final DataFormatter formatter = new DataFormatter(Locale.FRANCE);

    public byte[] exporter(List<SituationVehiculeResponse> lignes) {
        try (Workbook classeur = new XSSFWorkbook();
             ByteArrayOutputStream sortie = new ByteArrayOutputStream()) {
            Sheet feuille = classeur.createSheet("SITUATION PARC AUTO");
            CellStyle entete = styleEntete(classeur);
            Row ligneEntete = feuille.createRow(0);
            for (int index = 0; index < ENTETES.length; index++) {
                Cell cellule = ligneEntete.createCell(index);
                cellule.setCellValue(ENTETES[index]);
                cellule.setCellStyle(entete);
            }
            int indexLigne = 1;
            for (SituationVehiculeResponse ligne : lignes) {
                Row row = feuille.createRow(indexLigne++);
                écrire(row, 0, ligne.numero());
                écrire(row, 1, ligne.immatriculation());
                écrire(row, 2, ligne.marque());
                écrire(row, 3, ligne.type());
                écrire(row, 4, ligne.genre() == null ? null : ligne.genre().name());
                écrire(row, 5, ligne.vin());
                écrire(row, 6, ligne.carburant() == null ? null : ligne.carburant().name());
                écrire(row, 7, ligne.puissanceFiscale());
                écrire(row, 8, ligne.poidsTotalCharge());
                écrire(row, 9, ligne.dateMiseEnCirculation() == null
                        ? null : ligne.dateMiseEnCirculation().format(DATE_FR));
                écrire(row, 10, ligne.affectation());
                écrire(row, 11, ligne.conducteur());
                écrire(row, 12, ligne.kilometrage());
                écrire(row, 13, ligne.observation() == null ? null : ligne.observation().name());
            }
            for (int index = 0; index < ENTETES.length; index++) {
                feuille.autoSizeColumn(index);
                feuille.setColumnWidth(index, Math.min(feuille.getColumnWidth(index) + 700, 12_000));
            }
            feuille.createFreezePane(0, 1);
            classeur.write(sortie);
            return sortie.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de générer le fichier Excel.", exception);
        }
    }

    public List<LigneImport> lire(InputStream contenu) {
        try (Workbook classeur = new XSSFWorkbook(contenu)) {
            Sheet feuille = classeur.getSheetAt(0);
            int indexEntete = trouverEntete(feuille);
            Map<String, Integer> colonnes = colonnes(feuille.getRow(indexEntete));
            List<LigneImport> lignes = new ArrayList<>();
            for (int index = indexEntete + 1; index <= feuille.getLastRowNum(); index++) {
                if (lignes.size() >= LIMITE_LIGNES) {
                    throw new BusinessRuleException("Le fichier ne doit pas dépasser 5 000 lignes de données.");
                }
                Row row = feuille.getRow(index);
                if (row == null || ligneVide(row)) continue;
                lignes.add(new LigneImport(
                        index + 1,
                        texte(row, colonnes, "MATRICULE"),
                        texte(row, colonnes, "MARQUE"),
                        texte(row, colonnes, "TYPE"),
                        texte(row, colonnes, "GENRE"),
                        texte(row, colonnes, "N DE VIN"),
                        texte(row, colonnes, "CARBURANT"),
                        entier(row, colonnes, "PUISSANCE FISCALE"),
                        decimal(row, colonnes, "POIDS TOTAL EN CHARGE"),
                        date(row, colonnes, "DATE DE MISE EN CIRCULATION"),
                        entierLong(row, colonnes, "KILOMETRAGE"),
                        texte(row, colonnes, "OBSERVATION")));
            }
            return lignes;
        } catch (BusinessRuleException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessRuleException(
                    "Le fichier Excel est illisible ou ne respecte pas le format SIT.xlsx.",
                    exception);
        }
    }

    private int trouverEntete(Sheet feuille) {
        for (int index = feuille.getFirstRowNum(); index <= feuille.getLastRowNum(); index++) {
            Row row = feuille.getRow(index);
            if (row != null) {
                for (Cell cellule : row) {
                    if ("MATRICULE".equals(clé(formatter.formatCellValue(cellule)))) return index;
                }
            }
        }
        throw new BusinessRuleException(
                "Format non reconnu : aucune colonne « MATRICULE » n’a été trouvée.");
    }

    private Map<String, Integer> colonnes(Row entete) {
        Map<String, Integer> résultat = new HashMap<>();
        for (Cell cellule : entete) {
            résultat.put(clé(formatter.formatCellValue(cellule)), cellule.getColumnIndex());
        }
        return résultat;
    }

    private String texte(Row row, Map<String, Integer> colonnes, String nom) {
        Integer index = colonnes.get(nom);
        if (index == null) return null;
        Cell cellule = row.getCell(index);
        if (cellule == null) return null;
        String valeur = formatter.formatCellValue(cellule).trim();
        return valeur.isBlank() ? null : valeur;
    }

    private Integer entier(Row row, Map<String, Integer> colonnes, String nom) {
        Long valeur = entierLong(row, colonnes, nom);
        return valeur == null || valeur > Integer.MAX_VALUE ? null : valeur.intValue();
    }

    private Long entierLong(Row row, Map<String, Integer> colonnes, String nom) {
        String valeur = texte(row, colonnes, nom);
        if (valeur == null) return null;
        try {
            return new BigDecimal(valeur.replace(" ", "").replace(',', '.')).longValueExact();
        } catch (ArithmeticException | NumberFormatException exception) {
            return null;
        }
    }

    private BigDecimal decimal(Row row, Map<String, Integer> colonnes, String nom) {
        String valeur = texte(row, colonnes, nom);
        if (valeur == null) return null;
        try {
            return new BigDecimal(valeur.replace(" ", "").replace(',', '.'));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private LocalDate date(Row row, Map<String, Integer> colonnes, String nom) {
        Integer index = colonnes.get(nom);
        if (index == null) return null;
        Cell cellule = row.getCell(index);
        if (cellule == null) return null;
        if (cellule.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cellule)) {
            return cellule.getDateCellValue().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDate();
        }
        String valeur = formatter.formatCellValue(cellule).trim();
        if (valeur.isBlank()) return null;
        for (DateTimeFormatter format : List.of(
                DATE_FR, DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("d/M/yyyy"))) {
            try {
                return LocalDate.parse(valeur, format);
            } catch (DateTimeParseException ignored) {
                // Essai du format suivant.
            }
        }
        return null;
    }

    private boolean ligneVide(Row row) {
        for (Cell cellule : row) {
            if (!formatter.formatCellValue(cellule).isBlank()) return false;
        }
        return true;
    }

    private String clé(String valeur) {
        return Normalizer.normalize(valeur == null ? "" : valeur, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", " ")
                .trim();
    }

    private CellStyle styleEntete(Workbook classeur) {
        CellStyle style = classeur.createCellStyle();
        style.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font police = classeur.createFont();
        police.setBold(true);
        police.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(police);
        return style;
    }

    private void écrire(Row row, int colonne, Object valeur) {
        if (valeur == null) return;
        Cell cellule = row.createCell(colonne);
        if (valeur instanceof Number nombre) cellule.setCellValue(nombre.doubleValue());
        else cellule.setCellValue(String.valueOf(valeur));
    }

    public record LigneImport(
            int numeroLigne,
            String immatriculation,
            String marque,
            String type,
            String genre,
            String vin,
            String carburant,
            Integer puissanceFiscale,
            BigDecimal poidsTotalCharge,
            LocalDate dateMiseEnCirculation,
            Long kilometrage,
            String observation) {}
}
