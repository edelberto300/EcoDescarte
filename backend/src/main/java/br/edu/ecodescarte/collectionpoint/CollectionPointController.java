package br.edu.ecodescarte.collectionpoint;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/collection-points")
public class CollectionPointController {

    private final CollectionPointService service;

    public CollectionPointController(CollectionPointService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CollectionPoint> create(@Valid @RequestBody CollectionPoint point) {
        CollectionPoint created = service.create(point);
        return ResponseEntity.created(URI.create("/api/collection-points/" + created.id())).body(created);
    }

    @GetMapping
    public List<CollectionPoint> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CollectionPoint findById(@PathVariable String id) {
        return service.findById(id);
    }
}
