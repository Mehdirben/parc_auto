package ma.gov.mesrsi.parcautomobile.referentiel.api;

import static ma.gov.mesrsi.parcautomobile.referentiel.api.ServiceParcDtos.*;

import java.net.URI;

import jakarta.validation.Valid;
import ma.gov.mesrsi.parcautomobile.referentiel.domain.TypeServiceParc;
import ma.gov.mesrsi.parcautomobile.referentiel.service.ServiceParcService;
import ma.gov.mesrsi.parcautomobile.shared.PageResponse;
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
@RequestMapping("/api/v1/services-parcs")
public class ServiceParcController {
    private final ServiceParcService service;

    public ServiceParcController(ServiceParcService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<ServiceParcListeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) TypeServiceParc type,
            @RequestParam(required = false) Boolean actif,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return service.rechercher(search, type, actif, Math.max(page, 0), Math.min(Math.max(taille, 1), 100));
    }

    @GetMapping("/statistiques")
    ServiceParcStatistiquesResponse statistiques() {
        return service.statistiques();
    }

    @GetMapping("/{code}")
    ServiceParcDetailResponse consulter(@PathVariable String code) {
        return service.consulter(code);
    }

    @PostMapping
    ResponseEntity<ServiceParcDetailResponse> créer(@Valid @RequestBody CreerServiceParcRequest request) {
        ServiceParcDetailResponse créé = service.créer(request);
        return ResponseEntity.created(URI.create("/api/v1/services-parcs/" + créé.code())).body(créé);
    }

    @PutMapping("/{code}")
    ServiceParcDetailResponse modifier(@PathVariable String code,
                                       @Valid @RequestBody ModifierServiceParcRequest request) {
        return service.modifier(code, request);
    }

    @PutMapping("/{code}/statut")
    ServiceParcDetailResponse changerStatut(@PathVariable String code,
                                            @Valid @RequestBody ChangerStatutRequest request) {
        return service.changerStatut(code, request);
    }
}
