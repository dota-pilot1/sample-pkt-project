package com.cj.novabss.user.presentation.dto;

import java.util.List;

/** 사용자 관리 목록과 페이지 메타데이터를 함께 반환한다. */
public record UserPageResponse(
    List<UserSummaryResponse> items,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
}
