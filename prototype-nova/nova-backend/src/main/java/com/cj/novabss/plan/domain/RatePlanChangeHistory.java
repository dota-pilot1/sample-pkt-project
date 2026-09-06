package com.cj.novabss.plan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 요금제 변경 전후 상태와 변경 주체를 기록하는 이력 Entity다.
 */
@Entity
@Getter
// JPA가 리플렉션으로 Entity를 생성할 때 사용하는 기본 생성자다.
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "rate_plan_change_histories")
public class RatePlanChangeHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // rate_plan_id 외래키로 어떤 요금제가 변경됐는지 연결한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_plan_id", nullable = false)
    private RatePlan ratePlan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RatePlanChangeAction action;

    @Column(name = "before_snapshot", columnDefinition = "TEXT")
    private String beforeSnapshot;

    @Column(name = "after_snapshot", columnDefinition = "TEXT")
    private String afterSnapshot;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private OffsetDateTime changedAt;

}
