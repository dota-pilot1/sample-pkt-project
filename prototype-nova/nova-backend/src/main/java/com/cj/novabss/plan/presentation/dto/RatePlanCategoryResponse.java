package com.cj.novabss.plan.presentation.dto;

/**
 * 활성화된 요금제 분류를 API로 반환하는 응답 DTO다.
 */
public record RatePlanCategoryResponse(
    Long id,
    String code,
    String name,
    int sortOrder
) {
}
