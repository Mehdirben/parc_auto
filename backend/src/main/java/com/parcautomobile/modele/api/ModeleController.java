package com.parcautomobile.modele.api;

import static com.parcautomobile.marque.api.MarqueDtos.MarqueDetailResponse;
import static com.parcautomobile.modele.api.ModeleDtos.*;

import java.util.UUID;

import jakarta.validation.Valid;
import com.parcautomobile.modele.service.ModeleService;
import com.parcautomobile.shared.PageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ModeleController {
    private final ModeleService service;

    public ModeleController(ModeleService service) {
        this.service = service;
    }

    @GetMapping("/modeles")
    PageResponse<ModeleListeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return service.rechercher(
                search,
                Math.max(page, 0),
                Math.min(Math.max(taille, 1), 100));
    }

    @GetMapping("/modeles/{id}")
    ModeleDetailResponse consulter(@PathVariable UUID id) {
        return service.consulter(id);
    }

    @PostMapping("/marques/{code}/modeles")
    MarqueDetailResponse ajouter(@PathVariable String code,
                                 @Valid @RequestBody AjouterModelesRequest request) {
        return service.ajouter(code, request);
    }

    @PutMapping("/modeles/{id}")
    ModeleResponse modifier(@PathVariable UUID id,
                            @Valid @RequestBody ModifierModeleRequest request) {
        return service.modifier(id, request);
    }

    @DeleteMapping("/modeles/{id}")
    ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
