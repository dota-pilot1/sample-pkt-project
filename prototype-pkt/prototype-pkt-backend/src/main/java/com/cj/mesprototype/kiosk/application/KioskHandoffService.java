package com.cj.mesprototype.kiosk.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.kiosk.domain.KioskHandoff;
import com.cj.mesprototype.kiosk.domain.KioskMessage;
import com.cj.mesprototype.kiosk.infrastructure.KioskHandoffRepository;
import com.cj.mesprototype.kiosk.infrastructure.KioskMessageRepository;
import com.cj.mesprototype.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 직원 연결(handoff) 요청. 환자 쪽은 인증 없이 요청만 만들고,
 * 접수·완료는 직원 JWT 로만 할 수 있다(경로가 /api/kiosk/manage 라 기본 인증 대상이다).
 */
@Service
@RequiredArgsConstructor
public class KioskHandoffService {

    private final KioskHandoffRepository handoffs;
    private final KioskMessageRepository messages;
    private final UserRepository users;

    /** 환자용. 같은 세션에 이미 대기 중인 요청이 있으면 새로 만들지 않고 그대로 돌려준다. */
    @Transactional
    public Response request(String sessionId, String reason) {
        Optional<KioskHandoff> pending = sessionId == null
                ? Optional.empty()
                : handoffs.findFirstBySessionIdAndStatusOrderByRequestedAtDesc(sessionId, KioskHandoff.PENDING);
        if (pending.isPresent()) return Response.from(pending.get(), null);

        KioskHandoff saved = handoffs.save(KioskHandoff.request(sessionId, reason, lastQuestion(sessionId)));
        return Response.from(saved, null);
    }

    /** 직원용 목록. 기본은 처리해야 할 것(대기·접수 중)만 본다. */
    @Transactional(readOnly = true)
    public List<Response> list(boolean includeCompleted) {
        List<KioskHandoff> rows = includeCompleted
                ? handoffs.findByStatusOrderByRequestedAtDesc(KioskHandoff.COMPLETED)
                : handoffs.findByStatusInOrderByRequestedAtAsc(List.of(KioskHandoff.PENDING, KioskHandoff.ACCEPTED));
        Map<Long, String> names = acceptorNames(rows);
        return rows.stream().map(row -> Response.from(row, names.get(row.getAcceptedBy()))).toList();
    }

    @Transactional
    public Response accept(Long id, Long userId) {
        KioskHandoff handoff = handoffs.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.HANDOFF_NOT_FOUND));
        handoff.accept(userId);
        return Response.from(handoff, acceptorNames(List.of(handoff)).get(userId));
    }

    @Transactional
    public Response complete(Long id) {
        KioskHandoff handoff = handoffs.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.HANDOFF_NOT_FOUND));
        handoff.complete();
        return Response.from(handoff, acceptorNames(List.of(handoff)).get(handoff.getAcceptedBy()));
    }

    /** 요청 직전 환자 질문. 직원이 목록만 보고도 무슨 일인지 알 수 있게 붙인다. */
    private String lastQuestion(String sessionId) {
        if (sessionId == null) return null;
        return messages.findFirstBySession_IdAndSenderOrderByCreatedAtDesc(sessionId, "PATIENT")
                .map(KioskMessage::getContent)
                .orElse(null);
    }

    private Map<Long, String> acceptorNames(List<KioskHandoff> rows) {
        List<Long> ids = rows.stream().map(KioskHandoff::getAcceptedBy).filter(java.util.Objects::nonNull).distinct().toList();
        // HashMap 을 쓴다 — Map.of() 는 아직 접수되지 않은 건의 get(null) 에서 NPE 를 던진다.
        Map<Long, String> names = new HashMap<>();
        if (ids.isEmpty()) return names;
        users.findAllById(ids).forEach(user -> names.put(user.getId(), user.getUsername()));
        return names;
    }

    public record Response(
            Long id,
            String sessionId,
            String status,
            String reason,
            String lastQuestion,
            Instant requestedAt,
            Long acceptedBy,
            String acceptedByName,
            Instant acceptedAt,
            Instant completedAt
    ) {
        static Response from(KioskHandoff h, String acceptedByName) {
            return new Response(h.getId(), h.getSessionId(), h.getStatus(), h.getReason(), h.getLastQuestion(),
                    h.getRequestedAt(), h.getAcceptedBy(), acceptedByName, h.getAcceptedAt(), h.getCompletedAt());
        }
    }
}
