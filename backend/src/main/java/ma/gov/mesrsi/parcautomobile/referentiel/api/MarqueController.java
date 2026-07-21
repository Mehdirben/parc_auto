package ma.gov.mesrsi.parcautomobile.referentiel.api;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.MarqueDtos.*;

import java.net.URI;
import java.util.UUID;

import jakarta.validation.Valid;
import ma.gov.mesrsi.parcautomobile.referentiel.service.MarqueService;
import ma.gov.mesrsi.parcautomobile.shared.PageResponse;
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
public class MarqueController {
    private final MarqueService service;

    public MarqueController(MarqueService service) {
        this.service = service;
    }

    @GetMapping("/marques")
    PageResponse<MarqueListeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        int tailleLimitée = Math.min(Math.max(taille, 1), 100);
        return service.rechercher(search, Math.max(page, 0), tailleLimitée);
    }

    @GetMapping("/marques/statistiques")
    MarqueStatistiquesResponse statistiques() {
        return service.statistiques();
    }

    @GetMapping("/marques/{code}")
    MarqueDetailResponse consulter(@PathVariable String code) {
        return service.consulter(code);
    }

    @PostMapping("/marques")
    ResponseEntity<MarqueDetailResponse> créer(@Valid @RequestBody CreerMarqueRequest request) {
        MarqueDetailResponse créée = service.créer(request);
        return ResponseEntity.created(URI.create("/api/v1/marques/" + créée.code())).body(créée);
    }

    @PutMapping("/marques/{code}")
    MarqueDetailResponse modifier(@PathVariable String code,
                                  @Valid @RequestBody ModifierMarqueRequest request) {
        return service.modifier(code, request);
    }

    @DeleteMapping("/marques/{code}")
    ResponseEntity<Void> supprimer(@PathVariable String code) {
        service.supprimer(code);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/marques/{code}/modeles")
    MarqueDetailResponse ajouterModèles(@PathVariable String code,
                                        @Valid @RequestBody AjouterModelesRequest request) {
        return service.ajouterModèles(code, request);
    }

    @PutMapping("/modeles/{id}")
    ModeleResponse modifierModèle(@PathVariable UUID id,
                                  @Valid @RequestBody ModifierModeleRequest request) {
        return service.modifierModèle(id, request);
    }

    @DeleteMapping("/modeles/{id}")
    ResponseEntity<Void> supprimerModèle(@PathVariable UUID id) {
        service.supprimerModèle(id);
        return ResponseEntity.noContent().build();
    }
}
