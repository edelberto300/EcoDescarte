package br.edu.ecodescarte.disposal;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DisposalRepository extends MongoRepository<Disposal, String> {

    List<Disposal> findByCollectionPointIdOrderByDisposalDateDesc(String collectionPointId);

    Optional<Disposal> findByIdAndCollectionPointId(String id, String collectionPointId);

    void deleteByCollectionPointId(String collectionPointId);
}
