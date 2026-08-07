package com.parcautomobile.shared.text;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class ListeTextes {
    private ListeTextes() {}

    public static List<String> dédupliquer(List<String> valeurs) {
        if (valeurs == null) return List.of();
        Map<String, String> uniques = new LinkedHashMap<>();
        valeurs.stream()
                .filter(valeur -> valeur != null && !valeur.isBlank())
                .flatMap(valeur -> List.of(valeur.split(";")).stream())
                .map(TexteNormalise::affichage)
                .forEach(valeur -> uniques.putIfAbsent(TexteNormalise.cle(valeur), valeur));
        return new ArrayList<>(uniques.values());
    }
}
