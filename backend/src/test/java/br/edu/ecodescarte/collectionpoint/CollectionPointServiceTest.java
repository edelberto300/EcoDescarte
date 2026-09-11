package br.edu.ecodescarte.collectionpoint;

import static br.edu.ecodescarte.TestData.point;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import br.edu.ecodescarte.disposal.DisposalRepository;
import br.edu.ecodescarte.exception.BusinessException;
import br.edu.ecodescarte.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class CollectionPointServiceTest {

    @Mock
    private CollectionPointRepository repository;

    @Mock
    private DisposalRepository disposalRepository;

    @InjectMocks
    private CollectionPointService service;

    @Test
    void createsPointWithServerGeneratedIdentityAndPreservesFields() {
        CollectionPoint input = point("client-supplied-id");
        when(repository.insert(any(CollectionPoint.class))).thenReturn(point("generated-id"));

        CollectionPoint result = service.create(input);

        ArgumentCaptor<CollectionPoint> captor = ArgumentCaptor.forClass(CollectionPoint.class);
        verify(repository).insert(captor.capture());
        assertNull(captor.getValue().id());
        assertEquals(point(null), captor.getValue());
        assertEquals("generated-id", result.id());
    }

    @Test
    void listsPointsOrderedByName() {
        when(repository.findAll(Sort.by("name").ascending())).thenReturn(List.of(point("point-1")));

        assertEquals(List.of(point("point-1")), service.findAll());
    }

    @Test
    void returnsEmptyListWhenThereAreNoPoints() {
        when(repository.findAll(Sort.by("name").ascending())).thenReturn(List.of());

        assertEquals(List.of(), service.findAll());
    }

    @Test
    void findsExistingPoint() {
        when(repository.findById("point-1")).thenReturn(Optional.of(point("point-1")));

        assertEquals(point("point-1"), service.findById("point-1"));
    }

    @Test
    void rejectsMissingPoint() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById("missing"));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = " ")
    void requiresPointId(String id) {
        assertThrows(BusinessException.class, () -> service.findById(id));
        verifyNoInteractions(repository);
    }

    @Test
    void deletesPointAndItsDisposals() {
        CollectionPoint existingPoint = point("point-1");
        when(repository.findById("point-1")).thenReturn(Optional.of(existingPoint));

        service.delete("point-1");

        verify(disposalRepository).deleteByCollectionPointId("point-1");
        verify(repository).delete(existingPoint);
    }

    @Test
    void doesNotDeleteDisposalsWhenPointDoesNotExist() {
        when(repository.findById("missing")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete("missing"));
        verifyNoInteractions(disposalRepository);
    }
}
