package com.cj.novabss.role.presentation.dto;

import java.util.List;

/** 역할에 연결할 권한 ID 목록을 전달한다. 빈 목록은 역할의 모든 권한 연결을 해제한다. */
public record AssignSelectedPermissionsToRoleRequest(List<Long> permissionIds) {
}
