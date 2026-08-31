package com.cj.mesprototype.kiosk.domain;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 직원 연결 요청. 환자가 키오스크에서 "직원 호출"을 누르면 PENDING 으로 쌓이고,
 * 접수 직원이 콘솔에서 접수(ACCEPTED)한 뒤 처리 완료(COMPLETED)로 닫는다.
 */
@Entity
@Table(name = "kiosk_handoffs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KioskHandoff {

    public static final String PENDING = "PENDING";
    public static final String ACCEPTED = "ACCEPTED";
    public static final String COMPLETED = "COMPLETED";

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 세션이 삭제돼도 요청 기록은 남기므로 연관관계 대신 식별자만 들고 있는다. */
    @Column(name = "session_id", length = 36)
    private String sessionId;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 500)
    private String reason;

    /** 직원이 맥락을 알 수 있도록 요청 직전 환자 질문을 함께 남긴다. */
    @Column(name = "last_question", length = 500)
    private String lastQuestion;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "accepted_by")
    private Long acceptedBy;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    private KioskHandoff(String sessionId, String reason, String lastQuestion) {
        this.sessionId = sessionId;
        this.reason = reason;
        this.lastQuestion = lastQuestion;
        this.status = PENDING;
        this.requestedAt = Instant.now();
    }

    public static KioskHandoff request(String sessionId, String reason, String lastQuestion) {
        return new KioskHandoff(sessionId, reason, lastQuestion);
    }

    public void accept(Long userId) {
        if (!PENDING.equals(status)) throw new BusinessException(ErrorCode.HANDOFF_ALREADY_HANDLED);
        this.status = ACCEPTED;
        this.acceptedBy = userId;
        this.acceptedAt = Instant.now();
    }

    public void complete() {
        if (COMPLETED.equals(status)) throw new BusinessException(ErrorCode.HANDOFF_ALREADY_HANDLED);
        this.status = COMPLETED;
        this.completedAt = Instant.now();
    }
}
