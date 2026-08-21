package com.cj.mesprototype.kiosk.infrastructure;

import com.cj.mesprototype.kiosk.domain.KioskSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface KioskSessionRepository extends JpaRepository<KioskSession, String> {
    long countByStartedAtBetween(Instant from, Instant to);

    /** 환자가 종료 버튼을 누르지 않고 자리를 뜬 세션을 정리한다. */
    @Modifying(clearAutomatically = true)
    @Query("update KioskSession s set s.status = 'EXPIRED' where s.status = 'ACTIVE' and s.lastActivityAt < :cutoff")
    int expireIdleSessions(@Param("cutoff") Instant cutoff);

    @Modifying(clearAutomatically = true)
    @Query("delete from KioskSession s where s.startedAt < :cutoff")
    int deleteStartedBefore(@Param("cutoff") Instant cutoff);
}
