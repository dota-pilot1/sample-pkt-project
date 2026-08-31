package com.cj.mesprototype.playbook.infrastructure;

import com.cj.mesprototype.playbook.domain.PlaybookCategory;
import com.cj.mesprototype.playbook.domain.PlaybookDomain;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaybookCategoryRepository extends JpaRepository<PlaybookCategory, Long> {
    @EntityGraph(attributePaths = {"topics"})
    List<PlaybookCategory> findAllByOrderByOrderIdxAscIdAsc();

    @EntityGraph(attributePaths = {"topics"})
    List<PlaybookCategory> findAllBySpaceIdOrderByOrderIdxAscIdAsc(Long spaceId);
}
