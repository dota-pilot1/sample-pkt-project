package com.cj.mesprototype.playbook.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.playbook.domain.PlaybookDocument;
import com.cj.mesprototype.playbook.infrastructure.PlaybookCategoryRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookDocumentCommentRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookDocumentRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookSpaceRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookTopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlaybookServiceTests {

    private PlaybookDocumentRepository documentRepository;
    private PlaybookService service;

    @BeforeEach
    void setUp() {
        documentRepository = mock(PlaybookDocumentRepository.class);
        service = new PlaybookService(
                mock(PlaybookCategoryRepository.class),
                mock(PlaybookSpaceRepository.class),
                mock(PlaybookTopicRepository.class),
                documentRepository,
                mock(PlaybookDocumentCommentRepository.class));
    }

    @Test
    void ownerlessDocumentCanBeSharedByAuthenticatedUser() {
        PlaybookDocument document = PlaybookDocument.of(null, null, "샘플 문서", 0, null);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));

        PlaybookService.ShareResponse response = service.shareDocument(1L, 42L, false);

        assertNotNull(response.token());
        assertEquals(32, response.token().length());
    }

    @Test
    void documentOwnedByAnotherUserCannotBeShared() {
        PlaybookDocument document = PlaybookDocument.of(null, null, "사용자 문서", 0, 7L);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));

        assertThrows(BusinessException.class, () -> service.shareDocument(1L, 42L, false));
    }
}
