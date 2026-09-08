package com.cj.novabss.user.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Role;
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

/** H2 인메모리 DB에서 회원 가입의 HTTP 계약과 영속 결과를 함께 검증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class SignUpControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRoleRepository userRoleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRoleRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        roleRepository.save(Role.create("CUSTOMER", "고객", OffsetDateTime.now()));
    }

    @Test
    void createsActiveUserAndCustomerRoleWithHashedPassword() throws Exception {
        mockMvc.perform(post("/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequest("nova.user")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.loginId").value("nova.user"))
            .andExpect(jsonPath("$.displayName").value("노바 사용자"))
            .andExpect(jsonPath("$.active").value(true))
            .andExpect(jsonPath("$.roleCode").value("CUSTOMER"))
            .andExpect(jsonPath("$.password").doesNotExist())
            .andExpect(jsonPath("$.passwordHash").doesNotExist());

        User user = userRepository.findByLoginId("nova.user").orElseThrow();
        assertThat(user.isActive()).isTrue();
        assertThat(user.getPasswordHash()).isNotEqualTo("Valid1!pw");
        assertThat(passwordEncoder.matches("Valid1!pw", user.getPasswordHash())).isTrue();
        // 이 테스트는 CUSTOMER 역할만 준비하므로 생성된 단일 UserRole은 기본 CUSTOMER 역할 관계다.
        // Lazy relation은 ID 기반 repository 검증으로 확인해 웹 요청 종료 뒤 프록시를 초기화하지 않는다.
        assertThat(userRoleRepository.findByUserId(user.getId())).hasSize(1);
        assertThat(userRoleRepository.findByRoleId(roleRepository.findByRoleCode("CUSTOMER").orElseThrow().getId())).hasSize(1);
    }

    @Test
    void normalizesLoginIdAndRejectsDuplicateWithoutCreatingAnotherUser() throws Exception {
        mockMvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON).content(validRequest("Nova.User")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.loginId").value("nova.user"));

        mockMvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON).content(validRequest("nova.user")))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("DUPLICATE_LOGIN_ID"))
            .andExpect(jsonPath("$.fieldErrors").isEmpty());

        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(userRoleRepository.count()).isEqualTo(1);
    }

    @Test
    void returnsFieldErrorsForInvalidRequiredOrFormattedValues() throws Exception {
        String invalidRequest = """
            {"loginId":"1", "password":"short", "displayName":""}
            """;

        mockMvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON).content(invalidRequest))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.loginId").exists())
            .andExpect(jsonPath("$.fieldErrors.password").exists())
            .andExpect(jsonPath("$.fieldErrors.displayName").exists());
    }

    @Test
    void returnsServiceUnavailableWithoutCreatingUserWhenDefaultRoleIsMissing() throws Exception {
        roleRepository.deleteAll();

        mockMvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON).content(validRequest("missing.role")))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.code").value("DEFAULT_ROLE_NOT_FOUND"));

        assertThat(userRepository.count()).isZero();
        assertThat(userRoleRepository.count()).isZero();
    }

    private String validRequest(String loginId) {
        return """
            {"loginId":"%s", "password":"Valid1!pw", "displayName":"노바 사용자"}
            """.formatted(loginId);
    }
}
