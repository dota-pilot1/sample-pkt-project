package com.cj.novabss.role.presentation.dto;

import com.cj.novabss.role.domain.Role;
import java.time.OffsetDateTime;

/** 역할 생성·조회·수정 API가 반환하는 역할 기준 정보다. */
public record RoleResponse(Long id, String roleCode, String name, boolean enabled, OffsetDateTime createdAt) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getRoleCode(), role.getName(), role.isEnabled(), role.getCreatedAt());
    }
}
