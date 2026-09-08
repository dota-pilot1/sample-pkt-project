package com.cj.novabss.plan.application;

/** 외부 query에서 허용하는 요금제 목록 정렬 필드다. */
public enum RatePlanSortField {
    RATE_PLAN_CODE("ratePlanCode"),
    NAME("name"),
    MONTHLY_FEE("monthlyFee"),
    UPDATED_AT("updatedAt");

    private final String parameter;

    RatePlanSortField(String parameter) {
        this.parameter = parameter;
    }

    public String getParameter() {
        return parameter;
    }

    public static RatePlanSortField fromParameter(String value) {
        if (value == null || value.isBlank()) {
            throw new RatePlanQueryException("INVALID_SORT", "정렬 필드는 비워 둘 수 없습니다.");
        }
        for (RatePlanSortField field : values()) {
            if (field.parameter.equals(value)) return field;
        }
        throw new RatePlanQueryException("INVALID_SORT", "허용되지 않은 정렬 필드입니다.");
    }
}
