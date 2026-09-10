package com.cj.novabss.role.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.seed.enabled=true")
class RbacSeedDataInitializerTest {
    @Autowired
    private RbacSeedDataInitializer initializer;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Test
    void createsRbacBaselineAndDoesNotDuplicateItWhenRunAgain() {
        assertRbacBaseline();

        initializer.run(new DefaultApplicationArguments());

        assertRbacBaseline();
    }

    private void assertRbacBaseline() {
        assertThat(roleRepository.count()).isEqualTo(3);
        assertThat(permissionRepository.count()).isEqualTo(3);
        assertThat(userRepository.count()).isEqualTo(3);
        assertThat(userRoleRepository.count()).isEqualTo(3);
        assertThat(rolePermissionRepository.count()).isEqualTo(7);

        Role systemAdmin = role("SYSTEM_ADMIN");
        Role productOperator = role("PRODUCT_OPERATOR");
        Role customer = role("CUSTOMER");
        Permission read = permission("RATE_PLAN_READ");
        Permission create = permission("RATE_PLAN_CREATE");
        Permission update = permission("RATE_PLAN_UPDATE");

        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(systemAdmin.getId(), read.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(systemAdmin.getId(), create.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(systemAdmin.getId(), update.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(productOperator.getId(), read.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(productOperator.getId(), create.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(productOperator.getId(), update.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(customer.getId(), read.getId())).isTrue();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(customer.getId(), create.getId())).isFalse();
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(customer.getId(), update.getId())).isFalse();
    }

    private Role role(String roleCode) {
        return roleRepository.findByRoleCode(roleCode).orElseThrow();
    }

    private Permission permission(String permissionCode) {
        return permissionRepository.findByPermissionCode(permissionCode).orElseThrow();
    }
}
