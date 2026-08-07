package com.parcautomobile.conducteur.api;

import static com.parcautomobile.conducteur.api.ConducteurDtos.*;

import java.net.URI;

import jakarta.validation.Valid;
import com.parcautomobile.conducteur.domain.FiltrePermis;
import com.parcautomobile.conducteur.service.ConducteurService;
import com.parcautomobile.shared.PageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conducteurs")
public class ConducteurController {
    private final ConducteurService service;

    public ConducteurController(ConducteurService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<ConducteurListeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Boolean actif,
            @RequestParam(required = false) FiltrePermis permis,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return service.rechercher(
                search, actif, permis, Math.max(page, 0), Math.min(Math.max(taille, 1), 100));
    }

    @GetMapping("/statistiques")
    ConducteurStatistiquesResponse statistiques() {
        return service.statistiques();
    }

    @GetMapping("/{matricule}")
    ConducteurDetailResponse consulter(@PathVariable String matricule) {
        return service.consulter(matricule);
    }

    @PostMapping
    ResponseEntity<ConducteurDetailResponse> créer(
            @Valid @RequestBody EnregistrerConducteurRequest request) {
        ConducteurDetailResponse créé = service.créer(request);
        return ResponseEntity.created(
                URI.create("/api/v1/conducteurs/" + créé.matricule())).body(créé);
    }

    @PutMapping("/{matricule}")
    ConducteurDetailResponse modifier(
            @PathVariable String matricule,
            @Valid @RequestBody EnregistrerConducteurRequest request) {
        return service.modifier(matricule, request);
    }

    @PutMapping("/{matricule}/statut")
    ConducteurDetailResponse changerStatut(
            @PathVariable String matricule,
            @Valid @RequestBody ChangerStatutRequest request) {
        return service.changerStatut(matricule, request);
    }
}
