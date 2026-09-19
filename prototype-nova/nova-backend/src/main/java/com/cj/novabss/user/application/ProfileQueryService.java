package com.cj.novabss.user.application;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserRepository;
import com.cj.novabss.user.presentation.dto.ProfileResponse;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 사용자에게 실제로 적용되는 활성 역할과 권한을 한 번의 프로필 조회 계약으로 제공한다. */
@Service
public class ProfileQueryService {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public ProfileQueryService(
        UserRepository userRepository,
        UserRoleRepository userRoleRepository,
        RolePermissionRepository rolePermissionRepository
    ) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        // 이후 역할·권한 조회의 기준이 되는 사용자이며, 없으면 연결 정보를 노출하지 않는다.
        User user = userRepository.findById(userId).orElseThrow(() ->
            new ProfileQueryException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.")
        );

        // 비활성 역할은 과거 연결 이력으로 남아 있어도 현재 화면의 유효 권한에는 포함하지 않는다.
        List<Role> roles = userRoleRepository.findAllByUserId(userId).stream()
            .map(UserRole::getRole)
            .filter(Role::isEnabled)
            .sorted(Comparator.comparing(Role::getRoleCode))
            .toList();

        // 역할을 선택했을 때 해당 역할의 권한만 보여 줄 수 있도록 역할별 목록을 먼저 만든다.
        Map<Long, List<Permission>> permissionsByRoleId = roles.stream()
            .collect(Collectors.toMap(
                Role::getId,
                role -> rolePermissionRepository.findAllByRoleId(role.getId()).stream()
                    .map(RolePermission::getPermission)
                    .filter(Permission::isEnabled)
                    .sorted(Comparator.comparing(Permission::getPermissionCode))
                    .toList()
            ));

        // 전체 선택은 여러 역할의 같은 권한을 ID 기준으로 한 번만 보여 준다.
        Map<Long, Permission> permissionsById = permissionsByRoleId.values().stream()
            .flatMap(List::stream)
            .collect(Collectors.toMap(Permission::getId, permission -> permission, (left, right) -> left));
        List<Permission> permissions = permissionsById.values().stream()
            .sorted(Comparator.comparing(Permission::getPermissionCode))
            .toList();

        return ProfileResponse.from(user, roles, permissionsByRoleId, permissions);
    }
}
