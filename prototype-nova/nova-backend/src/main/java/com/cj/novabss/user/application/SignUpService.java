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
        // Nova.User와 nova.user를 같은 로그인 ID로 보도록 소문자로 맞춘다.
        String loginId = request.loginId().trim().toLowerCase(Locale.ROOT);
        // 가입시키기 전에 CUSTOMER 기본 역할이 준비되어 있는지 먼저 확인한다.
        Role defaultRole = roleRepository.findByRoleCode(DEFAULT_ROLE_CODE)
            .orElseThrow(() -> new SignUpException(HttpStatus.SERVICE_UNAVAILABLE, "DEFAULT_ROLE_NOT_FOUND", "회원 기본 역할이 준비되지 않았습니다."));

        // 이미 같은 로그인 ID가 있으면 새 사용자를 만들지 않는다.
        if (userRepository.existsByLoginId(loginId)) {
            throw duplicateLoginId();
        }

        // 입력한 비밀번호 대신 BCrypt로 바꾼 값만 User에 넣는다.
        User user = User.create(loginId, passwordEncoder.encode(request.password()), request.displayName().trim(), OffsetDateTime.now());
        try {
            // 1. 먼저 사용자를 저장하고, 같은 ID가 동시에 들어왔는지도 DB에서 바로 확인한다.
            User savedUser = userRepository.saveAndFlush(user);
            // 2. 저장한 사용자에게 CUSTOMER 기본 역할을 연결한다.
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
