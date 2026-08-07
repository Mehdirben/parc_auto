package com.parcautomobile.ordremission.api;

import static com.parcautomobile.ordremission.api.OrdreMissionDtos.OrdreMissionResponse;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import com.parcautomobile.ordremission.service.OrdreMissionDocumentRenderer;
import com.parcautomobile.ordremission.service.OrdreMissionService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ordres-mission")
public class OrdreMissionController {
    private final OrdreMissionService service;
    private final OrdreMissionDocumentRenderer renderer;

    public OrdreMissionController(
            OrdreMissionService service, OrdreMissionDocumentRenderer renderer) {
        this.service = service;
        this.renderer = renderer;
    }

    @PostMapping("/affectations/{affectationId}")
    OrdreMissionResponse obtenirPourAffectation(@PathVariable UUID affectationId) {
        return service.obtenirPourAffectation(affectationId);
    }

    @GetMapping("/{id}")
    OrdreMissionResponse consulter(@PathVariable UUID id) {
        return service.consulter(id);
    }

    @GetMapping(value = "/{id}/document", produces = MediaType.APPLICATION_PDF_VALUE)
    ResponseEntity<byte[]> telecharger(@PathVariable UUID id) {
        OrdreMissionResponse ordre = service.telecharger(id);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(ordre.numero() + ".pdf", StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(renderer.render(ordre));
    }
}
