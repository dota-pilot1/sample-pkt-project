package com.cj.mesprototype.playbook.infrastructure;

import com.cj.mesprototype.playbook.domain.PlaybookTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaybookTopicRepository extends JpaRepository<PlaybookTopic, Long> {
    List<PlaybookTopic> findAllByCategoryIdOrderByOrderIdxAscIdAsc(Long categoryId);
}
