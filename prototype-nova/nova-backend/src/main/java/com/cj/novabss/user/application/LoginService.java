package com.cj.novabss.user.application;

import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserRepository;
import com.cj.novabss.user.presentation.dto.LoginRequest;
import com.cj.novabss.user.presentation.dto.LoginResponse;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 저장된 BCrypt 해시로 로그인 자격 증명을 확인한다. 토큰 발급은 후속 인증 작업에서 담당한다. */
@Service
public class LoginService {
    private static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginService(UserRepository userRepository, UserRoleRepository userRoleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String loginId = request.loginId().trim().toLowerCase(Locale.ROOT);

        // 사용자 조회
        User user = userRepository.findByLoginId(loginId).orElseThrow(this::invalidCredentials);

        // 비활성 계정과 비밀번호 불일치는 같은 오류 계약으로 반환해 계정 상태를 노출하지 않는다.
        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        // UserRoleRepository는 user_roles의 여러 역할 연결 행을 List<UserRole>로 조회한다.
        // 각 연결 행을 역할 코드로 바꾸고, 응답 순서를 고정한 뒤 List<String>으로 만든다.
        List<String> roleCodes = userRoleRepository.findByUserId(user.getId()).stream()
            .map(userRole -> userRole.getRole().getRoleCode())
            .sorted(Comparator.naturalOrder())
            .toList();
        return LoginResponse.from(user, roleCodes);
    }

    private LoginException invalidCredentials() {
        return new LoginException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS, "로그인 ID 또는 비밀번호가 올바르지 않습니다.");
    }
}
