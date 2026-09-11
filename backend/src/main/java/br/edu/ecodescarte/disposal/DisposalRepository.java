package br.edu.ecodescarte.disposal;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DisposalRepository extends MongoRepository<Disposal, String> {

    List<Disposal> findByCollectionPointIdOrderByDisposalDateDesc(String collectionPointId);
}
