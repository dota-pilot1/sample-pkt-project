package com.cj.novabss.user.presentation.dto;

import com.cj.novabss.user.domain.User;
import java.time.OffsetDateTime;

/** 회원 가입 성공 응답. 비밀번호 및 passwordHash는 API 계약에 포함하지 않는다. */
public record SignUpResponse(
    Long id,
    String loginId,
    String displayName,
    boolean active,
    String roleCode,
    OffsetDateTime createdAt
) {
    public static SignUpResponse from(User user, String roleCode) {
        return new SignUpResponse(user.getId(), user.getLoginId(), user.getDisplayName(), user.isActive(), roleCode, user.getCreatedAt());
    }
}
