package com.cj.novabss.user.application;

import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserRepository;
import java.time.OffsetDateTime;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/**
 * 로컬 프로토타입에서 역할별 화면·인가 흐름을 검증할 최소 사용자와 역할을 준비한다.
 * 실제 로그인 자격 증명은 인증 구현 작업에서 별도로 관리한다.
 */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class SecuritySeedDataInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public SecuritySeedDataInitializer(
        RoleRepository roleRepository,
        UserRepository userRepository,
        UserRoleRepository userRoleRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now();

        Role systemAdmin = findOrCreateRole("SYSTEM_ADMIN", "시스템 관리자", now);
        Role productOperator = findOrCreateRole("PRODUCT_OPERATOR", "상품 운영 담당자", now);
        Role customer = findOrCreateRole("CUSTOMER", "고객", now);

        assignRoleIfAbsent(findOrCreateUser("admin", "NOVA 관리자", now), systemAdmin, now);
        assignRoleIfAbsent(findOrCreateUser("operator", "NOVA 상품 운영자", now), productOperator, now);
        assignRoleIfAbsent(findOrCreateUser("customer", "NOVA 고객", now), customer, now);
    }

    private Role findOrCreateRole(String roleCode, String name, OffsetDateTime now) {
        return roleRepository.findByRoleCode(roleCode)
            .orElseGet(() -> roleRepository.save(Role.create(roleCode, name, now)));
    }

    private User findOrCreateUser(String loginId, String displayName, OffsetDateTime now) {
        return userRepository.findByLoginId(loginId)
            .orElseGet(() -> userRepository.save(User.create(loginId, passwordEncoder.encode("local-seed-only"), displayName, now)));
    }

    private void assignRoleIfAbsent(User user, Role role, OffsetDateTime now) {
        if (userRoleRepository.existsByUserIdAndRoleId(user.getId(), role.getId())) {
            return;
        }
        userRoleRepository.save(UserRole.assign(user, role, now));
    }
}
