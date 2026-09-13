package com.cj.novabss.role.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.role.presentation.dto.CreateRoleRequest;
import com.cj.novabss.role.presentation.dto.UpdateRoleEnabledRequest;
import com.cj.novabss.role.presentation.dto.UpdateRoleRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** 역할은 삭제하지 않고 수정·비활성화로 관리하는 API 계약을 H2에서 검증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class RoleControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRoleRepository userRoleRepository;
    @Autowired private RolePermissionRepository rolePermissionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        rolePermissionRepository.deleteAll();
        userRoleRepository.deleteAll();
        roleRepository.deleteAll();
    }

    @Test
    void createsRolesAndRejectsInvalidOrDuplicateCodes() throws Exception {
        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateRoleRequest("bad", "콘텐츠 관리자"))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateRoleRequest("CONTENT_MANAGER", "콘텐츠 관리자"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.roleCode").value("CONTENT_MANAGER"))
            .andExpect(jsonPath("$.name").value("콘텐츠 관리자"))
            .andExpect(jsonPath("$.enabled").value(true));

        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateRoleRequest("CONTENT_MANAGER", "중복 관리자"))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("DUPLICATE_ROLE_CODE"));
    }

    @Test
    void getsRolesInRoleCodeOrderAndReturnsRoleEnabledState() throws Exception {
        roleRepository.save(Role.create("SYSTEM_ADMIN", "시스템 관리자", OffsetDateTime.now()));
        Role contentManager = roleRepository.save(Role.create("CONTENT_MANAGER", "콘텐츠 관리자", OffsetDateTime.now()));
        contentManager.changeEnabled(false);
        roleRepository.save(contentManager);

        mockMvc.perform(get("/api/roles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].roleCode").value("CONTENT_MANAGER"))
            .andExpect(jsonPath("$[0].enabled").value(false))
            .andExpect(jsonPath("$[1].roleCode").value("SYSTEM_ADMIN"));

        mockMvc.perform(get("/api/roles/{roleId}", contentManager.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.enabled").value(false));
    }

    @Test
    void updatesRoleNameAndChangesEnabledStateWithoutDeletingTheRole() throws Exception {
        Role role = roleRepository.save(Role.create("CONTENT_MANAGER", "콘텐츠 관리자", OffsetDateTime.now()));

        mockMvc.perform(patch("/api/roles/{roleId}", role.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateRoleRequest("콘텐츠 운영 관리자"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.roleCode").value("CONTENT_MANAGER"))
            .andExpect(jsonPath("$.name").value("콘텐츠 운영 관리자"))
            .andExpect(jsonPath("$.enabled").value(true));

        mockMvc.perform(patch("/api/roles/{roleId}/enabled", role.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateRoleEnabledRequest(false))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.enabled").value(false));

        Role changedRole = roleRepository.findById(role.getId()).orElseThrow();
        assertThat(changedRole.getName()).isEqualTo("콘텐츠 운영 관리자");
        assertThat(changedRole.isEnabled()).isFalse();
    }

    @Test
    void rejectsInvalidUpdatesAndMissingRoles() throws Exception {
        Role role = roleRepository.save(Role.create("CONTENT_MANAGER", "콘텐츠 관리자", OffsetDateTime.now()));

        mockMvc.perform(patch("/api/roles/{roleId}", role.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateRoleRequest(""))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.name").exists());

        mockMvc.perform(patch("/api/roles/{roleId}/enabled", 999_999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateRoleEnabledRequest(false))))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ROLE_NOT_FOUND"));
    }

    @Test
    void rejectsRoleDeletionAndKeepsTheRole() throws Exception {
        Role role = roleRepository.save(Role.create("TEMPORARY_ROLE", "임시 역할", OffsetDateTime.now()));

        mockMvc.perform(delete("/api/roles/{roleId}", role.getId()))
            .andExpect(status().isMethodNotAllowed())
            .andExpect(jsonPath("$.code").value("ROLE_DELETION_DISABLED"));

        assertThat(roleRepository.findById(role.getId())).isPresent();
    }
}
