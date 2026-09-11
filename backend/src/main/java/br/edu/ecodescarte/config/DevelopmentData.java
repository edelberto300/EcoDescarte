package br.edu.ecodescarte.config;

import br.edu.ecodescarte.collectionpoint.CollectionPoint;
import br.edu.ecodescarte.shared.Address;
import br.edu.ecodescarte.shared.MaterialType;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevelopmentData implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    public DevelopmentData(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        List<CollectionPoint> points = List.of(
                new CollectionPoint("demo-central", "Eco Ponto Central", "Ponto municipal de coleta. Dados fictícios para demonstração.",
                        new Address("Avenida Brasil", "1000", "Centro", "Maringá", "PR", "87000-000"),
                        List.of(MaterialType.BATTERY, MaterialType.ELECTRONICS, MaterialType.GLASS), "08:00 - 18:00"),
                new CollectionPoint("demo-zona-sul", "Ponto Verde Zona Sul", "Coleta de resíduos domésticos. Dados fictícios para demonstração.",
                        new Address("Rua das Palmeiras", "250", "Zona Sul", "Maringá", "PR", "87005-000"),
                        List.of(MaterialType.COOKING_OIL, MaterialType.GLASS, MaterialType.LIGHT_BULB), "09:00 - 17:00"),
                new CollectionPoint("demo-farmacia", "Farmácia Descarte Seguro", "Descarte de medicamentos e pilhas. Dados fictícios para demonstração.",
                        new Address("Rua Santos Dumont", "500", "Centro", "Maringá", "PR", "87010-000"),
                        List.of(MaterialType.MEDICINE, MaterialType.BATTERY), "08:00 - 20:00"));

        for (CollectionPoint point : points) {
            Query query = Query.query(Criteria.where("id").is(point.id()));
            Update update = new Update()
                    .setOnInsert("name", point.name())
                    .setOnInsert("description", point.description())
                    .setOnInsert("address", point.address())
                    .setOnInsert("acceptedMaterials", point.acceptedMaterials())
                    .setOnInsert("openingHours", point.openingHours());
            mongoTemplate.upsert(query, update, CollectionPoint.class);
        }
    }
}
