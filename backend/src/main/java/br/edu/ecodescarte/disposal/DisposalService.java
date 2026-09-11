package br.edu.ecodescarte.disposal;

import br.edu.ecodescarte.collectionpoint.CollectionPoint;
import br.edu.ecodescarte.collectionpoint.CollectionPointService;
import br.edu.ecodescarte.exception.BusinessException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DisposalService {

    private final DisposalRepository repository;
    private final CollectionPointService collectionPointService;
    private final Clock clock;

    public DisposalService(DisposalRepository repository, CollectionPointService collectionPointService,
            Clock clock) {
        this.repository = repository;
        this.collectionPointService = collectionPointService;
        this.clock = clock;
    }

    public Disposal create(String collectionPointId, DisposalRequest request) {
        CollectionPoint point = collectionPointService.findById(collectionPointId);

        if (request.quantity() == null || request.quantity().signum() <= 0) {
            throw new BusinessException("A quantidade deve ser maior que zero.");
        }

        if (!point.acceptedMaterials().contains(request.materialType())) {
            throw new BusinessException("Este material não é aceito pelo ponto de coleta.");
        }

        LocalDateTime date = request.disposalDate() == null
                ? LocalDateTime.now(clock) : request.disposalDate();
        Disposal disposal = new Disposal(null, point.id(), request.materialType(), request.quantity(),
                request.unit(), date.truncatedTo(ChronoUnit.MILLIS));
        return repository.insert(disposal);
    }

    public List<Disposal> findByCollectionPointId(String collectionPointId) {
        collectionPointService.findById(collectionPointId);
        return repository.findByCollectionPointIdOrderByDisposalDateDesc(collectionPointId);
    }
}
