package com.cj.novabss.role.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** RBAC 연결 API는 전체 교체와 대상·활성 상태 검증을 HTTP 계약으로 확인한다. */
@SpringBootTest
@AutoConfigureMockMvc
class RbacMappingControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private UserRoleRepository userRoleRepository;
    @Autowired private RolePermissionRepository rolePermissionRepository;

    private Role operatorRole;
    private Role customerRole;
    private Permission readPermission;
    private Permission writePermission;
    private User user;

    @BeforeEach
    void setUp() {
        rolePermissionRepository.deleteAll();
        userRoleRepository.deleteAll();
        permissionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        OffsetDateTime now = OffsetDateTime.now();
        operatorRole = roleRepository.save(Role.create("OPERATOR", "운영자", now));
        customerRole = roleRepository.save(Role.create("CUSTOMER", "고객", now));
        readPermission = permissionRepository.save(Permission.create("PLAN_READ", "요금제 조회", "요금제를 조회합니다.", now));
        writePermission = permissionRepository.save(Permission.create("PLAN_WRITE", "요금제 수정", "요금제를 수정합니다.", now));
        user = userRepository.save(User.create("mapping.user", "unused-test-hash", "매핑 사용자", now));
    }

    @Test
    void assignsSelectedPermissionsWithoutPersistingDuplicateInputIds() throws Exception {
        // 같은 권한 ID를 두 번 전달해도 저장 결과는 한 건이어야 한다.
        String body = "{\"permissionIds\":[%d,%d,%d]}".formatted(writePermission.getId(), readPermission.getId(), readPermission.getId());

        mockMvc.perform(patch("/api/roles/{roleId}/permissions", operatorRole.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.roleId").value(operatorRole.getId()))
            .andExpect(jsonPath("$.permissions.length()").value(2))
            .andExpect(jsonPath("$.permissions[0].permissionCode").value("PLAN_READ"))
            .andExpect(jsonPath("$.permissions[1].permissionCode").value("PLAN_WRITE"));

        mockMvc.perform(get("/api/roles/{roleId}/permissions", operatorRole.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.permissions.length()").value(2));

        assertThat(rolePermissionRepository.findAllByRoleId(operatorRole.getId())).hasSize(2);
    }

    @Test
    void rejectsUnknownAndDisabledPermissionsForRoleMapping() throws Exception {
        // 존재하지 않는 권한은 기존 매핑을 변경하지 않고 404로 거절한다.
        mockMvc.perform(patch("/api/roles/{roleId}/permissions", operatorRole.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"permissionIds\":[999999]}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PERMISSION_NOT_FOUND"));

        writePermission.changeEnabled(false);
        permissionRepository.save(writePermission);
        mockMvc.perform(patch("/api/roles/{roleId}/permissions", operatorRole.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"permissionIds\":[%d]}".formatted(writePermission.getId())))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("PERMISSION_DISABLED"));
    }

    @Test
    void assignsSelectedRolesAndRejectsDisabledRoles() throws Exception {
        // 중복 역할 입력은 하나로 정규화하고, 응답은 역할 코드순으로 확인한다.
        mockMvc.perform(patch("/api/users/{userId}/roles", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roleIds\":[%d,%d,%d]}".formatted(customerRole.getId(), operatorRole.getId(), operatorRole.getId())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(user.getId()))
            .andExpect(jsonPath("$.roles.length()").value(2))
            .andExpect(jsonPath("$.roles[0].roleCode").value("CUSTOMER"))
            .andExpect(jsonPath("$.roles[1].roleCode").value("OPERATOR"));

        operatorRole.changeEnabled(false);
        roleRepository.save(operatorRole);
        mockMvc.perform(patch("/api/users/{userId}/roles", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roleIds\":[%d]}".formatted(operatorRole.getId())))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("ROLE_DISABLED"));

        mockMvc.perform(get("/api/users/{userId}/roles", user.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.roles.length()").value(2));
    }
}
