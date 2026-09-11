package br.edu.ecodescarte.disposal;

import static br.edu.ecodescarte.TestData.point;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import br.edu.ecodescarte.collectionpoint.CollectionPointService;
import br.edu.ecodescarte.exception.BusinessException;
import br.edu.ecodescarte.exception.ResourceNotFoundException;
import br.edu.ecodescarte.shared.DisposalUnit;
import br.edu.ecodescarte.shared.MaterialType;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DisposalServiceTest {

    @Mock
    private DisposalRepository repository;

    @Mock
    private CollectionPointService collectionPointService;

    private DisposalService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-09-11T10:00:00.123456789Z"), ZoneOffset.UTC);
        service = new DisposalService(repository, collectionPointService, clock);
    }

    @Test
    void registersAcceptedMaterialAndAssignsPointAndCurrentDate() {
        when(collectionPointService.findById("point-1")).thenReturn(point("point-1"));
        when(repository.insert(any(Disposal.class))).thenAnswer(invocation -> invocation.getArgument(0));
        DisposalRequest request = new DisposalRequest(MaterialType.BATTERY, BigDecimal.TEN, DisposalUnit.UNITS, null);

        Disposal result = service.create("point-1", request);

        assertNull(result.id());
        assertEquals("point-1", result.collectionPointId());
        assertEquals(MaterialType.BATTERY, result.materialType());
        assertEquals(BigDecimal.TEN, result.quantity());
        assertEquals(DisposalUnit.UNITS, result.unit());
        assertEquals(LocalDateTime.of(2026, 9, 11, 10, 0, 0, 123000000), result.disposalDate());
        verify(repository).insert(result);
    }

    @Test
    void preservesExplicitDateAtMongoPrecisionAndFractionalQuantity() {
        when(collectionPointService.findById("point-1")).thenReturn(point("point-1"));
        LocalDateTime date = LocalDateTime.of(2026, 9, 10, 14, 30, 0, 987654321);
        DisposalRequest request = new DisposalRequest(MaterialType.GLASS, new BigDecimal("0.25"), DisposalUnit.KG, date);

        service.create("point-1", request);

        ArgumentCaptor<Disposal> captor = ArgumentCaptor.forClass(Disposal.class);
        verify(repository).insert(captor.capture());
        assertEquals(LocalDateTime.of(2026, 9, 10, 14, 30, 0, 987000000), captor.getValue().disposalDate());
        assertEquals(new BigDecimal("0.25"), captor.getValue().quantity());
        assertEquals(DisposalUnit.KG, captor.getValue().unit());
    }

    @Test
    void rejectsUnacceptedMaterialWithoutSaving() {
        when(collectionPointService.findById("point-1")).thenReturn(point("point-1"));
        DisposalRequest request = new DisposalRequest(MaterialType.MEDICINE, BigDecimal.ONE, DisposalUnit.UNITS, null);

        assertThrows(BusinessException.class, () -> service.create("point-1", request));
        verifyNoInteractions(repository);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"0", "-1", "-0.01"})
    void rejectsInvalidQuantityWithoutSaving(String quantity) {
        when(collectionPointService.findById("point-1")).thenReturn(point("point-1"));
        BigDecimal value = quantity == null ? null : new BigDecimal(quantity);
        DisposalRequest request = new DisposalRequest(MaterialType.BATTERY, value, DisposalUnit.UNITS, null);

        assertThrows(BusinessException.class, () -> service.create("point-1", request));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsMissingPointWhenRegistering() {
        when(collectionPointService.findById("missing")).thenThrow(new ResourceNotFoundException("Ponto não encontrado."));
        DisposalRequest request = new DisposalRequest(MaterialType.BATTERY, BigDecimal.ONE, DisposalUnit.UNITS, null);

        assertThrows(ResourceNotFoundException.class, () -> service.create("missing", request));
        verifyNoInteractions(repository);
    }

    @Test
    void listsOnlyDisposalsFromRequestedPoint() {
        Disposal disposal = new Disposal("disposal-1", "point-1", MaterialType.GLASS, BigDecimal.ONE,
                DisposalUnit.KG, LocalDateTime.of(2026, 9, 11, 10, 0));
        when(repository.findByCollectionPointIdOrderByDisposalDateDesc("point-1")).thenReturn(List.of(disposal));

        assertEquals(List.of(disposal), service.findByCollectionPointId("point-1"));
        verify(collectionPointService).findById("point-1");
    }

    @Test
    void returnsEmptyListForPointWithNoDisposals() {
        when(repository.findByCollectionPointIdOrderByDisposalDateDesc("point-1")).thenReturn(List.of());

        assertEquals(List.of(), service.findByCollectionPointId("point-1"));
        verify(collectionPointService).findById("point-1");
    }

    @Test
    void rejectsMissingPointWhenListingDisposals() {
        when(collectionPointService.findById("missing")).thenThrow(new ResourceNotFoundException("Ponto não encontrado."));

        assertThrows(ResourceNotFoundException.class, () -> service.findByCollectionPointId("missing"));
        verifyNoInteractions(repository);
    }

    @Test
    void deletesDisposalBelongingToRequestedPoint() {
        Disposal disposal = new Disposal("disposal-1", "point-1", MaterialType.GLASS, BigDecimal.ONE,
                DisposalUnit.KG, LocalDateTime.of(2026, 9, 11, 10, 0));
        when(collectionPointService.findById("point-1")).thenReturn(point("point-1"));
        when(repository.findByIdAndCollectionPointId("disposal-1", "point-1")).thenReturn(Optional.of(disposal));

        service.delete("point-1", "disposal-1");

        verify(repository).delete(disposal);
    }

    @Test
    void rejectsDisposalFromAnotherPoint() {
        when(collectionPointService.findById("point-1")).thenReturn(point("point-1"));
        when(repository.findByIdAndCollectionPointId("disposal-2", "point-1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete("point-1", "disposal-2"));
    }

    @Test
    void doesNotSearchDisposalWhenPointDoesNotExist() {
        when(collectionPointService.findById("missing")).thenThrow(new ResourceNotFoundException("Ponto não encontrado."));

        assertThrows(ResourceNotFoundException.class, () -> service.delete("missing", "disposal-1"));
        verifyNoInteractions(repository);
    }
}
