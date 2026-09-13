package com.cj.novabss.role.presentation.dto;

import java.util.List;

/** 역할 하나와 연결된 권한 목록을 함께 반환하는 관리자용 매핑 응답이다. */
public record RolePermissionMappingResponse(Long roleId, List<PermissionResponse> permissions) {
    public static RolePermissionMappingResponse from(Long roleId, List<PermissionResponse> permissions) {
        return new RolePermissionMappingResponse(roleId, permissions);
    }
}
