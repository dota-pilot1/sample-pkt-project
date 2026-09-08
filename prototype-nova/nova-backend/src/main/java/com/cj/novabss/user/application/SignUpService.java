package com.cj.novabss.user.application;

import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserRepository;
import com.cj.novabss.user.presentation.dto.SignUpRequest;
import com.cj.novabss.user.presentation.dto.SignUpResponse;
import java.time.OffsetDateTime;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** CUSTOMER 기본 역할을 부여하며 활성 계정을 생성한다. */
@Service
public class SignUpService {
    private static final String DEFAULT_ROLE_CODE = "CUSTOMER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public SignUpService(UserRepository userRepository, RoleRepository roleRepository, UserRoleRepository userRoleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SignUpResponse signUp(SignUpRequest request) {
        String loginId = request.loginId().trim().toLowerCase(Locale.ROOT);
        Role defaultRole = roleRepository.findByRoleCode(DEFAULT_ROLE_CODE)
            .orElseThrow(() -> new SignUpException(HttpStatus.SERVICE_UNAVAILABLE, "DEFAULT_ROLE_NOT_FOUND", "회원 기본 역할이 준비되지 않았습니다."));

        if (userRepository.existsByLoginId(loginId)) {
            throw duplicateLoginId();
        }

        User user = User.create(loginId, passwordEncoder.encode(request.password()), request.displayName().trim(), OffsetDateTime.now());
        try {
            User savedUser = userRepository.saveAndFlush(user);
            userRoleRepository.save(UserRole.assign(savedUser, defaultRole, OffsetDateTime.now()));
            return SignUpResponse.from(savedUser, defaultRole.getRoleCode());
        } catch (DataIntegrityViolationException exception) {
            // 사전 조회 사이에 같은 ID가 저장된 경우도 동일한 409 계약으로 반환한다.
            throw duplicateLoginId();
        }
    }

    private SignUpException duplicateLoginId() {
        return new SignUpException(HttpStatus.CONFLICT, "DUPLICATE_LOGIN_ID", "이미 사용 중인 로그인 ID입니다.");
    }
}
