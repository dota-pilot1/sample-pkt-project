package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.LotProcessHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LotProcessHistoryRepository extends JpaRepository<LotProcessHistory, Long> {
    boolean existsByLotId(Long lotId);
    List<LotProcessHistory> findAllByLotIdOrderByStartedAtAsc(Long lotId);
}
