package com.parcautomobile.vehicule.api;

import static com.parcautomobile.vehicule.api.VehiculeDtos.*;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import jakarta.validation.Valid;
import com.parcautomobile.shared.PageResponse;
import com.parcautomobile.vehicule.domain.*;
import com.parcautomobile.vehicule.service.VehiculeService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/vehicules")
public class VehiculeController {
    private final VehiculeService service;

    public VehiculeController(VehiculeService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<VehiculeListeResponse> rechercher(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) StatutVehicule statut,
            @RequestParam(required = false) GenreVehicule genre,
            @RequestParam(required = false) Carburant carburant,
            @RequestParam(defaultValue = "") String marque,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return service.rechercher(search, statut, genre, carburant, marque,
                Math.max(page, 0), Math.min(Math.max(taille, 1), 100));
    }

    @GetMapping("/statistiques")
    VehiculeStatistiquesResponse statistiques() {
        return service.statistiques();
    }

    @GetMapping("/{code}")
    VehiculeDetailResponse consulter(@PathVariable String code) {
        return service.consulter(code);
    }

    @PostMapping
    ResponseEntity<VehiculeDetailResponse> créer(@Valid @RequestBody CreerVehiculeRequest request) {
        VehiculeDetailResponse créé = service.créer(request);
        return ResponseEntity.created(URI.create("/api/v1/vehicules/" + créé.code())).body(créé);
    }

    @PutMapping("/{code}/situation")
    VehiculeDetailResponse modifierSituation(
            @PathVariable String code,
            @Valid @RequestBody ModifierSituationRequest request) {
        return service.modifierSituation(code, request);
    }

    @PostMapping("/{code}/releves-kilometriques")
    VehiculeDetailResponse ajouterReleve(
            @PathVariable String code,
            @Valid @RequestBody AjouterReleveRequest request) {
        return service.ajouterReleve(code, request);
    }

    @PostMapping(path = "/{code}/pieces-jointes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    VehiculeDetailResponse ajouterPiece(
            @PathVariable String code,
            @RequestParam TypePieceJointe typePiece,
            @RequestPart MultipartFile fichier) {
        return service.ajouterPiece(code, typePiece, fichier);
    }

    @GetMapping("/{code}/pieces-jointes/{pieceId}")
    ResponseEntity<ByteArrayResource> téléchargerPiece(
            @PathVariable String code, @PathVariable UUID pieceId) {
        PieceJointeVehicule piece = service.téléchargerPiece(code, pieceId);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(piece.getNomFichier(), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(piece.getTypeContenu()))
                .contentLength(piece.getTaille())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new ByteArrayResource(piece.getContenu()));
    }

    @DeleteMapping("/{code}/pieces-jointes/{pieceId}")
    ResponseEntity<Void> supprimerPiece(
            @PathVariable String code, @PathVariable UUID pieceId) {
        service.supprimerPiece(code, pieceId);
        return ResponseEntity.noContent().build();
    }
}
