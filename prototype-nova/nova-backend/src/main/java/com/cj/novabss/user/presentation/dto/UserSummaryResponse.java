package com.cj.novabss.user.presentation.dto;

import com.cj.novabss.user.domain.User;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.presentation.dto.RoleResponse;
import java.time.OffsetDateTime;
import java.util.List;

/** 사용자 관리 화면에서 표시할 계정 정보이며 비밀번호 정보는 포함하지 않는다. */
public record UserSummaryResponse(
    Long id,
    String email,
    String displayName,
    boolean active,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<RoleResponse> roles
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
            user.getId(), user.getEmail(), user.getDisplayName(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt(), List.of()
        );
    }

    public static UserSummaryResponse from(User user, List<Role> roles) {
        return new UserSummaryResponse(
            user.getId(), user.getEmail(), user.getDisplayName(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt(),
            roles.stream().map(RoleResponse::from).toList()
        );
    }

    public static UserSummaryResponse from(
        Long id,
        String email,
        String displayName,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<Role> roles
    ) {
        return new UserSummaryResponse(
            id, email, displayName, active, createdAt, updatedAt,
            roles.stream().map(RoleResponse::from).toList()
        );
    }
}
