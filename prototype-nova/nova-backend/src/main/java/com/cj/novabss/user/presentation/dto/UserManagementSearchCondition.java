package com.cj.novabss.user.presentation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** GET /api/users의 검색·활성 상태·페이지 query 계약이다. */
public class UserManagementSearchCondition {
    private String keyword;
    private Boolean active;

    @Min(value = 1, message = "page는 1 이상이어야 합니다.")
    private int page = 1;

    @Min(value = 1, message = "size는 1 이상이어야 합니다.")
    @Max(value = 100, message = "size는 100 이하여야 합니다.")
    private int size = 20;

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    /** SQL OFFSET은 0부터 시작하므로 화면의 1-based page를 행 위치로 바꾼다. */
    public long getOffset() {
        return (long) (page - 1) * size;
    }
}
