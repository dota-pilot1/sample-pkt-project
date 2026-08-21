package com.cj.mesprototype.playbook.infrastructure;

import com.cj.mesprototype.playbook.domain.PlaybookDocumentComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaybookDocumentCommentRepository extends JpaRepository<PlaybookDocumentComment, Long> {
    List<PlaybookDocumentComment> findAllByDocumentIdOrderByCreatedAtAscIdAsc(Long documentId);
}
