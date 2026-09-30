package com.cj.novabss.user.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.Permission;
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
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

/** 로그인 API는 가입된 사용자와 BCrypt 해시를 기준으로만 인증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class LoginControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRoleRepository userRoleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private RolePermissionRepository rolePermissionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Role customerRole;

    @BeforeEach
    void setUp() {
        rolePermissionRepository.deleteAll();
        userRoleRepository.deleteAll();
        permissionRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        customerRole = roleRepository.save(Role.create("CUSTOMER", "고객", OffsetDateTime.now()));
    }

    @Test
    void logsInActiveUserWithNormalizedEmailAndRoleCodes() throws Exception {
        saveUser("nova.user@company.com", "Valid1!pw", true);

        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"Nova.User@Company.com\",\"password\":\"Valid1!pw\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("nova.user@company.com"))
            .andExpect(jsonPath("$.displayName").value("노바 사용자"))
            .andExpect(jsonPath("$.roleCodes[0]").value("CUSTOMER"))
            .andExpect(jsonPath("$.accessToken").isString())
            .andExpect(jsonPath("$.expiresAt").exists())
            .andExpect(jsonPath("$.password").doesNotExist())
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void issuesAccessTokenThatCanCallAuthorizedRatePlanApi() throws Exception {
        saveUser("reader@nova.com", "Valid1!pw", true);
        Permission readPermission = permissionRepository.saveAndFlush(
            Permission.create("RATE_PLAN_READ", "요금제 조회", "요금제 목록을 조회합니다.", OffsetDateTime.now())
        );
        rolePermissionRepository.saveAndFlush(RolePermission.assign(customerRole, readPermission, OffsetDateTime.now()));

        String response = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"reader@nova.com\",\"password\":\"Valid1!pw\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String token = response.replaceFirst("(?s).*\\\"accessToken\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mockMvc.perform(get("/api/plans").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    void returnsSameUnauthorizedResponseForUnknownEmailWrongPasswordAndInactiveUser() throws Exception {
        saveUser("active.user@company.com", "Valid1!pw", true);
        saveUser("inactive.user@company.com", "Valid1!pw", false);

        assertInvalidCredentials("unknown.user@company.com", "Valid1!pw");
        assertInvalidCredentials("active.user@company.com", "Wrong1!pw");
        assertInvalidCredentials("inactive.user@company.com", "Valid1!pw");
    }

    @Test
    void returnsFieldErrorsForInvalidRequest() throws Exception {
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"not-an-email\",\"password\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.email").exists())
            .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    private void assertInvalidCredentials(String email, String password) throws Exception {
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
            .andExpect(jsonPath("$.fieldErrors").isEmpty());
    }

    private void saveUser(String email, String password, boolean active) {
        OffsetDateTime now = OffsetDateTime.now();
        User user = User.create(email, passwordEncoder.encode(password), "노바 사용자", now);
        if (!active) user.deactivate(now);
        User savedUser = userRepository.saveAndFlush(user);
        userRoleRepository.save(UserRole.assign(savedUser, customerRole, now));
    }
}
