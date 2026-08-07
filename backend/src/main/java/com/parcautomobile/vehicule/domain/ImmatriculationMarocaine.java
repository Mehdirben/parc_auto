package com.parcautomobile.vehicule.domain;

import java.util.regex.Pattern;

public final class ImmatriculationMarocaine {
    public static final String FORMAT =
            "(?:[0-9]{1,8}|[0-9]{1,5}-[A-Za-z]-[0-9]{1,2})";
    private static final Pattern MOTIF = Pattern.compile(FORMAT);

    private ImmatriculationMarocaine() {}

    public static boolean estValide(String valeur) {
        return valeur != null && MOTIF.matcher(valeur.trim()).matches();
    }
}
