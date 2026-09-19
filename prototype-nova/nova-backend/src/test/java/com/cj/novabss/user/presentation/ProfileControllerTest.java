package com.cj.novabss.user.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private UserRoleRepository userRoleRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private RolePermissionRepository rolePermissionRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        rolePermissionRepository.deleteAll();
        userRoleRepository.deleteAll();
        permissionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
    }

    @Test
    void returnsOnlyEnabledRolesAndPermissionsForTheRequestedUser() throws Exception {
        OffsetDateTime now = OffsetDateTime.now();
        User user = userRepository.saveAndFlush(User.create("profile@nova.com", passwordEncoder.encode("Valid1!pw"), "프로필 사용자", now));
        Role activeRole = roleRepository.saveAndFlush(Role.create("PRODUCT_OPERATOR", "상품 운영 담당자", now));
        Role disabledRole = roleRepository.saveAndFlush(Role.create("OLD_OPERATOR", "이전 운영 담당자", now));
        disabledRole.changeEnabled(false);
        roleRepository.saveAndFlush(disabledRole);

        Permission activePermission = permissionRepository.saveAndFlush(Permission.create("PLAN_READ", "요금제 조회", "요금제를 조회합니다.", now));
        Permission disabledPermission = permissionRepository.saveAndFlush(Permission.create("PLAN_DELETE", "요금제 삭제", "요금제를 삭제합니다.", now));
        disabledPermission.changeEnabled(false);
        permissionRepository.saveAndFlush(disabledPermission);

        userRoleRepository.save(UserRole.assign(user, activeRole, now));
        userRoleRepository.save(UserRole.assign(user, disabledRole, now));
        rolePermissionRepository.save(RolePermission.assign(activeRole, activePermission, now));
        rolePermissionRepository.save(RolePermission.assign(activeRole, disabledPermission, now));

        mockMvc.perform(get("/api/users/{userId}/profile", user.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.email").value("profile@nova.com"))
            .andExpect(jsonPath("$.roles.length()").value(1))
            .andExpect(jsonPath("$.roles[0].code").value("PRODUCT_OPERATOR"))
            .andExpect(jsonPath("$.roles[0].permissions.length()").value(1))
            .andExpect(jsonPath("$.roles[0].permissions[0].code").value("PLAN_READ"))
            .andExpect(jsonPath("$.permissions.length()").value(1))
            .andExpect(jsonPath("$.permissions[0].code").value("PLAN_READ"));
    }

    @Test
    void returnsNotFoundForUnknownUser() throws Exception {
        mockMvc.perform(get("/api/users/{userId}/profile", 999999L))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"));
    }
}
