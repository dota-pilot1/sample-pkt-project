package com.cj.novabss.role.presentation.dto;

import java.util.List;

/** 사용자 하나와 연결된 역할 목록을 함께 반환하는 관리자용 매핑 응답이다. */
public record UserRoleMappingResponse(Long userId, List<RoleResponse> roles) {
    public static UserRoleMappingResponse from(Long userId, List<RoleResponse> roles) {
        return new UserRoleMappingResponse(userId, roles);
    }
}
