package com.cj.novabss.role.application;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.PermissionCategory;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.infrastructure.PermissionCategoryRepository;
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
    private final PermissionCategoryRepository permissionCategoryRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;

    public RbacSeedDataInitializer(
        RoleRepository roleRepository,
        PermissionRepository permissionRepository,
        PermissionCategoryRepository permissionCategoryRepository,
        UserRepository userRepository,
        UserRoleRepository userRoleRepository,
        RolePermissionRepository rolePermissionRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.permissionCategoryRepository = permissionCategoryRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now();
        PermissionCategory ratePlanCategory = findOrCreateCategory("RATE_PLAN", "요금제 관리", "요금제와 상품 요금 정책을 관리합니다.", 10, now);
        PermissionCategory otherCategory = findOrCreateCategory("OTHER", "기타", "아직 분류되지 않은 권한입니다.", 999, now);

        Role systemAdmin = findOrCreateRole("SYSTEM_ADMIN", "시스템 관리자", now);
        Role productOperator = findOrCreateRole("PRODUCT_OPERATOR", "상품 운영 담당자", now);
        Role customer = findOrCreateRole("CUSTOMER", "고객", now);

        Permission ratePlanRead = findOrCreatePermission("RATE_PLAN_READ", "요금제 조회", "요금제 목록과 상세 정보를 조회합니다.", ratePlanCategory, now);
        Permission ratePlanCreate = findOrCreatePermission("RATE_PLAN_CREATE", "요금제 생성", "새 요금제를 생성합니다.", ratePlanCategory, now);
        Permission ratePlanUpdate = findOrCreatePermission("RATE_PLAN_UPDATE", "요금제 수정", "기존 요금제 정보를 수정합니다.", ratePlanCategory, now);
        Permission ratePlanDelete = findOrCreatePermission("RATE_PLAN_DELETE", "요금제 삭제", "기존 요금제를 삭제합니다.", ratePlanCategory, now);
        permissionRepository.findAll().stream().filter(permission -> permission.getCategory() == null).forEach(permission -> permission.changeCategory(otherCategory));

        assignRoleIfAbsent(findOrCreateUser("admin@nova.local", "NOVA 관리자", now), systemAdmin, now);
        assignRoleIfAbsent(findOrCreateUser("operator@nova.local", "NOVA 상품 운영자", now), productOperator, now);
        assignRoleIfAbsent(findOrCreateUser("customer@nova.local", "NOVA 고객", now), customer, now);

        assignPermissionIfAbsent(systemAdmin, ratePlanRead, now);
        assignPermissionIfAbsent(systemAdmin, ratePlanCreate, now);
        assignPermissionIfAbsent(systemAdmin, ratePlanUpdate, now);
        assignPermissionIfAbsent(systemAdmin, ratePlanDelete, now);
        assignPermissionIfAbsent(productOperator, ratePlanRead, now);
        assignPermissionIfAbsent(productOperator, ratePlanCreate, now);
        assignPermissionIfAbsent(productOperator, ratePlanUpdate, now);
        assignPermissionIfAbsent(productOperator, ratePlanDelete, now);
        assignPermissionIfAbsent(customer, ratePlanRead, now);
    }

    private Role findOrCreateRole(String roleCode, String name, OffsetDateTime now) {
        return roleRepository.findByRoleCode(roleCode)
            .orElseGet(() -> roleRepository.save(Role.create(roleCode, name, now)));
    }

    private PermissionCategory findOrCreateCategory(String code, String name, String description, int sortOrder, OffsetDateTime now) {
        return permissionCategoryRepository.findByCategoryCode(code)
            .orElseGet(() -> permissionCategoryRepository.save(PermissionCategory.create(code, name, description, sortOrder, now)));
    }

    private Permission findOrCreatePermission(String permissionCode, String name, String description, PermissionCategory category, OffsetDateTime now) {
        return permissionRepository.findByPermissionCode(permissionCode)
            .map(permission -> {
                if (permission.getCategory() == null) permission.changeCategory(category);
                return permission;
            })
            .orElseGet(() -> permissionRepository.save(Permission.create(permissionCode, name, description, category, now)));
    }

    private User findOrCreateUser(String email, String displayName, OffsetDateTime now) {
        return userRepository.findByEmail(email)
            .orElseGet(() -> userRepository.save(User.create(email, passwordEncoder.encode(LOCAL_SEED_PASSWORD), displayName, now)));
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
