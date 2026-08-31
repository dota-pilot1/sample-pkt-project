package com.cj.mesprototype.playbook.infrastructure;

import com.cj.mesprototype.playbook.domain.PlaybookDocumentComment;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlaybookDocumentCommentRepository extends JpaRepository<PlaybookDocumentComment, Long> {
    List<PlaybookDocumentComment> findAllByDocumentIdOrderByCreatedAtAscIdAsc(Long documentId);

    @Modifying
    @Query("delete from PlaybookDocumentComment c where c.document.id in :documentIds")
    void deleteAllByDocumentIds(@Param("documentIds") List<Long> documentIds);
}
