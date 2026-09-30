package com.cj.novabss.common.security;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 검증된 JWT의 사용자 식별자로 최신 활성 권한을 조회해 Spring Security 인증 주체를 만든다. */
@Service
public class UserAuthorityService {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public UserAuthorityService(
        UserRepository userRepository,
        UserRoleRepository userRoleRepository,
        RolePermissionRepository rolePermissionRepository
    ) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Transactional(readOnly = true)
    public Authentication authenticate(Long userId) {
        User user = userRepository.findById(userId)
            .filter(User::isActive)
            .orElseThrow(() -> new InvalidAccessTokenException("로그인할 수 없는 사용자입니다."));
        List<SimpleGrantedAuthority> authorities = userRoleRepository.findAllByUserId(user.getId()).stream()
            .map(UserRole::getRole)
            .filter(Role::isEnabled)
            .flatMap(role -> rolePermissionRepository.findAllByRoleId(role.getId()).stream())
            .map(RolePermission::getPermission)
            .filter(Permission::isEnabled)
            .map(Permission::getPermissionCode)
            .distinct()
            .sorted(Comparator.naturalOrder())
            .map(SimpleGrantedAuthority::new)
            .toList();
        return UsernamePasswordAuthenticationToken.authenticated(user.getId().toString(), null, authorities);
    }
}
