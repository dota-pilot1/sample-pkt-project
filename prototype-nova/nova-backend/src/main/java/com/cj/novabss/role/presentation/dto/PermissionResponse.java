package com.cj.novabss.role.presentation.dto;

import com.cj.novabss.role.domain.Permission;
import java.time.OffsetDateTime;

/** 목록·상세·변경 API가 공유하는 권한 응답 계약이다. */
public record PermissionResponse(
    Long id,
    String permissionCode,
    String name,
    String description,
    boolean enabled,
    OffsetDateTime createdAt
) {
    public static PermissionResponse from(Permission permission) {
        return new PermissionResponse(
            permission.getId(),
            permission.getPermissionCode(),
            permission.getName(),
            permission.getDescription(),
            permission.isEnabled(),
            permission.getCreatedAt()
        );
    }
}
