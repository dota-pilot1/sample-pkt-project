package com.cj.mesprototype.kiosk.application;

import com.cj.mesprototype.kiosk.domain.KioskHandoff;
import com.cj.mesprototype.kiosk.infrastructure.KioskHandoffRepository;
import com.cj.mesprototype.kiosk.infrastructure.KioskMessageRepository;
import com.cj.mesprototype.kiosk.infrastructure.KioskSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * 직원 콘솔 홈에 띄우는 오늘 지표.
 * "지금 뭘 해야 하는지"로 이어지는 숫자만 둔다 — 대기 중인 호출, 답하지 못한 질문.
 */
@Service
@RequiredArgsConstructor
public class KioskAnalyticsService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final int UNANSWERED_LIMIT = 5;
    private static final int UNANSWERED_DAYS = 14;

    private final KioskSessionRepository sessions;
    private final KioskMessageRepository messages;
    private final KioskHandoffRepository handoffs;

    @Transactional(readOnly = true)
    public Summary summary() {
        Instant from = LocalDate.now(SEOUL).atStartOfDay(SEOUL).toInstant();
        Instant to = Instant.now();

        long todaySessions = sessions.countByStartedAtBetween(from, to);
        long todayQuestions = messages.countBySenderAndCreatedAtBetween("PATIENT", from, to);
        long todayUnanswered = messages.countBySenderAndIntentAndCreatedAtBetween("PATIENT", "UNKNOWN", from, to);

        long pendingHandoffs = handoffs.countByStatus(KioskHandoff.PENDING);
        long todayHandoffs = handoffs.countByRequestedAtBetween(from, to);

        Instant unansweredFrom = LocalDate.now(SEOUL).minusDays(UNANSWERED_DAYS).atStartOfDay(SEOUL).toInstant();
        List<UnansweredQuestion> topUnanswered = messages.findUnansweredSince(unansweredFrom).stream()
                .limit(UNANSWERED_LIMIT)
                .map(row -> new UnansweredQuestion(row.getQuestion(), row.getCount()))
                .toList();

        return new Summary(
                todaySessions,
                todayQuestions,
                todayUnanswered,
                answeredRate(todayQuestions, todayUnanswered),
                pendingHandoffs,
                todayHandoffs,
                UNANSWERED_DAYS,
                topUnanswered
        );
    }

    /** 질문이 없는 시간대에 0%로 보이면 오해를 부르므로, 질문이 없으면 비율을 주지 않는다. */
    private static Double answeredRate(long questions, long unanswered) {
        if (questions == 0) return null;
        return Math.round((questions - unanswered) * 1000.0 / questions) / 10.0;
    }

    public record Summary(
            long todaySessions,
            long todayQuestions,
            long todayUnanswered,
            Double answeredRate,
            long pendingHandoffs,
            long todayHandoffs,
            int unansweredWindowDays,
            List<UnansweredQuestion> topUnanswered
    ) {}

    public record UnansweredQuestion(String question, long count) {}
}
