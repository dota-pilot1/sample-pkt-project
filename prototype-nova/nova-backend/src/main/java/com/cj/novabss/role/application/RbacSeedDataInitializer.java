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
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 로컬 프로토타입의 RBAC 기준 데이터를 한 번에 준비한다.
 * 운영 데이터는 이 초기화기가 아니라 별도 배포·마이그레이션 절차로 관리한다.
 */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class RbacSeedDataInitializer implements ApplicationRunner {
    private static final String LOCAL_SEED_PASSWORD = "local-seed-only";

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;

    public RbacSeedDataInitializer(
        RoleRepository roleRepository,
        PermissionRepository permissionRepository,
        UserRepository userRepository,
        UserRoleRepository userRoleRepository,
        RolePermissionRepository rolePermissionRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now();

        Role systemAdmin = findOrCreateRole("SYSTEM_ADMIN", "시스템 관리자", now);
        Role productOperator = findOrCreateRole("PRODUCT_OPERATOR", "상품 운영 담당자", now);
        Role customer = findOrCreateRole("CUSTOMER", "고객", now);

        Permission ratePlanRead = findOrCreatePermission("RATE_PLAN_READ", "요금제 조회", "요금제 목록과 상세 정보를 조회합니다.", now);
        Permission ratePlanCreate = findOrCreatePermission("RATE_PLAN_CREATE", "요금제 생성", "새 요금제를 생성합니다.", now);
        Permission ratePlanUpdate = findOrCreatePermission("RATE_PLAN_UPDATE", "요금제 수정", "기존 요금제 정보를 수정합니다.", now);

        assignRoleIfAbsent(findOrCreateUser("admin", "NOVA 관리자", now), systemAdmin, now);
        assignRoleIfAbsent(findOrCreateUser("operator", "NOVA 상품 운영자", now), productOperator, now);
        assignRoleIfAbsent(findOrCreateUser("customer", "NOVA 고객", now), customer, now);

        assignPermissionIfAbsent(systemAdmin, ratePlanRead, now);
        assignPermissionIfAbsent(systemAdmin, ratePlanCreate, now);
        assignPermissionIfAbsent(systemAdmin, ratePlanUpdate, now);
        assignPermissionIfAbsent(productOperator, ratePlanRead, now);
        assignPermissionIfAbsent(productOperator, ratePlanCreate, now);
        assignPermissionIfAbsent(productOperator, ratePlanUpdate, now);
        assignPermissionIfAbsent(customer, ratePlanRead, now);
    }

    private Role findOrCreateRole(String roleCode, String name, OffsetDateTime now) {
        return roleRepository.findByRoleCode(roleCode)
            .orElseGet(() -> roleRepository.save(Role.create(roleCode, name, now)));
    }

    private Permission findOrCreatePermission(String permissionCode, String name, String description, OffsetDateTime now) {
        return permissionRepository.findByPermissionCode(permissionCode)
            .orElseGet(() -> permissionRepository.save(Permission.create(permissionCode, name, description, now)));
    }

    private User findOrCreateUser(String loginId, String displayName, OffsetDateTime now) {
        return userRepository.findByLoginId(loginId)
            .orElseGet(() -> userRepository.save(User.create(loginId, passwordEncoder.encode(LOCAL_SEED_PASSWORD), displayName, now)));
    }

    private void assignRoleIfAbsent(User user, Role role, OffsetDateTime now) {
        if (!userRoleRepository.existsByUserIdAndRoleId(user.getId(), role.getId())) {
            userRoleRepository.save(UserRole.assign(user, role, now));
        }
    }

    private void assignPermissionIfAbsent(Role role, Permission permission, OffsetDateTime now) {
        if (!rolePermissionRepository.existsByRoleIdAndPermissionId(role.getId(), permission.getId())) {
            rolePermissionRepository.save(RolePermission.assign(role, permission, now));
        }
    }
}
