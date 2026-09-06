package com.cj.novabss.plan.presentation.dto;

import java.util.List;

/**
 * 요금제 목록과 페이지 정보를 함께 반환하는 응답 DTO다.
 */
public record RatePlanPageResponse(
    List<RatePlanSummaryResponse> items,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
}
