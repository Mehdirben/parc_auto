package com.parcautomobile.situation.api;

import static com.parcautomobile.situation.api.SituationVehiculeDtos.*;

import java.nio.charset.StandardCharsets;

import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.situation.service.SituationVehiculeService;
import com.parcautomobile.vehicule.domain.Carburant;
import com.parcautomobile.vehicule.domain.GenreVehicule;
import com.parcautomobile.vehicule.domain.StatutVehicule;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/situation-vehicules")
public class SituationVehiculeController {
    private static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    private final SituationVehiculeService service;

    public SituationVehiculeController(SituationVehiculeService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<SituationVehiculeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) StatutVehicule statut,
            @RequestParam(required = false) GenreVehicule genre,
            @RequestParam(required = false) Carburant carburant,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int taille) {
        return service.rechercher(search, statut, genre, carburant,
                Math.max(page, 0), Math.min(Math.max(taille, 1), 100));
    }

    @GetMapping("/export")
    ResponseEntity<ByteArrayResource> exporter(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) StatutVehicule statut,
            @RequestParam(required = false) GenreVehicule genre,
            @RequestParam(required = false) Carburant carburant) {
        return fichierExcel(service.exporter(search, statut, genre, carburant));
    }

    @GetMapping("/import/modele")
    ResponseEntity<ByteArrayResource> téléchargerModèleImport() {
        return fichierExcel(service.modèleImportVide());
    }

    private ResponseEntity<ByteArrayResource> fichierExcel(byte[] contenu) {
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename("SIT.xlsx", StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(XLSX)
                .contentLength(contenu.length)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new ByteArrayResource(contenu));
    }

    @PostMapping(path = "/import/apercu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApercuImportResponse prévisualiser(@RequestPart MultipartFile fichier) {
        return service.prévisualiser(fichier);
    }

    @PostMapping(path = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResultatImportResponse importer(@RequestPart MultipartFile fichier) {
        return service.importer(fichier);
    }
}
