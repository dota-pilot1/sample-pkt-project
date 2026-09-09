package com.cj.novabss.user.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.UserRole;
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
    @Autowired private PasswordEncoder passwordEncoder;

    private Role customerRole;

    @BeforeEach
    void setUp() {
        userRoleRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        customerRole = roleRepository.save(Role.create("CUSTOMER", "고객", OffsetDateTime.now()));
    }

    @Test
    void logsInActiveUserWithNormalizedLoginIdAndRoleCodes() throws Exception {
        saveUser("nova.user", "Valid1!pw", true);

        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"Nova.User\",\"password\":\"Valid1!pw\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.loginId").value("nova.user"))
            .andExpect(jsonPath("$.displayName").value("노바 사용자"))
            .andExpect(jsonPath("$.roleCodes[0]").value("CUSTOMER"))
            .andExpect(jsonPath("$.password").doesNotExist())
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void returnsSameUnauthorizedResponseForUnknownIdWrongPasswordAndInactiveUser() throws Exception {
        saveUser("active.user", "Valid1!pw", true);
        saveUser("inactive.user", "Valid1!pw", false);

        assertInvalidCredentials("unknown.user", "Valid1!pw");
        assertInvalidCredentials("active.user", "Wrong1!pw");
        assertInvalidCredentials("inactive.user", "Valid1!pw");
    }

    @Test
    void returnsFieldErrorsForInvalidRequest() throws Exception {
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"1\",\"password\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.loginId").exists())
            .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    private void assertInvalidCredentials(String loginId, String password) throws Exception {
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"%s\",\"password\":\"%s\"}".formatted(loginId, password)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
            .andExpect(jsonPath("$.fieldErrors").isEmpty());
    }

    private void saveUser(String loginId, String password, boolean active) {
        OffsetDateTime now = OffsetDateTime.now();
        User user = User.create(loginId, passwordEncoder.encode(password), "노바 사용자", now);
        if (!active) user.deactivate(now);
        User savedUser = userRepository.saveAndFlush(user);
        userRoleRepository.save(UserRole.assign(savedUser, customerRole, now));
    }
}
