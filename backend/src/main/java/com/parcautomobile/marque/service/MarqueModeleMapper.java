package com.parcautomobile.marque.service;

import static com.parcautomobile.marque.api.MarqueDtos.MarqueDetailResponse;
import static com.parcautomobile.modele.api.ModeleDtos.ModeleResponse;

import java.util.List;
import java.util.Map;

import com.parcautomobile.marque.domain.Marque;
import com.parcautomobile.modele.domain.Modele;
import com.parcautomobile.shared.audit.AuditDtos.EvenementAuditResponse;

public final class MarqueModeleMapper {
    private MarqueModeleMapper() {}

    public static MarqueDetailResponse versDetail(Marque marque, List<EvenementAuditResponse> historique) {
        return new MarqueDetailResponse(
                marque.getCode(),
                marque.getDesignation(),
                marque.getModeles().stream().map(MarqueModeleMapper::versModele).toList(),
                historique,
                marque.getDateCreation(),
                marque.getCreePar(),
                marque.getDateModification(),
                marque.getModifiePar());
    }

    public static ModeleResponse versModele(Modele modele) {
        return new ModeleResponse(modele.getId(), modele.getNom());
    }

    public static Map<String, ?> valeursModele(Modele modele) {
        return Map.of(
                "nom", modele.getNom(),
                "marqueCode", modele.getMarque().getCode());
    }
}
