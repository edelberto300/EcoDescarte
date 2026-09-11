package br.edu.ecodescarte.disposal;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/collection-points/{id}/disposals")
public class DisposalController {

    private final DisposalService service;

    public DisposalController(DisposalService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Disposal create(@PathVariable String id, @Valid @RequestBody DisposalRequest request) {
        return service.create(id, request);
    }

    @GetMapping
    public List<Disposal> findAll(@PathVariable String id) {
        return service.findByCollectionPointId(id);
    }
}
