package br.edu.ecodescarte;

import static br.edu.ecodescarte.TestData.point;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ecodescarte.collectionpoint.CollectionPoint;
import br.edu.ecodescarte.collectionpoint.CollectionPointController;
import br.edu.ecodescarte.collectionpoint.CollectionPointRepository;
import br.edu.ecodescarte.collectionpoint.CollectionPointService;
import br.edu.ecodescarte.config.WebConfig;
import br.edu.ecodescarte.disposal.Disposal;
import br.edu.ecodescarte.disposal.DisposalController;
import br.edu.ecodescarte.disposal.DisposalRepository;
import br.edu.ecodescarte.disposal.DisposalService;
import br.edu.ecodescarte.shared.DisposalUnit;
import br.edu.ecodescarte.shared.MaterialType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({CollectionPointController.class, DisposalController.class})
@Import({CollectionPointService.class, DisposalService.class, WebConfig.class})
class ApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockitoBean
    private CollectionPointRepository points;

    @MockitoBean
    private DisposalRepository disposals;

    @Test
    void createsPointReturning201AndLocation() throws Exception {
        when(points.insert(any(CollectionPoint.class))).thenReturn(point("point-1"));

        mvc.perform(post("/api/collection-points").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(point(null))))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/collection-points/point-1"))
                .andExpect(jsonPath("$.id").value("point-1"))
                .andExpect(jsonPath("$.address.city").value("Maringá"))
                .andExpect(jsonPath("$.acceptedMaterials[0]").value("BATTERY"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"name", "openingHours"})
    void rejectsBlankPointFields(String field) throws Exception {
        ObjectNode body = mapper.valueToTree(point(null));
        body.put(field, " ");

        mvc.perform(post("/api/collection-points").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['" + field + "']").exists());
        verifyNoInteractions(points);
    }

    @ParameterizedTest
    @ValueSource(strings = {"street", "number", "neighborhood", "city", "state", "zipCode"})
    void validatesNestedAddress(String field) throws Exception {
        ObjectNode body = mapper.valueToTree(point(null));
        ((ObjectNode) body.get("address")).put(field, " ");

        mvc.perform(post("/api/collection-points").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['address." + field + "']").exists());
        verifyNoInteractions(points);
    }

    @ParameterizedTest
    @ValueSource(strings = {"address", "acceptedMaterials"})
    void rejectsMissingComplexPointFields(String field) throws Exception {
        ObjectNode body = mapper.valueToTree(point(null));
        body.remove(field);

        mvc.perform(post("/api/collection-points").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['" + field + "']").exists());
        verifyNoInteractions(points);
    }

    @ParameterizedTest
    @ValueSource(strings = {"[]", "[null]", "[\"INVALID\"]"})
    void rejectsInvalidMaterialList(String materials) throws Exception {
        ObjectNode body = mapper.valueToTree(point(null));
        body.set("acceptedMaterials", mapper.readTree(materials));

        mvc.perform(post("/api/collection-points").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(points);
    }

    @Test
    void listsPoints() throws Exception {
        when(points.findAll(any(Sort.class))).thenReturn(List.of(point("point-1")));

        mvc.perform(get("/api/collection-points"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Eco Ponto Central"));
    }

    @Test
    void showsPointDetails() throws Exception {
        when(points.findById("point-1")).thenReturn(Optional.of(point("point-1")));

        mvc.perform(get("/api/collection-points/point-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address.street").value("Avenida Brasil"))
                .andExpect(jsonPath("$.openingHours").value("08:00 - 18:00"));
    }

    @Test
    void returns404ForMissingPoint() throws Exception {
        mvc.perform(get("/api/collection-points/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ponto de coleta não encontrado."));
    }

    @Test
    void registersDisposalUsingUrlIdAndAutomaticDate() throws Exception {
        when(points.findById("point-1")).thenReturn(Optional.of(point("point-1")));
        when(disposals.insert(any(Disposal.class))).thenAnswer(invocation -> {
            Disposal value = invocation.getArgument(0);
            return new Disposal("disposal-1", value.collectionPointId(), value.materialType(), value.quantity(),
                    value.unit(), value.disposalDate());
        });

        mvc.perform(post("/api/collection-points/point-1/disposals").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"collectionPointId":"another-point","id":"client-id",
                                 "materialType":"BATTERY","quantity":10,"unit":"UNITS"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("disposal-1"))
                .andExpect(jsonPath("$.collectionPointId").value("point-1"))
                .andExpect(jsonPath("$.disposalDate").isString())
                .andExpect(jsonPath("$.quantity").value(10));
    }

    @Test
    void returns400ForUnacceptedMaterialWithoutSaving() throws Exception {
        when(points.findById("point-1")).thenReturn(Optional.of(point("point-1")));

        mvc.perform(post("/api/collection-points/point-1/disposals").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materialType\":\"MEDICINE\",\"quantity\":1,\"unit\":\"UNITS\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Este material não é aceito pelo ponto de coleta."));
        verifyNoInteractions(disposals);
    }

    @Test
    void returns404WhenRegisteringAtMissingPoint() throws Exception {
        mvc.perform(post("/api/collection-points/missing/disposals").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materialType\":\"BATTERY\",\"quantity\":1,\"unit\":\"UNITS\"}"))
                .andExpect(status().isNotFound());
        verifyNoInteractions(disposals);
    }

    @ParameterizedTest
    @ValueSource(strings = {"materialType", "quantity", "unit"})
    void requiresDisposalFields(String field) throws Exception {
        ObjectNode body = (ObjectNode) mapper.readTree("{\"materialType\":\"BATTERY\",\"quantity\":1,\"unit\":\"UNITS\"}");
        body.remove(field);

        mvc.perform(post("/api/collection-points/point-1/disposals").contentType(MediaType.APPLICATION_JSON)
                        .content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['" + field + "']").exists());
        verifyNoInteractions(points, disposals);
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1", "-0.01"})
    void rejectsNonPositiveQuantity(String quantity) throws Exception {
        mvc.perform(post("/api/collection-points/point-1/disposals").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"materialType\":\"BATTERY\",\"quantity\":" + quantity + ",\"unit\":\"UNITS\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.quantity").exists());
        verifyNoInteractions(points, disposals);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{broken",
            "{\"materialType\":\"UNKNOWN\",\"quantity\":1,\"unit\":\"UNITS\"}",
            "{\"materialType\":\"BATTERY\",\"quantity\":1,\"unit\":\"UNKNOWN\"}",
            "{\"materialType\":\"BATTERY\",\"quantity\":\"invalid\",\"unit\":\"UNITS\"}",
            "{\"materialType\":\"BATTERY\",\"quantity\":1,\"unit\":\"UNITS\",\"disposalDate\":\"invalid\"}"
    })
    void rejectsMalformedJsonAndInvalidTypes(String body) throws Exception {
        mvc.perform(post("/api/collection-points/point-1/disposals").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        verifyNoInteractions(points, disposals);
    }

    @Test
    void listsDisposalsForPoint() throws Exception {
        when(points.findById("point-1")).thenReturn(Optional.of(point("point-1")));
        when(disposals.findByCollectionPointIdOrderByDisposalDateDesc("point-1"))
                .thenReturn(List.of(new Disposal("disposal-1", "point-1", MaterialType.GLASS, new BigDecimal("0.25"),
                        DisposalUnit.KG, LocalDateTime.of(2026, 9, 11, 10, 0))));

        mvc.perform(get("/api/collection-points/point-1/disposals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].materialType").value("GLASS"))
                .andExpect(jsonPath("$[0].quantity").value(0.25))
                .andExpect(jsonPath("$[0].disposalDate").value("2026-09-11T10:00:00"));
    }

    @Test
    void returns404WhenListingDisposalsForMissingPoint() throws Exception {
        mvc.perform(get("/api/collection-points/missing/disposals"))
                .andExpect(status().isNotFound());
        verifyNoInteractions(disposals);
    }

    @Test
    void allowsFrontendCorsPreflight() throws Exception {
        mvc.perform(options("/api/collection-points")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }

    @Test
    void doesNotAllowUnconfiguredCorsOrigin() throws Exception {
        mvc.perform(options("/api/collection-points")
                        .header("Origin", "http://example.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    void returns503WithoutExposingDatabaseDetails() throws Exception {
        when(points.findAll(any(Sort.class))).thenThrow(new DataAccessResourceFailureException("private connection details"));

        mvc.perform(get("/api/collection-points"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("Banco de dados indisponível. Tente novamente mais tarde."));
    }
}
