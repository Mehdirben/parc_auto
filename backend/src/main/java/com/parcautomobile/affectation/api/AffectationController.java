package com.parcautomobile.affectation.api;

import static com.parcautomobile.affectation.api.AffectationDtos.*;

import java.net.URI;
import java.util.UUID;

import jakarta.validation.Valid;
import com.parcautomobile.affectation.domain.StatutAffectation;
import com.parcautomobile.affectation.domain.FiltreOrdreMission;
import com.parcautomobile.affectation.service.AffectationService;
import com.parcautomobile.shared.PageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/affectations")
public class AffectationController {
    private final AffectationService service;

    public AffectationController(AffectationService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<AffectationResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) StatutAffectation statut,
            @RequestParam(required = false) FiltreOrdreMission filtreOrdre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return service.rechercher(search, statut, filtreOrdre,
                Math.max(page, 0), Math.min(Math.max(taille, 1), 100));
    }

    @GetMapping("/options")
    OptionsResponse options() {
        return service.options();
    }

    @GetMapping("/{id}")
    AffectationDetailResponse consulter(@PathVariable UUID id) {
        return service.consulter(id);
    }

    @PostMapping
    ResponseEntity<AffectationDetailResponse> creer(
            @Valid @RequestBody CreerAffectationRequest request) {
        AffectationDetailResponse resultat = service.creer(request);
        return ResponseEntity.created(URI.create(
                "/api/v1/affectations/" + resultat.affectation().id())).body(resultat);
    }

    @PostMapping("/{id}/changement")
    AffectationDetailResponse changer(
            @PathVariable UUID id, @Valid @RequestBody ChangerAffectationRequest request) {
        return service.changer(id, request);
    }

    @PostMapping("/{id}/restitution")
    AffectationDetailResponse restituer(
            @PathVariable UUID id, @Valid @RequestBody RestituerAffectationRequest request) {
        return service.restituer(id, request);
    }
}
