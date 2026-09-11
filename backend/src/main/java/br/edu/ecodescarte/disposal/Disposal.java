package br.edu.ecodescarte.disposal;

import br.edu.ecodescarte.shared.DisposalUnit;
import br.edu.ecodescarte.shared.MaterialType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Document(collection = "disposals")
public record Disposal(
        @Id String id,
        @Indexed String collectionPointId,
        MaterialType materialType,
        @Field(targetType = FieldType.DECIMAL128) BigDecimal quantity,
        DisposalUnit unit,
        LocalDateTime disposalDate) {
}
