package com.cj.novabss.user.infrastructure;

import java.time.OffsetDateTime;

/** 사용자 관리 목록 SQL 한 행을 받는 조회 전용 DTO다. */
public record UserManagementListRow(
    Long id,
    String email,
    String displayName,
    boolean active,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
