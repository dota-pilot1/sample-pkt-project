package com.cj.mesprototype.playbook.infrastructure;

import com.cj.mesprototype.playbook.domain.PlaybookDocument;
import com.cj.mesprototype.playbook.domain.PlaybookDocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PlaybookDocumentRepository extends JpaRepository<PlaybookDocument, Long> {
    List<PlaybookDocument> findAllByTopicIdOrderByOrderIdxAscIdAsc(Long topicId);

    /** 챗봇 지식 검색 경로. 승인되고 사용이 허용된 문서만 대상으로 한다. */
    List<PlaybookDocument> findAllByStatusAndUseForChatbotTrue(PlaybookDocumentStatus status);

    /** 검색은 본문이 PostgreSQL text 컬럼이므로 DB별 lower/like 차이를 피하고 서비스에서 필터링한다. */
    @Query("""
            select d from PlaybookDocument d
            join fetch d.topic t
            join fetch t.category c
            order by d.updatedAt desc, d.id desc
            """)
    List<PlaybookDocument> findAllForSearch();

    Optional<PlaybookDocument> findByShareToken(String shareToken);

    Optional<PlaybookDocument> findByAiEditTokenHash(String aiEditTokenHash);
}
