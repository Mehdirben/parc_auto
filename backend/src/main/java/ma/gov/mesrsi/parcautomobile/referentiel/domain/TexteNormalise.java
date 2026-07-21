package ma.gov.mesrsi.parcautomobile.referentiel.domain;

import java.text.Normalizer;
import java.util.Locale;

public final class TexteNormalise {
    private TexteNormalise() {}

    public static String affichage(String valeur) {
        return valeur == null ? null : valeur.trim().replaceAll("\\s+", " ");
    }

    public static String cle(String valeur) {
        String affichage = affichage(valeur);
        return affichage == null ? null : Normalizer.normalize(affichage, Normalizer.Form.NFKC)
                .toUpperCase(Locale.ROOT);
    }
}
