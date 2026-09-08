package com.cj.novabss.plan.infrastructure;

import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** 관리자 요금제 목록 SQL 한 행을 받는 조회 전용 DTO다. */
public record RatePlanListRow(
    Long id,
    String ratePlanCode,
    String name,
    String categoryCode,
    String categoryName,
    BigDecimal monthlyFee,
    RatePlanSalesStatus salesStatus,
    OffsetDateTime updatedAt
) {
}
