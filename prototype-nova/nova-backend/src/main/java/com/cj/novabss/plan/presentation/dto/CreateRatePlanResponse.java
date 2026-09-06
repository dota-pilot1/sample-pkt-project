package com.cj.novabss.plan.presentation.dto;

import com.cj.novabss.plan.domain.RatePlan;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** 새로 생성된 요금제의 식별·초기 판매 상태를 반환한다. */
public record CreateRatePlanResponse(
    Long id,
    String ratePlanCode,
    String name,
    String categoryCode,
    BigDecimal monthlyFee,
    RatePlanSalesStatus salesStatus,
    OffsetDateTime saleStartAt
) {
    public static CreateRatePlanResponse from(RatePlan ratePlan) {
        return new CreateRatePlanResponse(
            ratePlan.getId(),
            ratePlan.getRatePlanCode(),
            ratePlan.getName(),
            ratePlan.getCategory().getCode(),
            ratePlan.getMonthlyFee(),
            ratePlan.getSalesStatus(),
            ratePlan.getSaleStartAt()
        );
    }
}
