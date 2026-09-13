package com.cj.novabss.role.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.RoleRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** 권한 삭제의 성공·미존재·역할 연결 상태를 서로 독립적으로 검증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class PermissionDeletionControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @BeforeEach
    void setUp() {
        // FK 의존 순서대로 정리해 각 삭제 시나리오가 독립된 데이터에서 시작하게 한다.
        rolePermissionRepository.deleteAll();
        permissionRepository.deleteAll();
        roleRepository.deleteAll();
    }

    @Test
    @DisplayName("역할에 연결되지 않은 권한을 삭제한다")
    void deletesUnassignedPermission() throws Exception {
        Permission permission = permissionRepository.save(
            Permission.create("PLAN_DELETE", "요금제 삭제", "요금제를 삭제합니다.", OffsetDateTime.now())
        );

        mockMvc.perform(delete("/api/permissions/{id}", permission.getId()))
            .andExpect(status().isNoContent());

        assertThat(permissionRepository.findById(permission.getId())).isEmpty();
    }

    @Test
    @DisplayName("없는 권한을 삭제하면 권한 없음 오류를 반환한다")
    void returnsNotFoundForMissingPermission() throws Exception {
        mockMvc.perform(delete("/api/permissions/{id}", 9999))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PERMISSION_NOT_FOUND"));
    }

    @Test
    @DisplayName("역할에 연결된 권한 삭제를 거절하고 연결을 보존한다")
    void rejectsDeletionOfAssignedPermission() throws Exception {
        Role role = roleRepository.save(Role.create("PLAN_MANAGER", "요금제 관리자", OffsetDateTime.now()));
        Permission permission = permissionRepository.save(
            Permission.create("PLAN_DELETE", "요금제 삭제", "요금제를 삭제합니다.", OffsetDateTime.now())
        );
        rolePermissionRepository.save(RolePermission.assign(role, permission, OffsetDateTime.now()));

        mockMvc.perform(delete("/api/permissions/{id}", permission.getId()))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("PERMISSION_IN_USE"));

        assertThat(permissionRepository.findById(permission.getId())).isPresent();
        assertThat(rolePermissionRepository.existsByPermissionId(permission.getId())).isTrue();
    }
}
