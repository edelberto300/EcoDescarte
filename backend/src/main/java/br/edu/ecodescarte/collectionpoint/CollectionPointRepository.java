package br.edu.ecodescarte.collectionpoint;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CollectionPointRepository extends MongoRepository<CollectionPoint, String> {
}
