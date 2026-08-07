package com.parcautomobile.marque.api;

import static com.parcautomobile.marque.api.MarqueDtos.*;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;
import com.parcautomobile.marque.service.MarqueService;
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
@RequestMapping("/api/v1/marques")
public class MarqueController {
    private final MarqueService service;

    public MarqueController(MarqueService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<MarqueListeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        int tailleLimitée = Math.min(Math.max(taille, 1), 100);
        return service.rechercher(search, Math.max(page, 0), tailleLimitée);
    }

    @GetMapping("/statistiques")
    MarqueStatistiquesResponse statistiques() {
        return service.statistiques();
    }

    @GetMapping("/options")
    List<MarqueOptionResponse> listerMarques() {
        return service.listerMarques();
    }

    @GetMapping("/{code}")
    MarqueDetailResponse consulter(@PathVariable String code) {
        return service.consulter(code);
    }

    @PostMapping
    ResponseEntity<MarqueDetailResponse> créer(@Valid @RequestBody CreerMarqueRequest request) {
        MarqueDetailResponse créée = service.créer(request);
        return ResponseEntity.created(URI.create("/api/v1/marques/" + créée.code())).body(créée);
    }

    @PutMapping("/{code}")
    MarqueDetailResponse modifier(@PathVariable String code,
                                  @Valid @RequestBody ModifierMarqueRequest request) {
        return service.modifier(code, request);
    }

    @DeleteMapping("/{code}")
    ResponseEntity<Void> supprimer(@PathVariable String code) {
        service.supprimer(code);
        return ResponseEntity.noContent().build();
    }

}
