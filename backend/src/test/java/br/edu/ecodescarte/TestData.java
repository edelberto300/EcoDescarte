package br.edu.ecodescarte;

import br.edu.ecodescarte.collectionpoint.CollectionPoint;
import br.edu.ecodescarte.shared.Address;
import br.edu.ecodescarte.shared.MaterialType;
import java.util.List;

public final class TestData {

    private TestData() {
    }

    public static CollectionPoint point(String id) {
        return new CollectionPoint(id, "Eco Ponto Central", "Coleta municipal",
                new Address("Avenida Brasil", "1000", "Centro", "Maringá", "PR", "87000-000"),
                List.of(MaterialType.BATTERY, MaterialType.GLASS), "08:00 - 18:00");
    }
}
