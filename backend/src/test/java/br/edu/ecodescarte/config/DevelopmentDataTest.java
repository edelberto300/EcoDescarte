package br.edu.ecodescarte.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import br.edu.ecodescarte.collectionpoint.CollectionPoint;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

@ExtendWith(MockitoExtension.class)
class DevelopmentDataTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private DevelopmentData developmentData;

    @Test
    void usesStableIdsAndAtomicInsertOnlyUpdatesAcrossRestarts() {
        developmentData.run();
        developmentData.run();

        ArgumentCaptor<Query> queries = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<Update> updates = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate, times(6)).upsert(queries.capture(), updates.capture(), eq(CollectionPoint.class));
        List<String> ids = queries.getAllValues().stream()
                .map(query -> query.getQueryObject().getString("id")).toList();
        assertEquals(List.of("demo-central", "demo-zona-sul", "demo-farmacia"), ids.subList(0, 3));
        assertEquals(ids.subList(0, 3), ids.subList(3, 6));

        for (Update update : updates.getAllValues()) {
            Document document = update.getUpdateObject();
            assertEquals(1, document.size());
            assertFalse(document.containsKey("$set"));
            assertEquals(5, document.get("$setOnInsert", Document.class).size());
        }
    }
}
