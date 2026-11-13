package br.edu.ecodescarte.collectionpoint;

import br.edu.ecodescarte.disposal.DisposalRepository;
import br.edu.ecodescarte.exception.BusinessException;
import br.edu.ecodescarte.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class CollectionPointService {

    private final CollectionPointRepository repository;
    private final DisposalRepository disposalRepository;
    private final MongoTemplate mongoTemplate;

    public CollectionPointService(CollectionPointRepository repository, DisposalRepository disposalRepository,
            MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.disposalRepository = disposalRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public CollectionPoint create(CollectionPoint point) {
        CollectionPoint newPoint = new CollectionPoint(null, point.name(), point.description(),
                point.address(), List.copyOf(point.acceptedMaterials()), point.openingHours());
        return repository.insert(newPoint);
    }

    public CollectionPoint update(String id, CollectionPoint point) {

        if (id == null || id.isBlank()) {
            throw new BusinessException("Informe o ponto de coleta.");
        }

        Update update = new Update()
                .set("name", point.name())
                .set("description", point.description())
                .set("address", point.address())
                .set("acceptedMaterials", List.copyOf(point.acceptedMaterials()))
                .set("openingHours", point.openingHours());
        // shortcut: a última edição prevalece; adotar versão otimista antes do uso multiusuário.
        CollectionPoint updated = mongoTemplate.findAndModify(Query.query(Criteria.where("id").is(id)),
                update, FindAndModifyOptions.options().returnNew(true), CollectionPoint.class);

        if (updated == null) {
            throw new ResourceNotFoundException("Ponto de coleta não encontrado.");
        }

        return updated;
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
