package com.cj.novabss.plan.presentation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** GET /api/plans의 선택 필터·페이지·정렬 query parameter를 묶는 조회 조건 DTO다. */
public class RatePlanSearchCondition {
    private String keyword;
    private String categoryCode;
    private String status;

    @Min(value = 1, message = "page는 1 이상이어야 합니다.")
    private int page = 1;

    @Min(value = 1, message = "size는 1 이상이어야 합니다.")
    @Max(value = 100, message = "size는 100 이하여야 합니다.")
    private int size = 20;

    private String sort = "ratePlanCode";
    private String direction = "asc";

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    /** MyBatis OFFSET에 사용할 0-based 행 위치다. */
    public long getOffset() {
        return Math.multiplyExact((long) page - 1, size);
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }
}
