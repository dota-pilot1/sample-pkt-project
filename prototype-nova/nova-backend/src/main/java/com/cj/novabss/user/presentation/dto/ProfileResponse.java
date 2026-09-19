package com.cj.novabss.user.presentation.dto;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.user.domain.User;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/** 로그인 세션의 사용자 ID로 조회하는 읽기 전용 프로필 응답이다. */
public record ProfileResponse(
    Long id,
    String email,
    String displayName,
    boolean active,
    OffsetDateTime createdAt,
    List<RoleSummary> roles,
    List<PermissionSummary> permissions
) {
    public static ProfileResponse from(
        User user,
        List<Role> roles,
        Map<Long, List<Permission>> permissionsByRoleId,
        List<Permission> permissions
    ) {
        return new ProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.isActive(),
            user.getCreatedAt(),
            roles.stream().map(role -> new RoleSummary(
                role.getRoleCode(),
                role.getName(),
                permissionsByRoleId.getOrDefault(role.getId(), List.of()).stream().map(PermissionSummary::from).toList()
            )).toList(),
            permissions.stream().map(PermissionSummary::from).toList()
        );
    }

    public record RoleSummary(String code, String name, List<PermissionSummary> permissions) {}

    public record PermissionSummary(String code, String name, String description) {
        private static PermissionSummary from(Permission permission) {
            return new PermissionSummary(permission.getPermissionCode(), permission.getName(), permission.getDescription());
        }
    }
}
