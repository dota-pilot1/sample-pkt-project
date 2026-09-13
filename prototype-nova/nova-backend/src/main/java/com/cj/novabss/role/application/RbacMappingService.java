package com.cj.novabss.role.application;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserRepository;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 사용자-역할과 역할-권한 연결을 원자적으로 교체하고 조회한다. */
@Service
public class RbacMappingService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public RbacMappingService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PermissionRepository permissionRepository,
        UserRoleRepository userRoleRepository,
        RolePermissionRepository rolePermissionRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Transactional(readOnly = true)
    /** 역할에 이미 연결된 권한 목록을 조회한다. */
    public List<Permission> getAssignedPermissionsForRole(Long roleId) {
        requireRole(roleId);
        return rolePermissionRepository.findAllByRoleId(roleId).stream()
            .map(RolePermission::getPermission)
            .sorted(Comparator.comparing(Permission::getPermissionCode))
            .toList();
    }

    /**
     * 관리자 화면에서 선택한 권한 목록을 역할에 연결한다.
     *
     * <p>먼저 역할과 모든 권한이 존재하고 활성 상태인지 확인한다. 검증이 끝나면 기존 역할-권한
     * 연결을 지우고 선택한 권한만 새로 연결한다. 따라서 요청에 없는 권한은 해당 역할에서 제거된다.</p>
     *
     * @param roleId 권한을 설정할 역할 ID
     * @param permissionIds 역할에 남길 권한 ID 목록
     * @return 저장 후 역할에 연결된 권한 목록
     */
    @Transactional
    public List<Permission> assignSelectedPermissionsToRole(Long roleId, Collection<Long> permissionIds) {
        // 역할과 권한이 있는지 확인한다.
        Role role = requireRole(roleId);
        List<Permission> permissions = findSelectedEnabledPermissions(permissionIds);

        // 체크를 해제한 권한도 제거하기 위해 기존 역할-권한 연결을 모두 지운다.
        rolePermissionRepository.deleteAllByRoleId(role.getId());
        OffsetDateTime now = OffsetDateTime.now();
        // 역할-권한 연결 행 객체를 도메인 함수로 생성한 뒤 한 번에 저장한다.
        List<RolePermission> mappings = permissions.stream()
            .map(permission -> RolePermission.assign(role, permission, now))
            .toList();
        // 만들어진 역할-권한 연결 행을 DB에 한 번에 저장한다.
        rolePermissionRepository.saveRolePermissionMappings(mappings);
        // 연결된 권한 목록을 반환한다.
        return permissions.stream().sorted(Comparator.comparing(Permission::getPermissionCode)).toList();
    }

    @Transactional(readOnly = true)
    /** 사용자에게 이미 연결된 역할 목록을 조회한다. */
    public List<Role> getAssignedRolesForUser(Long userId) {
        requireUser(userId);
        return userRoleRepository.findAllByUserId(userId).stream()
            .map(UserRole::getRole)
            .sorted(Comparator.comparing(Role::getRoleCode))
            .toList();
    }

    /**
     * 관리자 화면에서 선택한 역할 목록을 사용자에 연결한다.
     *
     * <p>사용자와 역할 존재 여부를 확인하고, 비활성 역할은 연결하지 않는다. 검증이 끝나면 기존
     * 사용자-역할 연결을 지우고 선택한 역할만 새로 연결한다. 따라서 요청에 없는 역할은 사용자에게서 제거된다.</p>
     *
     * @param userId 역할을 설정할 사용자 ID
     * @param roleIds 사용자에게 남길 역할 ID 목록
     * @return 저장 후 사용자에 연결된 역할 목록
     */
    @Transactional
    public List<Role> assignSelectedRolesToUser(Long userId, Collection<Long> roleIds) {
        // 역할을 연결할 사용자를 ID로 찾는다. 없으면 USER_NOT_FOUND 오류를 반환한다.
        User user = requireUser(userId);
        // 요청한 역할 중 실제로 존재하고 활성 상태인 역할만 찾는다.
        List<Role> roles = findSelectedEnabledRoles(roleIds);

        // 선택 해제한 역할도 제거하기 위해 기존 사용자-역할 연결을 모두 지운다.
        userRoleRepository.deleteAllByUserId(user.getId());
        // 새 사용자-역할 연결 행에 같은 기준 시각을 기록한다.
        OffsetDateTime now = OffsetDateTime.now();
        // 사용자-역할 연결 행 객체를 도메인 함수로 생성한 뒤 한 번에 저장한다.
        List<UserRole> mappings = roles.stream()
            .map(role -> UserRole.assign(user, role, now))
            .toList();
        // 만들어진 사용자-역할 연결 행을 DB에 한 번에 저장한다.
        userRoleRepository.saveUserRoleMappings(mappings);
        // 저장한 역할을 역할 코드순으로 정렬해 화면과 로그인 응답에서 같은 순서로 보여 준다.
        return roles.stream().sorted(Comparator.comparing(Role::getRoleCode)).toList();
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() ->
            new RbacMappingException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));
    }

    private Role requireRole(Long roleId) {
        return roleRepository.findById(roleId).orElseThrow(() ->
            new RbacMappingException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "역할을 찾을 수 없습니다."));
    }

    /**
     * 사용자가 선택한 역할 ID를 실제로 연결 가능한 활성 역할 목록으로 바꾼다.
     *
     * <p>같은 역할 ID가 여러 번 들어오면 하나로 합치고, 없는 역할은 404 오류로 처리한다.
     * 비활성 역할은 기존 사용자에게 남아 있을 수는 있지만 새로 연결할 수 없으므로 409 오류로 처리한다.</p>
     *
     * @param roleIds 화면 또는 API 요청에서 선택한 역할 ID 목록
     * @return 중복이 제거되고 활성 상태가 확인된 역할 목록
     */
    private List<Role> findSelectedEnabledRoles(Collection<Long> roleIds) {
        // 잘못된 ID를 거절하고, 같은 역할 ID가 여러 번 오면 하나로 합친다.
        Set<Long> distinctRoleIds = validateAndGetDistinctIds(roleIds, "roleIds");
        // 요청한 역할 ID 목록에 해당하는 역할을 DB에서 한 번에 조회한다.
        List<Role> roles = roleRepository.findAllById(distinctRoleIds);
        // 조회 개수가 다르면 요청한 역할 중 DB에 없는 역할이 있다는 뜻이다.
        if (roles.size() != distinctRoleIds.size()) {
            throw new RbacMappingException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "역할을 찾을 수 없습니다.");
        }
        // 비활성 역할은 기존 이력에는 남아도 새 사용자에게는 연결하지 않는다.
        if (roles.stream().anyMatch(role -> !role.isEnabled())) {
            throw new RbacMappingException(HttpStatus.CONFLICT, "ROLE_DISABLED", "비활성 역할은 사용자에게 부여할 수 없습니다.");
        }
        // 사용자에게 실제로 연결할 수 있는 역할만 반환한다.
        return roles;
    }

    /** 선택한 권한 ID로 활성 상태인 권한만 찾는다. */
    private List<Permission> findSelectedEnabledPermissions(Collection<Long> permissionIds) {
        Set<Long> distinctPermissionIds = validateAndGetDistinctIds(permissionIds, "permissionIds");
        List<Permission> permissions = permissionRepository.findAllById(distinctPermissionIds);
        if (permissions.size() != distinctPermissionIds.size()) {
            throw new RbacMappingException(HttpStatus.NOT_FOUND, "PERMISSION_NOT_FOUND", "권한을 찾을 수 없습니다.");
        }
        if (permissions.stream().anyMatch(permission -> !permission.isEnabled())) {
            throw new RbacMappingException(HttpStatus.CONFLICT, "PERMISSION_DISABLED", "비활성 권한은 역할에 부여할 수 없습니다.");
        }
        return permissions;
    }

    /**
     * 요청 ID 목록이 비어 있지 않고 모두 양수인지 확인한 뒤 같은 ID는 하나만 남긴다.
     *
     * <p>중복 ID를 제거하지 않으면 같은 사용자-역할 또는 역할-권한 연결을 두 번 저장하려다
     * 데이터베이스의 중복 제약 조건 오류가 날 수 있다.</p>
     *
     * @param values 역할 또는 권한 ID 목록
     * @param fieldName 오류 메시지에 표시할 요청 필드 이름
     * @return 중복이 제거된 ID 집합
     */
    private Set<Long> validateAndGetDistinctIds(Collection<Long> values, String fieldName) {
        // ID가 없거나 0 이하면 연결할 대상을 찾을 수 없다.
        if (values == null || values.stream().anyMatch(value -> value == null || value < 1)) {
            throw new RbacMappingException(HttpStatus.BAD_REQUEST, "INVALID_MAPPING_IDS", fieldName + "은(는) 1 이상의 ID 목록이어야 합니다.");
        }
        return Set.copyOf(values);
    }
}
