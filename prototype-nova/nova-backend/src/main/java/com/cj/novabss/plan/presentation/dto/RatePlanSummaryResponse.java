package com.cj.novabss.plan.presentation.dto;

import com.cj.novabss.plan.domain.RatePlan;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 요금제 목록에서 사용하는 요약 응답 DTO다.
 */
public record RatePlanSummaryResponse(
    Long id,
    String ratePlanCode,
    String name,
    String categoryCode,
    String categoryName,
    BigDecimal monthlyFee,
    RatePlanSalesStatus salesStatus,
    OffsetDateTime updatedAt
) {
    public static RatePlanSummaryResponse from(RatePlan ratePlan) {
        return new RatePlanSummaryResponse(
            ratePlan.getId(),
            ratePlan.getRatePlanCode(),
            ratePlan.getName(),
            ratePlan.getCategory().getCode(),
            ratePlan.getCategory().getName(),
            ratePlan.getMonthlyFee(),
            ratePlan.getSalesStatus(),
            ratePlan.getUpdatedAt()
        );
    }
}
