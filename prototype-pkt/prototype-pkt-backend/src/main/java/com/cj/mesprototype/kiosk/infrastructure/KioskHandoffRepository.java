package com.cj.mesprototype.kiosk.infrastructure;

import com.cj.mesprototype.kiosk.domain.KioskHandoff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface KioskHandoffRepository extends JpaRepository<KioskHandoff, Long> {
    /** 대기·접수 건은 오래된 순으로 먼저 처리한다. */
    List<KioskHandoff> findByStatusInOrderByRequestedAtAsc(Collection<String> statuses);
    List<KioskHandoff> findByStatusOrderByRequestedAtDesc(String status);
    long countByStatus(String status);
    long countByRequestedAtBetween(java.time.Instant from, java.time.Instant to);
    /** 같은 세션에서 연달아 누른 요청을 새 건으로 쌓지 않기 위한 조회. */
    Optional<KioskHandoff> findFirstBySessionIdAndStatusOrderByRequestedAtDesc(String sessionId, String status);
}
