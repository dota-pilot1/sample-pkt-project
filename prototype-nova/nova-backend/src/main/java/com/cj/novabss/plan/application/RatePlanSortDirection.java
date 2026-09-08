package com.cj.novabss.plan.application;

/** 외부 query에서 허용하는 정렬 방향이다. */
public enum RatePlanSortDirection {
    ASC,
    DESC;

    public static RatePlanSortDirection fromParameter(String value) {
        if (value == null || value.isBlank()) {
            throw new RatePlanQueryException("INVALID_DIRECTION", "정렬 방향은 asc 또는 desc여야 합니다.");
        }
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new RatePlanQueryException("INVALID_DIRECTION", "정렬 방향은 asc 또는 desc여야 합니다.");
        }
    }
}
