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
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 판매 가능한 요금제와 카테고리 관계를 표현하는 Entity다.
 */
@Entity
@Getter
// JPA가 리플렉션으로 Entity를 생성할 때 사용하는 기본 생성자다.
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "rate_plans")
public class RatePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // category_id 외래키로 요금제를 하나의 카테고리에 연결한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private RatePlanCategory category;

    @Column(name = "rate_plan_code", nullable = false, unique = true, length = 50)
    private String ratePlanCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "monthly_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "sales_status", nullable = false, length = 20)
    private RatePlanSalesStatus salesStatus;

    @Column(name = "sale_start_at", nullable = false)
    private OffsetDateTime saleStartAt;

    @Column(name = "sale_end_at")
    private OffsetDateTime saleEndAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    // 동시에 수정된 경우를 감지하는 낙관적 락 버전이다.
    @Version
    private Long version;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * 필수값을 모두 받은 정상 상태의 요금제를 만든다.
     */
    public static RatePlan create(
        RatePlanCategory category,
        String ratePlanCode,
        String name,
        BigDecimal monthlyFee,
        RatePlanSalesStatus salesStatus,
        OffsetDateTime saleStartAt,
        String description,
        OffsetDateTime now
    ) {
        RatePlan ratePlan = new RatePlan();
        ratePlan.category = category;
        ratePlan.ratePlanCode = ratePlanCode;
        ratePlan.name = name;
        ratePlan.monthlyFee = monthlyFee;
        ratePlan.salesStatus = salesStatus;
        ratePlan.saleStartAt = saleStartAt;
        ratePlan.description = description;
        ratePlan.createdAt = now;
        ratePlan.updatedAt = now;
        return ratePlan;
    }

}
