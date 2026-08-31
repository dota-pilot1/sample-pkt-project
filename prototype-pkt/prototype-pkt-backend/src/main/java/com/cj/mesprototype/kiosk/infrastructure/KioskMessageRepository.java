package com.cj.mesprototype.kiosk.infrastructure;

import com.cj.mesprototype.kiosk.domain.KioskMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface KioskMessageRepository extends JpaRepository<KioskMessage, Long> {

    /** 직원 연결 요청에 붙일 "요청 직전 환자 질문". */
    Optional<KioskMessage> findFirstBySession_IdAndSenderOrderByCreatedAtDesc(String sessionId, String sender);

    long countBySenderAndCreatedAtBetween(String sender, Instant from, Instant to);

    long countBySenderAndIntentAndCreatedAtBetween(String sender, String intent, Instant from, Instant to);

    /**
     * 챗봇이 답하지 못한 질문을 같은 문구끼리 묶어 많이 나온 순으로 준다.
     * 노트에 무슨 문서를 추가해야 하는지 알려주는 목록이라 원문 그대로 집계한다.
     */
    @Query("""
            select m.content as question, count(m) as count
            from KioskMessage m
            where m.sender = 'PATIENT' and m.intent = 'UNKNOWN' and m.createdAt >= :from
            group by m.content
            order by count(m) desc, max(m.createdAt) desc
            """)
    List<UnansweredRow> findUnansweredSince(@Param("from") Instant from);

    /**
     * 보관 기간이 지난 세션의 대화를 지운다. DB 에 ON DELETE CASCADE 가 있지만,
     * 세션 삭제 전에 명시적으로 지워 삭제 건수를 로그로 남긴다.
     */
    @Modifying(clearAutomatically = true)
    @Query("delete from KioskMessage m where m.session.id in (select s.id from KioskSession s where s.startedAt < :cutoff)")
    int deleteBySessionStartedBefore(@Param("cutoff") Instant cutoff);

    interface UnansweredRow {
        String getQuestion();
        long getCount();
    }
}
