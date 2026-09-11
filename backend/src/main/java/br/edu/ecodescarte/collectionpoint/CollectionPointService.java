package br.edu.ecodescarte.collectionpoint;

import br.edu.ecodescarte.disposal.DisposalRepository;
import br.edu.ecodescarte.exception.BusinessException;
import br.edu.ecodescarte.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class CollectionPointService {

    private final CollectionPointRepository repository;
    private final DisposalRepository disposalRepository;

    public CollectionPointService(CollectionPointRepository repository, DisposalRepository disposalRepository) {
        this.repository = repository;
        this.disposalRepository = disposalRepository;
    }

    public CollectionPoint create(CollectionPoint point) {
        CollectionPoint newPoint = new CollectionPoint(null, point.name(), point.description(),
                point.address(), List.copyOf(point.acceptedMaterials()), point.openingHours());
        return repository.insert(newPoint);
    }

    public List<CollectionPoint> findAll() {
        return repository.findAll(Sort.by("name").ascending());
    }

    public CollectionPoint findById(String id) {

        if (id == null || id.isBlank()) {
            throw new BusinessException("Informe o ponto de coleta.");
        }

        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ponto de coleta não encontrado."));
    }

    public void delete(String id) {
        CollectionPoint point = findById(id);

        disposalRepository.deleteByCollectionPointId(id);
        repository.delete(point);
    }
}
