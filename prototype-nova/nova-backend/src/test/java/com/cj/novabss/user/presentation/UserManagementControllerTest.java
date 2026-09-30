package com.cj.novabss.user.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.user.domain.User;
import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.user.infrastructure.UserRepository;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

/** H2에서 사용자 관리 목록과 계정 상태 변경의 HTTP 계약·영속 결과를 함께 검증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class UserManagementControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private UserRoleRepository userRoleRepository;
    @Autowired private RolePermissionRepository rolePermissionRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // 통합 테스트가 공유하는 H2 DB에서 FK 연결부터 정리해 테스트 순서에 독립적으로 만든다.
        rolePermissionRepository.deleteAll();
        userRoleRepository.deleteAll();
        permissionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
    }

    @Test
    void searchesUsersByKeywordAndActiveStateWithPageMetadata() throws Exception {
        OffsetDateTime now = OffsetDateTime.now();
        User activeUser = userRepository.saveAndFlush(User.create("active@nova.com", passwordEncoder.encode("Valid1!pw"), "활성 노바", now));
        User inactiveUser = userRepository.saveAndFlush(User.create("inactive@nova.com", passwordEncoder.encode("Valid1!pw"), "비활성 노바", now.plusMinutes(1)));
        inactiveUser.changeActive(false, now.plusMinutes(2));
        userRepository.saveAndFlush(inactiveUser);

        mockMvc.perform(get("/api/users").queryParam("keyword", "nova").queryParam("active", "true").queryParam("page", "1").queryParam("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].id").value(activeUser.getId()))
            .andExpect(jsonPath("$.items[0].email").value("active@nova.com"))
            .andExpect(jsonPath("$.items[0].active").value(true))
            .andExpect(jsonPath("$.items[0].passwordHash").doesNotExist())
            .andExpect(jsonPath("$.page").value(1))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void includesAssignedRolesInUserListAndReturnsAccessSummaryForAdminDetail() throws Exception {
        OffsetDateTime now = OffsetDateTime.now();
        User user = userRepository.saveAndFlush(User.create("access@nova.com", passwordEncoder.encode("Valid1!pw"), "권한 대상", now));
        Role role = roleRepository.saveAndFlush(Role.create("PRODUCT_OPERATOR", "상품 운영자", now));
        Permission permission = permissionRepository.saveAndFlush(Permission.create("PLAN_READ", "요금제 조회", "요금제를 조회합니다.", now));
        userRoleRepository.saveAndFlush(UserRole.assign(user, role, now));
        rolePermissionRepository.saveAndFlush(RolePermission.assign(role, permission, now));

        mockMvc.perform(get("/api/users").queryParam("page", "1").queryParam("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].roles.length()").value(1))
            .andExpect(jsonPath("$.items[0].roles[0].roleCode").value("PRODUCT_OPERATOR"));

        mockMvc.perform(get("/api/users/{userId}/access-summary", user.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.roles.length()").value(1))
            .andExpect(jsonPath("$.roles[0].code").value("PRODUCT_OPERATOR"))
            .andExpect(jsonPath("$.roles[0].permissions[0].code").value("PLAN_READ"))
            .andExpect(jsonPath("$.permissions[0].code").value("PLAN_READ"));
    }

    @Test
    void changesAccountActiveStateAndPersistsIt() throws Exception {
        User user = userRepository.saveAndFlush(User.create("manage@nova.com", passwordEncoder.encode("Valid1!pw"), "관리 대상", OffsetDateTime.now()));

        mockMvc.perform(patch("/api/users/{userId}/active", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"active\":false}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.active").value(false));

        assertThat(userRepository.findById(user.getId()).orElseThrow().isActive()).isFalse();
    }

    @Test
    void returnsManagementDetailsWithoutPasswordInformation() throws Exception {
        User user = userRepository.saveAndFlush(User.create("detail@nova.com", passwordEncoder.encode("Valid1!pw"), "상세 대상", OffsetDateTime.now()));

        mockMvc.perform(get("/api/users/{userId}", user.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId()))
            .andExpect(jsonPath("$.email").value("detail@nova.com"))
            .andExpect(jsonPath("$.password").doesNotExist())
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void returnsNotFoundForUnknownUserAndBadRequestForMissingActive() throws Exception {
        mockMvc.perform(patch("/api/users/{userId}/active", 999999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"active\":false}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"));

        mockMvc.perform(patch("/api/users/{userId}/active", 999999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.active").exists());
    }

    @Test
    void rejectsInvalidPageQuery() throws Exception {
        mockMvc.perform(get("/api/users").queryParam("page", "0"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.page").exists());
    }
}
