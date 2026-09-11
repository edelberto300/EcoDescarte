package br.edu.ecodescarte.collectionpoint;

import br.edu.ecodescarte.shared.Address;
import br.edu.ecodescarte.shared.MaterialType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "collection_points")
public record CollectionPoint(
        @Id @JsonProperty(access = JsonProperty.Access.READ_ONLY) String id,
        @NotBlank(message = "Informe o nome.") String name,
        String description,
        @Valid @NotNull(message = "Informe o endereço.") Address address,
        @NotEmpty(message = "Selecione pelo menos um material.")
        List<@NotNull(message = "Material inválido.") MaterialType> acceptedMaterials,
        @NotBlank(message = "Informe o horário de funcionamento.") String openingHours) {
}
