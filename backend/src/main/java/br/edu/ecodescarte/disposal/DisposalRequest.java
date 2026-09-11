package br.edu.ecodescarte.disposal;

import br.edu.ecodescarte.shared.DisposalUnit;
import br.edu.ecodescarte.shared.MaterialType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DisposalRequest(
        @NotNull(message = "Informe o material.") MaterialType materialType,
        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.") BigDecimal quantity,
        @NotNull(message = "Informe a unidade.") DisposalUnit unit,
        LocalDateTime disposalDate) {
}
